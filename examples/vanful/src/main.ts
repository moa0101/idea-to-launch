import Phaser from 'phaser';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import { CFG } from './config';
import { HEX } from './theme';
import { BootScene } from './scenes/Boot';
import { TitleScene } from './scenes/Title';
import { GameScene } from './scenes/Game';
import { GameOverScene } from './scenes/GameOver';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: CFG.WIDTH,
  height: CFG.HEIGHT,
  backgroundColor: HEX.bg,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 2 },
  scene: [BootScene, TitleScene, GameScene, GameOverScene],
});

// Handy for debugging in the console (read-only inspection).
(window as unknown as { __vanful: Phaser.Game }).__vanful = game;
