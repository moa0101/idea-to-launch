import Phaser from 'phaser';
import { CFG } from '../config';
import { getBest } from '../storage';
import { BRAND, HEX } from '../theme';
import { button, muteButton, text } from '../ui';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const cx = CFG.WIDTH / 2;
    const logo = this.add.image(cx, 300, 'logo');
    this.tweens.add({ targets: logo, y: 290, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    text(this, cx, 500, BRAND.name, 120, { display: true });
    text(this, cx, 585, BRAND.slogan, 34, { color: HEX.primary });

    const best = getBest();
    text(this, cx, 660, best > 0 ? `Best shift: ${best}` : 'Your first shift starts now', 28, { color: HEX.muted });

    const start = () => this.scene.start('Game');
    button(this, cx, 790, 420, 110, 'Play', start);

    const how = [
      '1  Drag parcels into the van. Tap one to rotate.',
      '2  The door is at the back → load the first stop last.',
      '3  Tap houses in order. Dodge red traffic. Beat the clock!',
    ];
    how.forEach((line, i) => text(this, cx, 940 + i * 56, line, 26, { color: HEX.fg, weight: '600' }));

    text(this, cx, 1210, 'Enter / Space to start · R rotates', 22, { color: HEX.muted, weight: '600' });
    muteButton(this, CFG.WIDTH - 50, 50);

    this.input.keyboard?.once('keydown-ENTER', start);
    this.input.keyboard?.once('keydown-SPACE', start);
  }
}
