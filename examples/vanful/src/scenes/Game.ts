import Phaser from 'phaser';
import { CFG } from '../config';
import { Cargo } from '../logic/cargo';
import { bestRoute, buildCity, City, nodeXY, path, routeMinutes } from '../logic/city';
import { blockedForStop, simulateUnload } from '../logic/door';
import { makeRng, Rng } from '../logic/rng';
import { generateRound, Parcel, RoundDef, STOP_LETTERS, tutorialRound } from '../logic/round';
import { bounds, Cell, rotate } from '../logic/shapes';
import { sfx } from '../sfx';
import { getBest, getDaily, getPaint, getStreak, setBest, setDaily, setStreak, setTutorialDone } from '../storage';
import { dateKey, dayNumber, nextStreak, RoundResult, seedFor } from '../logic/daily';
import { PAINTS } from '../paints';
import { track } from '../track';
import { C, HEX, STOP_TEXT } from '../theme';
import { button, Button, muteButton, popup, REDUCED, text } from '../ui';
import type { ShiftResult } from './GameOver';

type Phase = 'pack' | 'route' | 'drive' | 'result' | 'over';

interface ParcelView {
  p: Parcel;
  shape: Cell[];
  c: Phaser.GameObjects.Container;
  placed: { x: number; y: number } | null;
  trayScale: number;
}

interface Drag {
  v: ParcelView;
  downX: number;
  downY: number;
  moved: boolean;
  grab: { x: number; y: number }; // grabbed point in cell units
  lift: number;
}

const CELL = CFG.CELL;
const TRAY_BOTTOM = 1140;

export class GameScene extends Phaser.Scene {
  private rng!: Rng;
  private phase: Phase = 'pack';
  private clock = 0;
  private score = 0;
  private roundN = 0;
  private delivered = 0;
  private round!: RoundDef;
  private cargo!: Cargo;
  private views: ParcelView[] = [];
  private drag: Drag | null = null;
  private order: number[] = [];
  private roundStats = { deliveredPts: 0, delivered: 0, blocked: 0 };

  // layout
  private GX = 0;
  private GY = 230;

  // objects
  private packLayer!: Phaser.GameObjects.Container;
  private routeLayer!: Phaser.GameObjects.Container;
  private ghost!: Phaser.GameObjects.Graphics;
  private clockText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private trayText!: Phaser.GameObjects.Text;
  private goBtn!: Button;

  // tutorial (guided first delivery)
  private tutorial = false;
  private tutStep = -1;
  private rotated = false;
  private placedStack: number[] = [];
  private undoBtn?: Button;

  constructor() {
    super('Game');
  }

  // daily load + cosmetics
  private daily = false;
  private dayKey = '';
  private results: RoundResult[] = [];
  private vanColor = C.primary;

  init(data: { tutorial?: boolean; daily?: boolean }) {
    this.tutorial = !!data?.tutorial;
    this.daily = !!data?.daily && !this.tutorial;
  }

