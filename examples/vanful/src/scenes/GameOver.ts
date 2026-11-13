import Phaser from 'phaser';
import { CFG } from '../config';
import { sfx } from '../sfx';
import { BRAND, HEX } from '../theme';
import { button, text } from '../ui';

export interface ShiftResult {
  score: number;
  best: number;
  newBest: boolean;
  rounds: number;
  delivered: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: ShiftResult) {
    const cx = CFG.WIDTH / 2;
    sfx.play('over');
    this.add.image(cx, 220, 'logo').setScale(0.6);
    text(this, cx, 380, 'Shift over!', 72, { display: true });
    const score = text(this, cx, 520, String(data.score), 150, { display: true, color: HEX.primary });
    this.tweens.add({ targets: score, scale: { from: 0.4, to: 1 }, duration: 500, ease: 'Back.easeOut' });
    text(this, cx, 630, data.newBest ? '🎉 New best shift!' : `Best: ${data.best}`, 38, {
      display: true,
      color: data.newBest ? HEX.accent : HEX.muted,
    });
    text(this, cx, 700, `${data.rounds} round${data.rounds === 1 ? '' : 's'} · ${data.delivered} parcel${data.delivered === 1 ? '' : 's'} delivered`, 30, { color: HEX.fg });

    const again = () => this.scene.start('Game');
    button(this, cx, 850, 440, 110, 'Play again', again);

    const share = `I scored ${data.score} on ${BRAND.name} 📦 — ${BRAND.slogan}`;
    const copy = button(this, cx, 990, 440, 90, 'Copy score', async () => {
      let ok = false;
      try {
        await navigator.clipboard.writeText(share);
        ok = true;
      } catch {
        /* clipboard blocked */
      }
      copy.setLabel(ok ? 'Copied!' : 'Copy blocked');
    }, 'ghost');

    text(this, cx, 1120, 'Tip: load the last stop deepest, the first stop by the door.', 24, { color: HEX.muted, weight: '600', wrap: 620 });
    this.input.keyboard?.once('keydown-ENTER', again);
    this.input.keyboard?.once('keydown-SPACE', again);
  }
}
