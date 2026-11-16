import Phaser from 'phaser';
import { CFG } from '../config';
import { eventCounts } from '../track';
import { APP_VERSION, backendEnabled } from '../backend';
import { setSharing, sharingOn } from '../telemetry';
import { CHANNEL, CREATOR, outsideLinksAllowed } from '../channel';
import { BRAND, HEX } from '../theme';
import { button, text } from '../ui';

const VERSION = APP_VERSION;
const PRIVACY = backendEnabled()
  ? 'No account and no ads. To improve the game, Vanful can send anonymous play data: a random device id, game events (like \u201cfinished the tutorial\u201d) and their timings. No name, email or location. It is off if your browser sends Do-Not-Track or Global Privacy Control, and you can switch it off below. Your best score and settings stay in this browser.'
  : 'No account, no ads, no tracking. Nothing you do leaves this device. Your best score, settings and an anonymous play log (add ?stats to the address to see it) stay in this browser.';

export class AboutScene extends Phaser.Scene {
  constructor() {
    super('About');
  }

  create() {
    const cx = CFG.WIDTH / 2;
    const back = () => this.scene.start('Title');
    this.add.image(cx, 150, 'logo').setScale(0.4);
    text(this, cx, 270, `About ${BRAND.name}`, 56, { display: true });

    const sections: [string, string][] = [
      ['What it is', 'A short delivery puzzle: pack odd parcels into a van, plan the fastest route through town, and deliver before the shift clock runs out.'],
      ['Privacy', PRIVACY],
      ['Credits', `Made by ${CREATOR.name}. Fonts: Fredoka and Nunito (SIL Open Font License). Engine: Phaser. Sounds are synthesised in the browser.`],
    ];
    let y = 360;
    for (const [h, body] of sections) {
      text(this, 60, y, h, 32, { display: true, color: HEX.primary, align: 'left' }).setOrigin(0, 0);
      const b = text(this, 60, y + 46, body, 25, { color: HEX.fg, align: 'left', wrap: 600, weight: '600' }).setOrigin(0, 0);
      y += 46 + b.height + 40;
    }

    // Creator link: clickable on our site and itch.io; CrazyGames/Poki don't allow links out of the game.
    const link = outsideLinksAllowed(CHANNEL);
    const c = text(this, 60, y - 24, link ? `Visit ${CREATOR.name} \u2197` : CREATOR.name, 26, {
      display: true, color: HEX.primary, align: 'left',
    }).setOrigin(0, 0);
    if (link) {
      c.setInteractive({ useHandCursor: true }).on('pointerup', () => window.open(CREATOR.url, '_blank', 'noopener'));
    }
    y += c.height + 16;

    // ?stats shows the local play log counts (for the developer and curious players).
    if (new URLSearchParams(location.search).has('stats')) {
      const counts = Object.entries(eventCounts()).map(([k, v]) => `${k}: ${v}`).join('  ·  ') || 'no events yet';
      text(this, 60, y, `Local play log: ${counts}`, 20, { color: HEX.muted, align: 'left', wrap: 600 }).setOrigin(0, 0);
    }

    if (backendEnabled()) {
      const t = button(this, cx, 1040, 520, 76, `Anonymous play data: ${sharingOn() ? 'On' : 'Off'}`, () => {
        setSharing(!sharingOn());
        t.setLabel(`Anonymous play data: ${sharingOn() ? 'On' : 'Off'}`);
      }, 'ghost');
    }
    text(this, cx, 1120, `${BRAND.name} ${VERSION}`, 22, { color: HEX.muted });
    button(this, cx, 1210, 340, 96, '◀ Back', back);
    this.input.keyboard?.once('keydown-ESC', back);
    this.input.keyboard?.once('keydown-ENTER', back);
  }
}
