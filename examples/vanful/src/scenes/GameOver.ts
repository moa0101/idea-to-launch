import Phaser from 'phaser';
import { CFG } from '../config';
import { sfx } from '../sfx';
import { BRAND, HEX } from '../theme';
import { button, REDUCED, text } from '../ui';
import { ask, askFeedback } from '../dialogs';
import { APP_VERSION, insert } from '../backend';
import { deviceId, telemetryActive } from '../telemetry';
import { roundEmoji, shareText } from '../logic/daily';
import { emailJoined, feedbackGiven, setEmailJoined, setFeedbackGiven } from '../storage';
import { joinWaitlist, waitlistEnabled } from '../waitlist';
import { CHANNEL, shareUrl } from '../channel';
import { track } from '../track';
import type { RoundResult } from '../logic/daily';

export interface ShiftResult {
  score: number;
  best: number;
  newBest: boolean;
  rounds: number;
  delivered: number;
  daily?: { day: number; rounds: RoundResult[]; streak: number };
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: ShiftResult) {
    const cx = CFG.WIDTH / 2;
    sfx.play('over');
    const d = data.daily;
    this.add.image(cx, 170, 'logo').setScale(0.5);
    text(this, cx, 300, d ? `Daily #${d.day} delivered!` : 'Shift over!', 64, { display: true });
    const score = text(this, cx, 425, String(data.score), 140, { display: true, color: HEX.primary });
    if (!REDUCED) this.tweens.add({ targets: score, scale: { from: 0.4, to: 1 }, duration: 500, ease: 'Back.easeOut' });
    text(this, cx, 528, data.newBest ? '🎉 New best shift!' : `Best: ${data.best}`, 36, { display: true, color: data.newBest ? HEX.danger : HEX.muted });
    text(this, cx, 585, `${data.rounds} round${data.rounds === 1 ? '' : 's'} · ${data.delivered} parcel${data.delivered === 1 ? '' : 's'} delivered`, 28, { color: HEX.fg });
    if (d) text(this, cx, 650, `${d.rounds.map(roundEmoji).join(' ') || '⬜'}${d.streak > 1 ? `    🔥 ${d.streak}-day streak` : ''}`, 34, { color: HEX.fg });

    const again = () => {
      track('play_again');
      this.scene.start('Game', { tutorial: false });
    };
    button(this, cx, 770, 440, 104, d ? 'Practice shift' : 'Play again', again);

    const url = shareUrl(CHANNEL, location.origin + location.pathname);
    const share = d
      ? shareText({ day: d.day, score: data.score, rounds: d.rounds, streak: d.streak, url })
      : `I scored ${data.score} on ${BRAND.name} 📦 ${BRAND.slogan}${url ? `\n${url}` : ''}`;
    const copy = button(this, cx, 890, 440, 88, d ? 'Share my Daily' : 'Copy score', async () => {
      let ok = false;
      try {
        await navigator.clipboard.writeText(share);
        ok = true;
        track('copy_score', { daily: !!d });
      } catch {
        /* clipboard blocked */
      }
      copy.setLabel(ok ? 'Copied!' : 'Copy blocked');
    }, 'ghost');

    // Playtest feedback first (once per device), then email capture. Only when a backend is configured.
    if (telemetryActive() && !feedbackGiven()) {
      const fb = button(this, cx, 1000, 440, 84, '💬 3 quick questions', () => {
        void askFeedback(async (a) => {
          const status = await insert('feedback', { device: deviceId(), ...a, comment: a.comment || null, app_version: APP_VERSION });
          if (status === 0 || status >= 400 && status !== 409) return "Couldn't send right now. Please try again.";
          setFeedbackGiven();
          track('feedback_sent', { door_rule: a.door_rule, fun: a.fun });
          return null;
        }).then((sent) => sent && fb.setLabel('✓ Thanks for the feedback!').setEnabled(false));
      }, 'accent');
    } else if (waitlistEnabled() && !emailJoined()) {
      const join = button(this, cx, 1000, 440, 84, '📬 New modes by email', () => {
        void ask({
          title: 'Get new Vanful modes by email',
          label: 'Your email',
          type: 'email',
          submit: 'Sign me up',
          note: 'Only Vanful news: new modes, about once a month. Unsubscribe from any email. Stored in our waitlist table, never sold.',
          onSubmit: async (v) => {
            const r = await joinWaitlist(v, d ? 'daily' : 'gameover');
            if (r === 'invalid') return 'Please enter a valid email address.';
            if (r === 'error' || r === 'disabled') return "Couldn't sign you up right now. Please try again.";
            setEmailJoined();
            track('email_join', { source: d ? 'daily' : 'gameover' });
            join.setLabel('✓ You are on the list').setEnabled(false);
            return null;
          },
        });
      }, 'ghost');
    }

    text(this, cx, 1130, d ? 'A new Daily Load arrives at midnight UTC.' : 'Tip: load the last stop deepest, the first stop by the door.', 24, { color: HEX.muted, weight: '600', wrap: 620 });
    button(this, cx, 1215, 260, 72, 'Home', () => this.scene.start('Title'), 'ghost');
    this.input.keyboard?.once('keydown-ENTER', again);
    this.input.keyboard?.once('keydown-SPACE', again);
  }
}