  create() {
    this.tutStep = -1;
    this.rotated = false;
    this.placedStack = [];
    track(this.tutorial ? 'tutorial_start' : 'shift_start');
    this.dayKey = dateKey();
    this.results = [];
    this.vanColor = (PAINTS.find((p) => p.id === getPaint()) ?? PAINTS[0]).body;
    // The Daily Load: everyone gets the same rounds today (rounds only use this RNG).
    this.rng = makeRng(this.daily ? seedFor(this.dayKey) : (Date.now() ^ (Math.random() * 1e9)) >>> 0);
    if (this.daily) track('daily_start', { day: dayNumber(this.dayKey) });
    this.phase = 'pack';
    this.clock = CFG.SHIFT_SECONDS;
    // Test-only: short shifts for end-to-end tests. Compiled out unless built with VITE_E2E=1.
    if (import.meta.env.VITE_E2E) {
      const s = Number(new URLSearchParams(location.search).get('shift'));
      if (s > 0) this.clock = s;
    }
    this.score = 0;
    this.roundN = 0;
    this.delivered = 0;
    this.views = [];
    this.drag = null;

    this.input.mouse?.disableContextMenu();
    this.drawTopBar();
    this.hintText = text(this, CFG.WIDTH / 2, 142, '', 26, { color: HEX.fg, weight: '700', wrap: 660 });

    this.packLayer = this.add.container(0, 0);
    this.routeLayer = this.add.container(0, 0).setVisible(false);

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onMove(p));
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.onUp(p));
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.drag && p.rightButtonDown()) this.rotateDragged();
    });
    // keyboard parity: Q/E/R rotate while dragging, Space/Enter advance, Z undo
    for (const k of ['R', 'Q', 'E']) this.input.keyboard?.on(`keydown-${k}`, () => this.drag && this.rotateDragged());
    const advance = () => this.advance();
    this.input.keyboard?.on('keydown-SPACE', advance);
    this.input.keyboard?.on('keydown-ENTER', advance);
    this.input.keyboard?.on('keydown-Z', () => this.undo());
    this.input.keyboard?.on('keydown-BACKSPACE', () => this.undo());

    if (this.tutorial) {
      const skip = text(this, 530, 52, 'Skip ›', 30, { display: true, color: HEX.white }).setInteractive({ useHandCursor: true });
      skip.on('pointerup', () => this.finishTutorial(true));
      this.scoreText.setVisible(false);
    }

    this.nextRound();
  }

  update(_t: number, dt: number) {
    if (!this.tutorial && (this.phase === 'pack' || this.phase === 'route')) this.addClock(-dt / 1000);
    this.refreshTopBar();
  }

  /** Space/Enter: the primary action of the current phase. */
  private advance() {
    if (this.drag) return;
    if (this.phase === 'pack' && this.goEnabled()) this.toRoute();
    else if (this.phase === 'route' && this.routeComplete()) void this.drive();
    else if (this.phase === 'result') this.resultNext?.();
  }

  private undo() {
    if (this.phase !== 'pack' || this.drag) return;
    while (this.placedStack.length) {
      const id = this.placedStack.pop()!;
      const v = this.views.find((x) => x.p.id === id);
      if (v?.placed) {
        this.cargo.remove(id);
        v.placed = null;
        this.layoutTray();
        this.refreshPackInfo();
        sfx.play('pick');
        track('undo');
        return;
      }
    }
  }

  // ───────────────────────────── tutorial coach ─────────────────────────────

  private static COACH = [
    '① Drag a parcel into the van.',
    '② Tap a parcel to rotate it (or press Q/E while dragging).',
    '③ The door is on the right ➜  Stop A comes first, so A parcels go by the door. Load all 4.',
    '④ Perfect pack! Press Plan route ➜',
    '⑤ Tap house A first, then B.',
    '⑥ Now drive it ➜',
    'Delivering…',
  ];

  private coachEval() {
    if (!this.tutorial) return;
    let step = 0;
    if (this.phase === 'pack') {
      const any = this.views.some((v) => v.placed);
      const all = this.views.every((v) => v.placed);
      const clear = all && simulateUnload(this.cargo, this.stopOf, [0, 1]).every((s) => !s.blocked.length);
      step = !any ? 0 : clear ? 3 : !this.rotated ? 1 : 2;
      if (all && !clear) this.trayText?.setText('A B parcel blocks the door. Move A parcels right (Z = undo).');
    } else if (this.phase === 'route') step = this.order.join() === '0,1' ? 5 : 4;
    else step = 6;
    const changed = step !== this.tutStep;
    this.tutStep = step;
    this.goBtn?.setEnabled(this.goEnabled());
    if (!changed) return;
    track('tutorial_step', { step });
    this.hintText.setText(GameScene.COACH[step]).setColor(HEX.primary);
    if (!REDUCED) this.tweens.add({ targets: this.hintText, scale: { from: 1.08, to: 1 }, duration: 260, ease: 'Back.easeOut' });
  }

  private goEnabled() {
    if (this.tutorial) return this.tutStep >= 3;
    return this.views.some((v) => v.placed);
  }

  private routeComplete() {
    if (this.tutorial) return this.order.join() === '0,1';
    return this.activeStops().every((s) => this.order.includes(s));
  }

  private finishTutorial(skipped: boolean) {
    setTutorialDone();
    track(skipped ? 'tutorial_skip' : 'tutorial_done');
    this.scene.restart({ tutorial: false });
  }

  // ───────────────────────────── shift / clock ─────────────────────────────

  private addClock(delta: number) {
    if (this.phase === 'over' || this.tutorial) return;
    this.clock += delta;
    if (this.clock <= 0) {
      this.clock = 0;
      this.endShift();
    }
  }

  private endShift() {
    if (this.phase === 'over') return;
    const endedIn = this.phase;
    this.phase = 'over';
    const prev = getBest();
    const newBest = this.score > prev;
    if (newBest) setBest(this.score);
    if (endedIn !== 'result' && this.roundN >= 1)
      this.results.push({ delivered: this.roundStats.delivered, total: this.round.parcels.length, blocked: this.roundStats.blocked, finished: false });
    const result: ShiftResult = {
      score: this.score,
      best: Math.max(prev, this.score),
      newBest,
      rounds: this.results.filter((r) => r.finished).length,
      delivered: this.delivered,
    };
    if (this.daily && !getDaily(this.dayKey)) {
      const streak = nextStreak(getStreak(), this.dayKey);
      setDaily(this.dayKey, { score: this.score, rounds: this.results });
      setStreak(streak);
      result.daily = { day: dayNumber(this.dayKey), rounds: this.results, streak: streak.count };
      track('daily_done', { day: result.daily.day, score: this.score, streak: streak.count });
    }
    track('shift_over', { score: this.score, rounds: result.rounds, delivered: this.delivered });
    this.time.delayedCall(250, () => this.scene.start('GameOver', result));
  }

  private drawTopBar() {
    const g = this.add.graphics();
    g.fillStyle(C.primary, 1).fillRect(0, 0, CFG.WIDTH, 104);
    this.clockText = text(this, 110, 52, '', 48, { display: true, color: HEX.white });
    this.roundText = text(this, 320, 52, '', 30, { display: true, color: HEX.white, weight: '500' });
    this.scoreText = text(this, 530, 52, '', 34, { display: true, color: HEX.white });
    muteButton(this, 668, 52);
  }

  private refreshTopBar() {
    if (this.tutorial) {
      this.clockText.setText('Practice');
      this.roundText.setText('No clock');
      return;
    }
    const s = Math.ceil(this.clock);
    this.clockText.setText(`⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
    this.clockText.setColor(this.clock < 20 ? '#FFD2C4' : HEX.white);
    this.scoreText.setText(`★ ${this.score}`);
    this.roundText.setText(this.daily ? `Daily #${dayNumber(this.dayKey)} · R${this.roundN}` : `Round ${this.roundN}`);
  }

  // ───────────────────────────── rounds ─────────────────────────────

  private nextRound() {
    this.roundN += 1;
    this.round = this.tutorial ? tutorialRound(buildCity(makeRng(42), 2, 3)) : generateRound(this.roundN, this.rng);
    this.placedStack = [];
    this.cargo = new Cargo(this.round.cols, this.round.rows);
    this.order = [];
    this.roundStats = { deliveredPts: 0, delivered: 0, blocked: 0 };
    this.buildPackPhase();
  }

  private stopOf = (id: number) => this.round.parcels.find((p) => p.id === id)!.stop;

  // ───────────────────────────── PACK phase ─────────────────────────────

  private buildPackPhase() {
    this.phase = 'pack';
    this.packLayer.removeAll(true);
    this.routeLayer.removeAll(true).setVisible(false);
    this.packLayer.setVisible(true);
    this.views = [];

    const { cols, rows } = this.round;
    const total = 110 + cols * CELL + 20;
    this.GX = Math.round((CFG.WIDTH - total) / 2) + 110;
    this.hintText.setText(
      this.roundN === 1
        ? 'The door is at the back ➜  Load the FIRST stop near the door.'
        : `Round ${this.roundN}: ${this.round.stopCount} stops, bigger load. Pack it tight!`,
    );

    this.packLayer.add(this.drawVan());
    this.ghost = this.add.graphics();
    this.packLayer.add(this.ghost);

    const trayTop = this.GY + rows * CELL + 96;
    const tray = this.add.graphics();
    tray.fillStyle(C.border, 0.45).fillRoundedRect(20, trayTop, CFG.WIDTH - 40, TRAY_BOTTOM - trayTop + 20, 24);
    this.packLayer.add(tray);
    this.trayText = text(this, CFG.WIDTH / 2, trayTop + 26, '', 24, { color: HEX.muted });
    this.packLayer.add(this.trayText);

    for (const p of this.round.parcels) {
      const v: ParcelView = { p, shape: p.shape, c: this.add.container(0, 0), placed: null, trayScale: 0.5 };
      this.drawParcel(v);
      this.views.push(v);
      this.packLayer.add(v.c);
    }
    this.layoutTray(trayTop + 52, true);

    this.undoBtn = button(this, 140, 1210, 200, 100, '↶ Undo', () => this.undo(), 'ghost');
    this.goBtn = button(this, 455, 1210, 400, 100, 'Plan route ➜', () => this.goEnabled() && this.toRoute());
    this.packLayer.add([this.undoBtn, this.goBtn]);
    this.refreshPackInfo();
  }

  private drawVan() {
    const { cols, rows } = this.round;
    const g = this.add.graphics();
    const x0 = this.GX, y0 = this.GY, w = cols * CELL, h = rows * CELL;
    // body + cab
    g.fillStyle(C.fg, 0.15).fillRoundedRect(x0 - 14, y0 - 8, w + 28, h + 32, 24);
    g.fillStyle(this.vanColor, 1).fillRoundedRect(x0 - 14, y0 - 16, w + 28, h + 32, 24);
    g.fillRoundedRect(x0 - 108, y0 + h * 0.28, 110, h * 0.72 + 16, { tl: 30, tr: 0, bl: 18, br: 0 });
    g.fillStyle(C.bg, 1).fillRoundedRect(x0 - 92, y0 + h * 0.28 + 16, 64, 58, 10);
    // cargo floor + grid
    g.fillStyle(0xf3ebdd, 1).fillRect(x0, y0, w, h);
    g.lineStyle(2, C.border, 1);
    for (let x = 0; x <= cols; x++) g.lineBetween(x0 + x * CELL, y0, x0 + x * CELL, y0 + h);
    for (let y = 0; y <= rows; y++) g.lineBetween(x0, y0 + y * CELL, x0 + w, y0 + y * CELL);
    // wheels
    for (const wx of [x0 - 50, x0 + 70, x0 + w - 60]) {
      g.fillStyle(C.fg, 1).fillCircle(wx, y0 + h + 22, 30);
      g.fillStyle(C.bg, 1).fillCircle(wx, y0 + h + 22, 11);
    }
    // door
    g.fillStyle(C.accent, 1).fillRoundedRect(x0 + w + 6, y0 - 4, 12, h + 8, 6);
    const door = text(this, x0 + w - 30, y0 - 30, 'DOOR ➜', 22, { display: true, color: HEX.accent });
    const c = this.add.container(0, 0, [g, door]);
    return c;
  }

  private drawParcel(v: ParcelView) {
    v.c.removeAll(true);
    const color = C.stops[v.p.stop];
    const g = this.add.graphics();
    const has = (x: number, y: number) => v.shape.some(([a, b]) => a === x && b === y);
    for (const pass of [0, 1]) {
      g.fillStyle(pass === 0 ? C.fg : color, pass === 0 ? 0.22 : 1);
      const dy = pass === 0 ? 5 : 0;
      for (const [x, y] of v.shape) {
        g.fillRoundedRect(x * CELL + 4, y * CELL + 4 + dy, CELL - 8, CELL - 8, 12);
        if (has(x + 1, y)) g.fillRect(x * CELL + CELL - 12, y * CELL + 4 + dy, 24, CELL - 8);
        if (has(x, y + 1)) g.fillRect(x * CELL + 4, y * CELL + CELL - 12 + dy, CELL - 8, 24);
        if (has(x + 1, y) && has(x, y + 1) && has(x + 1, y + 1)) g.fillRect(x * CELL + CELL - 12, y * CELL + CELL - 12 + dy, 24, 24);
      }
    }
    // parcel tape
    g.fillStyle(0xffffff, 0.22);
    for (const [x, y] of v.shape.slice(1)) g.fillRect(x * CELL + CELL / 2 - 5, y * CELL + 8, 10, CELL - 16);
    v.c.add(g);
    const [lx, ly] = v.shape[0];
    v.c.add(text(this, lx * CELL + CELL / 2, ly * CELL + CELL / 2, STOP_LETTERS[v.p.stop], 40, { display: true, color: STOP_TEXT[v.p.stop] }));
    for (const [x, y] of v.shape) {
      const z = this.add.zone(x * CELL, y * CELL, CELL, CELL).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerdown', (p: Phaser.Input.Pointer) => this.onDown(v, p));
      v.c.add(z);
    }
    const b = bounds(v.shape);
    v.c.setSize(b.w * CELL, b.h * CELL);
  }

  private layoutTray(top?: number, instant = false) {
    const areaTop = top ?? this.GY + this.round.rows * CELL + 96 + 52;
    const area = { x: 36, y: areaTop, w: CFG.WIDTH - 72, h: TRAY_BOTTOM - areaTop };
    const loose = this.views.filter((v) => !v.placed);
    let positions: { v: ParcelView; x: number; y: number; s: number }[] = [];
    for (const s of [0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.36, 0.32]) {
      positions = [];
      let x = area.x, y = area.y, rowH = 0;
      for (const v of loose) {
        const b = bounds(v.shape);
        const w = b.w * CELL * s, h = b.h * CELL * s;
        if (x + w > area.x + area.w) { x = area.x; y += rowH + 16; rowH = 0; }
        positions.push({ v, x, y, s });
        x += w + 20;
        rowH = Math.max(rowH, h);
      }
      if (y + rowH <= area.y + area.h) break;
    }
    // center each row horizontally
    const rowsMap = new Map<number, typeof positions>();
    positions.forEach((p) => rowsMap.set(p.y, [...(rowsMap.get(p.y) ?? []), p]));
    for (const row of rowsMap.values()) {
      const last = row[row.length - 1];
      const right = last.x + bounds(last.v.shape).w * CELL * last.s;
      const shift = (area.x + area.w - right) / 2;
      row.forEach((p) => (p.x += shift));
    }
    for (const { v, x, y, s } of positions) {
      v.trayScale = s;
      if (this.drag?.v === v) continue;
      if (instant) v.c.setPosition(x, y).setScale(s);
      else this.tweens.add({ targets: v.c, x, y, scale: s, duration: 160, ease: 'Cubic.easeOut' });
    }
  }

  private refreshPackInfo() {
    const left = this.views.filter((v) => !v.placed).length;
    const pct = Math.round((this.cargo.filled() / (this.round.cols * this.round.rows)) * 100);
    this.trayText?.setText(left ? `Parcels to load: ${left}   ·   Van ${pct}% full` : `All loaded!   ·   Van ${pct}% full`);
    this.goBtn?.setEnabled(this.goEnabled());
    this.undoBtn?.setEnabled(this.views.some((v) => v.placed));
    this.coachEval();
  }

  private onDown(v: ParcelView, p: Phaser.Input.Pointer) {
    if (this.phase !== 'pack' || this.drag || p.rightButtonDown()) return;
    const s = v.c.scale;
    this.drag = {
      v,
      downX: p.x,
      downY: p.y,
      moved: false,
      grab: { x: (p.x - v.c.x) / (CELL * s), y: (p.y - v.c.y) / (CELL * s) },
      lift: p.wasTouch ? 70 : 0,
    };
    this.packLayer.bringToTop(v.c);
  }

  private onMove(p: Phaser.Input.Pointer) {
    const d = this.drag;
    if (!d || this.phase !== 'pack') return;
    if (!d.moved && Phaser.Math.Distance.Between(p.x, p.y, d.downX, d.downY) < 10) return;
    if (!d.moved) {
      d.moved = true;
      sfx.play('pick');
      if (d.v.placed) {
        this.cargo.remove(d.v.p.id);
        d.v.placed = null;
        this.refreshPackInfo();
      }
      d.v.c.setScale(1);
      this.layoutTray();
    }
    d.v.c.setPosition(p.x - d.grab.x * CELL, p.y - d.grab.y * CELL - d.lift);
    this.drawGhost(d.v);
  }

  private snap(v: ParcelView) {
    const gx = Math.round((v.c.x - this.GX) / CELL);
    const gy = Math.round((v.c.y - this.GY) / CELL);
    return { gx, gy, ok: this.cargo.canPlace(v.shape, gx, gy) };
  }

  private overVan(v: ParcelView) {
    const b = bounds(v.shape);
    const cx = v.c.x + (b.w * CELL) / 2, cy = v.c.y + (b.h * CELL) / 2;
    return cx > this.GX - CELL && cx < this.GX + (this.round.cols + 1) * CELL && cy > this.GY - CELL && cy < this.GY + (this.round.rows + 1) * CELL;
  }

  private drawGhost(v: ParcelView) {
    this.ghost.clear();
    if (!this.overVan(v)) return;
    const { gx, gy, ok } = this.snap(v);
    this.ghost.fillStyle(ok ? C.success : C.danger, ok ? 0.35 : 0.25);
    for (const [x, y] of v.shape) {
      const cx = gx + x, cy = gy + y;
      if (cx < 0 || cy < 0 || cx >= this.round.cols || cy >= this.round.rows) continue;
      this.ghost.fillRect(this.GX + cx * CELL + 2, this.GY + cy * CELL + 2, CELL - 4, CELL - 4);
    }
  }

  private onUp(_p: Phaser.Input.Pointer) {
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    this.ghost.clear();
    if (this.phase !== 'pack') return;
    if (!d.moved) return this.rotateInPlace(d.v);
    const { gx, gy, ok } = this.snap(d.v);
    if (this.overVan(d.v) && ok) {
      this.cargo.place(d.v.p.id, d.v.shape, gx, gy);
      d.v.placed = { x: gx, y: gy };
      this.placedStack.push(d.v.p.id);
      d.v.c.setPosition(this.GX + gx * CELL, this.GY + gy * CELL);
      this.tweens.add({ targets: d.v.c, scale: { from: 1.06, to: 1 }, duration: 120 });
      sfx.play('place');
      if (this.views.every((v) => v.placed) || this.cargo.filled() === this.round.cols * this.round.rows) {
        sfx.play('full');
        popup(this, CFG.WIDTH / 2, this.GY + (this.round.rows * CELL) / 2, 'Van full!', HEX.success, 48);
      }
    } else {
      if (this.overVan(d.v)) sfx.play('error');
      this.layoutTray();
    }
    this.refreshPackInfo();
  }

  private rotateDragged() {
    const d = this.drag;
    if (!d) return;
    d.v.shape = rotate(d.v.shape);
    const b = bounds(d.v.shape);
    d.grab = { x: Math.min(d.grab.y, b.w - 0.5), y: Math.min(d.grab.x, b.h - 0.5) };
    this.drawParcel(d.v);
    this.rotated = true;
    sfx.play('rotate');
    const p = this.input.activePointer;
    if (d.moved) {
      d.v.c.setPosition(p.x - d.grab.x * CELL, p.y - d.grab.y * CELL - d.lift);
      this.drawGhost(d.v);
    }
  }

  private rotateInPlace(v: ParcelView) {
    const next = rotate(v.shape);
    if (v.placed) {
      if (!this.cargo.canPlace(next, v.placed.x, v.placed.y, v.p.id)) {
        sfx.play('error');
        if (!REDUCED) this.tweens.add({ targets: v.c, x: v.c.x + 8, duration: 40, yoyo: true, repeat: 2 });
        return;
      }
      this.cargo.remove(v.p.id);
      v.shape = next;
      this.cargo.place(v.p.id, next, v.placed.x, v.placed.y);
      this.drawParcel(v);
    } else {
      v.shape = next;
      this.drawParcel(v);
      this.layoutTray();
    }
    this.rotated = true;
    sfx.play('rotate');
    this.refreshPackInfo();
  }

  // ───────────────────────────── ROUTE phase ─────────────────────────────

  private activeStops(): number[] {
    const stops = new Set(this.cargo.ids().map(this.stopOf));
    return [...stops].sort();
  }

  private nodePos(city: City, id: number) {
    const { x, y } = nodeXY(city, id);
    return { x: 110 + x * 125, y: 300 + y * 128 };
  }

  private routeGfx!: Phaser.GameObjects.Graphics;
  private routeInfo!: Phaser.GameObjects.Text;
  private badgeLayer!: Phaser.GameObjects.Container;
  private driveBtn!: Button;
  private van!: Phaser.GameObjects.Container;

  private toRoute() {
    if (this.phase !== 'pack') return;
    this.phase = 'route';
    track('pack_done', { round: this.roundN, fill: Math.round((this.cargo.filled() / (this.round.cols * this.round.rows)) * 100), left: this.views.filter((v) => !v.placed).length });
    this.packLayer.setVisible(false);
    this.routeLayer.removeAll(true).setVisible(true);
    this.order = [];
    this.hintText.setText('Tap houses in delivery order. Red roads are jammed.');

    const city = this.round.city;
    const active = this.activeStops();
    const L = this.routeLayer;

    const bg = this.add.graphics();
    bg.fillStyle(0xe9f2ea, 1).fillRoundedRect(40, 220, CFG.WIDTH - 80, 790, 30);
    // roads
    for (const e of city.edges) {
      const a = this.nodePos(city, e.a), b = this.nodePos(city, e.b);
      bg.lineStyle(e.traffic ? 18 : 16, e.traffic ? C.danger : 0xd9cbb4, e.traffic ? 0.6 : 1);
      bg.lineBetween(a.x, a.y, b.x, b.y);
    }
    for (let i = 0; i < city.adj.length; i++) {
      const p = this.nodePos(city, i);
      bg.fillStyle(0xd9cbb4, 1).fillCircle(p.x, p.y, 9);
    }
    L.add(bg);
    this.routeGfx = this.add.graphics();
    L.add(this.routeGfx);

    // depot
    const d = this.nodePos(city, city.depot);
    const dep = this.add.graphics();
    dep.fillStyle(C.fg, 1).fillRoundedRect(d.x - 34, d.y - 30, 68, 56, 8);
    dep.fillStyle(C.bg, 1).fillRect(d.x - 18, d.y - 8, 36, 34);
    L.add(dep);
    L.add(text(this, d.x, d.y + 50, 'Depot', 22, { color: HEX.fg }));

    // houses
    this.round.city.stops.forEach((node, s) => {
      const pos = this.nodePos(city, node);
      const isActive = active.includes(s);
      const count = this.cargo.ids().filter((id) => this.stopOf(id) === s).length;
      const g = this.add.graphics().setAlpha(isActive ? 1 : 0.3);
      g.fillStyle(C.fg, 0.2).fillCircle(pos.x, pos.y + 4, 38);
      g.fillStyle(C.stops[s], 1).fillCircle(pos.x, pos.y, 38);
      g.fillStyle(C.stops[s], 1).fillTriangle(pos.x - 30, pos.y - 20, pos.x + 30, pos.y - 20, pos.x, pos.y - 58);
      L.add(g);
      L.add(text(this, pos.x, pos.y + 2, STOP_LETTERS[s], 36, { display: true, color: STOP_TEXT[s] }).setAlpha(isActive ? 1 : 0.4));
      L.add(text(this, pos.x + 50, pos.y + 34, isActive ? `×${count}` : '—', 22, { color: HEX.fg }).setAlpha(isActive ? 1 : 0.4));
      if (isActive) {
        const z = this.add.zone(pos.x, pos.y - 10, 110, 110).setInteractive({ useHandCursor: true });
        z.on('pointerup', () => this.tapStop(s));
        L.add(z);
      }
    });

    this.badgeLayer = this.add.container(0, 0);
    L.add(this.badgeLayer);

    // van at depot
    this.van = this.add.container(d.x, d.y);
    const vg = this.add.graphics();
    vg.fillStyle(this.vanColor, 1).fillRoundedRect(-30, -20, 60, 34, 8);
    vg.fillStyle(C.fg, 1).fillCircle(-16, 16, 8).fillCircle(16, 16, 8);
    this.van.add(vg).setVisible(false);
    L.add(this.van);

    this.routeInfo = text(this, CFG.WIDTH / 2, 1052, '', 28, { color: HEX.fg, wrap: 660 });
    L.add(this.routeInfo);
    L.add(button(this, 120, 1180, 180, 90, '◀ Repack', () => this.backToPack(), 'ghost'));
    L.add(button(this, 330, 1180, 180, 90, 'Reset', () => { this.order = []; this.refreshRoute(); }, 'ghost'));
    this.driveBtn = button(this, 575, 1180, 230, 100, 'Drive ➜', () => void this.drive());
    L.add(this.driveBtn);

    // legend
    const lg = this.add.graphics();
    lg.lineStyle(14, C.danger, 0.6).lineBetween(190, 1112, 230, 1112);
    L.add(lg);
    L.add(text(this, 400, 1112, 'Red road = traffic, 3× slower', 22, { color: HEX.muted }));
    this.refreshRoute();
    this.coachEval();
  }

  private backToPack() {
    if (this.phase !== 'route') return;
    this.phase = 'pack';
    this.routeLayer.setVisible(false);
    this.packLayer.setVisible(true);
    this.hintText.setText('Door is at the back ➜  First stop goes near the door.');
    this.tutStep = -1;
    this.coachEval();
  }

  private tapStop(s: number) {
    if (this.phase !== 'route') return;
    const i = this.order.indexOf(s);
    if (i >= 0) this.order = this.order.slice(0, i);
    else this.order.push(s);
    sfx.play('click');
    this.refreshRoute();
  }

  private refreshRoute() {
    const city = this.round.city;
    this.routeGfx.clear();
    this.badgeLayer.removeAll(true);
    let at = city.depot;
    this.routeGfx.lineStyle(10, C.primary, 0.9);
    this.order.forEach((s, i) => {
      const p = path(city, at, city.stops[s]);
      const pts = p.nodes.map((n) => this.nodePos(city, n));
      for (let k = 1; k < pts.length; k++) this.routeGfx.lineBetween(pts[k - 1].x, pts[k - 1].y, pts[k].x, pts[k].y);
      at = city.stops[s];
      const pos = this.nodePos(city, city.stops[s]);
      const b = this.add.graphics();
      b.fillStyle(C.fg, 1).fillCircle(pos.x - 40, pos.y - 44, 22);
      this.badgeLayer.add(b);
      this.badgeLayer.add(text(this, pos.x - 40, pos.y - 44, String(i + 1), 26, { display: true, color: HEX.white }));
    });

    const active = this.activeStops();
    const complete = active.every((s) => this.order.includes(s));
    this.driveBtn.setEnabled(this.routeComplete());
    this.coachEval();
    if (!this.order.length) {
      this.routeInfo.setText(active.length === 1 ? 'Tap the house to set the route.' : `Tap the ${active.length} houses in visit order.`);
      this.routeInfo.setColor(HEX.fg);
      return;
    }
    const minutes = routeMinutes(city, this.order);
    const blocks = simulateUnload(this.cargo, this.stopOf, this.order).reduce((n, s) => n + s.blocked.length, 0);
    const blockTxt = complete ? (blocks ? `   ·   Door blocks: ${blocks} (−${blocks * CFG.BLOCK_PENALTY}s)` : '   ·   Door clear ✓') : '';
    this.routeInfo.setText(`Route: ${minutes} min${blockTxt}`);
    this.routeInfo.setColor(complete && blocks ? HEX.danger : HEX.fg);
  }

  // ───────────────────────────── DRIVE ─────────────────────────────

  private tween(target: object, props: Record<string, number>, duration: number) {
    return new Promise<void>((res) => this.tweens.add({ targets: target, ...props, duration, onComplete: () => res() }));
  }

  private wait(ms: number) {
    return new Promise<void>((res) => this.time.delayedCall(ms, () => res()));
  }

  private async drive() {
    if (this.phase !== 'route') return;
    this.phase = 'drive';
    this.driveBtn.setEnabled(false);
    this.hintText.setText('Delivering…');
    track('route_set', { round: this.roundN, stops: this.order.length, minutes: routeMinutes(this.round.city, this.order) });
    const city = this.round.city;
    const routeMin = routeMinutes(city, this.order);
    const best = bestRoute(city, this.activeStops()).minutes;
    this.van.setVisible(true);
    let at = city.depot;

    for (const s of this.order) {
      const p = path(city, at, city.stops[s]);
      for (let k = 1; k < p.nodes.length; k++) {
        const a = p.nodes[k - 1], b = p.nodes[k];
        const e = city.edges[city.adj[a].find((ei) => { const ed = city.edges[ei]; return (ed.a === a && ed.b === b) || (ed.b === a && ed.a === b); })!];
        const pos = this.nodePos(city, b);
        this.van.setScale(pos.x < this.van.x ? -1 : 1, 1);
        await this.tween(this.van, { x: pos.x, y: pos.y }, e.w * CFG.DRIVE_MS_PER_MIN);
        this.addClock(-e.w * CFG.SEC_PER_MIN);
        if (this.phase !== 'drive') return;
      }
      at = city.stops[s];
      // unload this stop
      const pos = this.nodePos(city, at);
      const blocked = blockedForStop(this.cargo, this.stopOf, s);
      const ids = this.cargo.ids().filter((id) => this.stopOf(id) === s);
      let pts = 0;
      for (const id of ids) {
        pts += this.round.parcels.find((p) => p.id === id)!.shape.length * CFG.VALUE_PER_CELL;
        this.cargo.remove(id);
      }
      this.score += pts;
      this.delivered += ids.length;
      this.roundStats.delivered += ids.length;
      this.roundStats.deliveredPts += pts;
      sfx.play('deliver');
      popup(this, pos.x, pos.y - 70, `+${pts}`, HEX.success);
      if (blocked.length) {
        this.roundStats.blocked += blocked.length;
        await this.wait(250);
        sfx.play('penalty');
        popup(this, pos.x, pos.y + 10, `Blocked door −${blocked.length * CFG.BLOCK_PENALTY}s`, HEX.danger, 28);
        this.addClock(-blocked.length * CFG.BLOCK_PENALTY);
        if (this.phase !== 'drive') return;
      }
      await this.wait(350);
    }
    this.showResult(routeMin, best);
  }

  // ───────────────────────────── RESULT ─────────────────────────────

  private showResult(routeMin: number, best: number) {
    this.phase = 'result';
    const allPacked = this.views.every((v) => v.placed);
    const bestRouteHit = routeMin <= best;
    const bonus = (allPacked ? CFG.FULL_PACK_BONUS : 0) + (bestRouteHit ? CFG.BEST_ROUTE_BONUS : 0);
    this.score += bonus;
    const left = this.views.filter((v) => !v.placed).length;
    this.results.push({ delivered: this.roundStats.delivered, total: this.round.parcels.length, blocked: this.roundStats.blocked, finished: true });
    track('round_done', { round: this.roundN, delivered: this.roundStats.delivered, blocked: this.roundStats.blocked, bestRoute: bestRouteHit, full: allPacked });
    if (this.tutorial) return this.showTutorialDone();

    const panel = this.add.container(CFG.WIDTH / 2, 640).setDepth(60);
    const g = this.add.graphics();
    g.fillStyle(C.fg, 0.35).fillRect(-CFG.WIDTH / 2, -640, CFG.WIDTH, CFG.HEIGHT);
    g.fillStyle(C.bg, 1).fillRoundedRect(-300, -300, 600, 600, 32);
    panel.add(g);
    const lines: [string, string][] = [
      [`Delivered ${this.roundStats.delivered} parcel${this.roundStats.delivered === 1 ? '' : 's'}`, `+${this.roundStats.deliveredPts}`],
      [left ? `Left at depot: ${left}` : 'Every parcel packed!', allPacked ? `+${CFG.FULL_PACK_BONUS}` : '—'],
      [`Route ${routeMin} min (best ${best})`, bestRouteHit ? `+${CFG.BEST_ROUTE_BONUS}` : '—'],
      [`Door blocks: ${this.roundStats.blocked}`, this.roundStats.blocked ? `−${this.roundStats.blocked * CFG.BLOCK_PENALTY}s` : '✓'],
    ];
    panel.add(text(this, 0, -235, `Round ${this.roundN} delivered!`, 46, { display: true }));
    lines.forEach(([l, r], i) => {
      panel.add(text(this, -250, -140 + i * 62, l, 28, { color: HEX.fg }).setOrigin(0, 0.5));
      panel.add(text(this, 250, -140 + i * 62, r, 30, { display: true, color: r.startsWith('−') ? HEX.danger : HEX.success }).setOrigin(1, 0.5));
    });
    if (bonus) sfx.play('full');
    let done = false;
    const next = () => {
      if (done || this.phase !== 'result') return;
      done = true;
      panel.destroy();
      this.nextRound();
    };
    this.resultNext = next;
    panel.add(button(this, 0, 205, 360, 96, 'Next load ➜', next));
    this.time.delayedCall(CFG.RESULT_MS + 2500, next);
  }

  private resultNext?: () => void;

  private showTutorialDone() {
    sfx.play('full');
    const panel = this.add.container(CFG.WIDTH / 2, 640).setDepth(60);
    const g = this.add.graphics();
    g.fillStyle(C.fg, 0.35).fillRect(-CFG.WIDTH / 2, -640, CFG.WIDTH, CFG.HEIGHT);
    g.fillStyle(C.bg, 1).fillRoundedRect(-300, -280, 600, 560, 32);
    panel.add(g);
    panel.add(text(this, 0, -200, 'Delivered! 🎉', 54, { display: true }));
    const lines = [
      'Last stop deepest, first stop by the door.',
      'Pick the fastest route around red roads.',
      `A real shift has a ${Math.round(CFG.SHIFT_SECONDS / 60)}-minute clock.`,
      'Every blocked parcel costs 3 seconds.',
    ];
    lines.forEach((l, i) => panel.add(text(this, 0, -100 + i * 52, l, 28, { color: HEX.fg, wrap: 540 })));
    const start = () => this.finishTutorial(false);
    this.resultNext = start;
    panel.add(button(this, 0, 190, 380, 100, 'Start shift ➜', start));
  }
}
