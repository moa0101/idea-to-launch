import Phaser from 'phaser';
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import { CFG } from './config';
import { HEX } from './theme';
import { AboutScene } from './scenes/About';
import { setProvider } from './track';
import { sendEvent } from './telemetry';
import { GarageScene } from './scenes/Garage';
import { BootScene } from './scenes/Boot';
import { TitleScene } from './scenes/Title';
import { GameScene } from './scenes/Game';
import { GameOverScene } from './scenes/GameOver';

export function startGame(opts: { tutorial?: boolean } = {}) {
  setProvider((e, p) => sendEvent(e, p));
  const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: CFG.WIDTH,
  height: CFG.HEIGHT,
  backgroundColor: HEX.bg,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 2 },
  scene: [BootScene, TitleScene, GameScene, GameOverScene, AboutScene, GarageScene],
  });
  if (opts.tutorial) game.registry.set('autostart', 'tutorial');
  // Handy for debugging in the console (read-only inspection).
  (window as unknown as { __vanful: Phaser.Game }).__vanful = game;
  return game;
}
