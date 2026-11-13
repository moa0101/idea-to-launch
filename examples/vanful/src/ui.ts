import Phaser from 'phaser';
import { C, FONT, HEX } from './theme';
import { sfx } from './sfx';

const DPR = Math.min(2, window.devicePixelRatio || 1);

export function text(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  size: number,
  opts: { color?: string; display?: boolean; weight?: string; align?: string; wrap?: number } = {},
) {
  return scene.add
    .text(x, y, value, {
      fontFamily: opts.display ? FONT.display : FONT.text,
      fontSize: `${size}px`,
      fontStyle: opts.weight ?? (opts.display ? '600' : '700'),
      color: opts.color ?? HEX.fg,
      align: opts.align ?? 'center',
      wordWrap: opts.wrap ? { width: opts.wrap } : undefined,
      resolution: DPR,
    })
    .setOrigin(0.5);
}

export interface Button extends Phaser.GameObjects.Container {
  setEnabled(on: boolean): Button;
  setLabel(label: string): Button;
}

/** Rounded, chunky button with a press animation. Big hit area for thumbs. */
export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  onClick: () => void,
  style: 'primary' | 'accent' | 'ghost' = 'primary',
): Button {
  const c = scene.add.container(x, y) as Button;
  const g = scene.add.graphics();
  const fill = style === 'primary' ? C.primary : style === 'accent' ? C.accent : C.bg;
  const color = style === 'primary' ? HEX.white : HEX.fg;
  const draw = (enabled: boolean) => {
    g.clear();
    g.fillStyle(C.fg, enabled ? 0.18 : 0.06);
    g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, 18);
    g.fillStyle(enabled ? fill : C.border, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
    if (style === 'ghost') {
      g.lineStyle(3, C.fg, enabled ? 0.5 : 0.2);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
    }
  };
  const t = text(scene, 0, 0, label, Math.min(38, h * 0.42), { display: true, color });
  const zone = scene.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
  let enabled = true;
  zone.on('pointerdown', () => {
    if (!enabled) return;
    scene.tweens.add({ targets: c, scale: 0.94, duration: 60, yoyo: true });
  });
  zone.on('pointerup', () => {
    if (!enabled) return;
    sfx.play('click');
    onClick();
  });
  c.add([g, t, zone]);
  c.setEnabled = (on: boolean) => {
    enabled = on;
    draw(on);
    t.setAlpha(on ? 1 : 0.5);
    return c;
  };
  c.setLabel = (l: string) => {
    t.setText(l);
    return c;
  };
  c.setSize(w, h);
  c.setEnabled(true);
  return c;
}

export function muteButton(scene: Phaser.Scene, x: number, y: number) {
  const t = text(scene, x, y, sfx.muted ? '🔇' : '🔊', 40).setInteractive({ useHandCursor: true });
  t.on('pointerup', () => t.setText(sfx.toggle() ? '🔇' : '🔊'));
  return t;
}

/** Floating score/penalty popup. */
export function popup(scene: Phaser.Scene, x: number, y: number, value: string, color: string, size = 34) {
  const t = text(scene, x, y, value, size, { display: true, color }).setDepth(50);
  t.setStroke(HEX.bg, 8);
  scene.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 1100, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  return t;
}
