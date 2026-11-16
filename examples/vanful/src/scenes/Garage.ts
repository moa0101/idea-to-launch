import Phaser from 'phaser';
import { CFG } from '../config';
import { ask } from '../dialogs';
import { currentStreak, dateKey } from '../logic/daily';
import { checkSupporterCode, isUnlocked, PAINTS } from '../paints';
import { sfx } from '../sfx';
import { getPaint, getStreak, isSupporter, setPaint, setSupporter } from '../storage';
import { C, HEX } from '../theme';
import { track } from '../track';
import { button, text } from '../ui';

/** Cosmetic van paints: one free, one earned by a Daily streak, one from the supporter pack. */
export class GarageScene extends Phaser.Scene {
  constructor() {
    super('Garage');
  }

  create() {
    const cx = CFG.WIDTH / 2;
    text(this, cx, 120, 'Garage', 72, { display: true });
    text(this, cx, 190, 'Paint jobs are cosmetic. Every van drives the same.', 24, { color: HEX.muted, weight: '600' });

    const state = { streak: currentStreak(getStreak(), dateKey()), supporter: isSupporter() };
    const selected = getPaint();

    PAINTS.forEach((p, i) => {
      const y = 330 + i * 230;
      const unlocked = isUnlocked(p, state);
      const isSel = p.id === selected;
      const g = this.add.graphics();
      g.fillStyle(isSel ? C.primary : C.border, isSel ? 0.12 : 0.45).fillRoundedRect(40, y - 95, 640, 190, 26);
      if (isSel) g.lineStyle(4, C.primary, 1).strokeRoundedRect(40, y - 95, 640, 190, 26);
      // mini van
      g.fillStyle(p.body, unlocked ? 1 : 0.35).fillRoundedRect(80, y - 50, 150, 80, 14);
      g.fillRoundedRect(230, y - 25, 50, 55, { tl: 0, tr: 18, bl: 0, br: 10 });
      g.fillStyle(C.fg, unlocked ? 1 : 0.35).fillCircle(115, y + 38, 16).fillCircle(245, y + 38, 16);
      text(this, 320, y - 28, p.name, 38, { display: true, align: 'left' }).setOrigin(0, 0.5);
      text(this, 320, y + 22, unlocked ? (isSel ? 'In use' : 'Tap to use') : `🔒 ${p.how}`, 24, {
        color: unlocked ? (isSel ? HEX.primary : HEX.fg) : HEX.muted,
        align: 'left',
      }).setOrigin(0, 0.5);
      const z = this.add.zone(360, y, 640, 190).setInteractive({ useHandCursor: unlocked });
      z.on('pointerup', () => {
        if (!unlocked) return sfx.play('error');
        setPaint(p.id);
        track('paint_select', { paint: p.id });
        this.scene.restart();
      });
    });

    if (!state.supporter) {
      button(this, cx, 1050, 440, 84, 'Enter supporter code', () => {
        void ask({
          title: 'Supporter code',
          label: 'Code from your supporter pack',
          type: 'text',
          submit: 'Unlock',
          note: 'The supporter pack is how you can chip in for Vanful. Thank you!',
          onSubmit: async (v) => {
            if (!(await checkSupporterCode(v))) return "That code didn't work. Check it and try again.";
            setSupporter();
            setPaint('sunset');
            track('supporter_unlock');
            sfx.play('full');
            this.scene.restart();
            return null;
          },
        });
      }, 'ghost');
    } else text(this, cx, 1050, '💛 Supporter. Thank you!', 30, { display: true, color: HEX.danger });

    const back = () => this.scene.start('Title');
    button(this, cx, 1190, 340, 96, '◀ Back', back);
    this.input.keyboard?.once('keydown-ESC', back);
  }
}
