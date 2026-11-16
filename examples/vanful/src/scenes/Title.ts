import Phaser from 'phaser';
import { CFG } from '../config';
import { currentStreak, dateKey, dayNumber } from '../logic/daily';
import { getBest, getDaily, getStreak, tutorialDone } from '../storage';
import { BRAND, HEX } from '../theme';
import { button, muteButton, REDUCED, text } from '../ui';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const cx = CFG.WIDTH / 2;
    const logo = this.add.image(cx, 250, 'logo').setScale(0.9);
    if (!REDUCED) this.tweens.add({ targets: logo, y: 240, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    text(this, cx, 430, BRAND.name, 116, { display: true });
    text(this, cx, 512, BRAND.slogan, 34, { color: HEX.primary });

    const best = getBest();
    const today = dateKey();
    const streak = currentStreak(getStreak(), today);
    const stats = [best > 0 ? `Best shift: ${best}` : 'A 3-minute delivery puzzle', streak > 0 ? `🔥 ${streak}-day streak` : ''].filter(Boolean);
    text(this, cx, 578, stats.join('   ·   '), 28, { color: HEX.muted });

    // First play always starts with the guided delivery; after that, straight into a shift.
    const play = () => this.scene.start('Game', { tutorial: !tutorialDone() });
    button(this, cx, 690, 440, 104, tutorialDone() ? 'Play' : 'Play ➜ first delivery', play);

    // The Daily Load: one scored run a day, the same for everyone.
    const day = dayNumber(today);
    const done = getDaily(today);
    const daily = button(this, cx, 812, 440, 96, done ? `Daily #${day} ✓  ${done.score}` : `📅 Daily #${day}`, () => {
      if (!done) this.scene.start('Game', { daily: true });
    }, 'accent');
    if (done) daily.setEnabled(false);
    text(this, cx, 878, done ? 'Next Daily Load at midnight UTC' : 'Same load for everyone today. One scored run.', 22, { color: HEX.muted, weight: '600' });

    button(this, cx - 225, 975, 200, 80, 'How to play', () => this.scene.start('Game', { tutorial: true }), 'ghost');
    button(this, cx, 975, 200, 80, 'Garage', () => this.scene.start('Garage'), 'ghost');
    button(this, cx + 225, 975, 200, 80, 'About', () => this.scene.start('About'), 'ghost');

    const how = ['Drag parcels in · tap to rotate', 'The door is at the back → first stop by the door', 'Tap houses in order · avoid red traffic'];
    how.forEach((line, i) => text(this, cx, 1075 + i * 44, line, 24, { color: HEX.fg, weight: '600' }));

    text(this, cx, 1230, 'Enter: play · Q/E rotate · Z undo · Space next', 22, { color: HEX.muted, weight: '600' });
    muteButton(this, CFG.WIDTH - 50, 50);

    this.input.keyboard?.once('keydown-ENTER', play);
    this.input.keyboard?.once('keydown-SPACE', play);
    this.input.keyboard?.once('keydown-D', () => !done && this.scene.start('Game', { daily: true }));
  }
}
