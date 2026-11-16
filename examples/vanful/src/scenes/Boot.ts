import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.svg('logo', 'logo-mark.svg', { width: 300, height: 300 });
  }

  async create() {
    // Canvas text needs the web fonts loaded before first render.
    try {
      await Promise.race([
        Promise.all(['600 40px Fredoka', '500 40px Fredoka', '700 24px Nunito', '600 24px Nunito'].map((f) => document.fonts.load(f))),
        new Promise((r) => setTimeout(r, 1500)),
      ]);
    } catch {
      /* fall back to system fonts */
    }
    document.body.classList.add('ready');
    // First visit: the HTML page's Play button goes straight into the guided delivery.
    if (this.registry.get('autostart') === 'tutorial') this.scene.start('Game', { tutorial: true });
    else this.scene.start('Title');
  }
}
