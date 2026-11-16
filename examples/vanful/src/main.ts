import { tutorialDone } from './storage';

// The HTML page paints first. The game engine (Phaser, ~95% of the JS) loads:
// - right away for returning players, or
// - on the Play button for first-time visitors, who go straight into the guided delivery.
// This keeps the first visit fast on phones and makes the HTML page a real front door.
const status = document.getElementById('status');
const play = document.getElementById('play') as HTMLButtonElement | null;
let started = false;

const boot = (tutorial: boolean) => {
  if (started) return;
  started = true;
  if (play) play.disabled = true;
  if (status) status.textContent = 'Loading the van…';
  import('./game')
    .then(({ startGame }) => startGame({ tutorial }))
    .catch(() => {
      if (status) status.textContent = 'The game could not load. Please refresh the page.';
    });
};

if (tutorialDone()) {
  if (play) play.hidden = true;
  if (document.readyState === 'complete') requestAnimationFrame(() => boot(false));
  else addEventListener('load', () => requestAnimationFrame(() => boot(false)), { once: true });
} else {
  if (status) status.textContent = '';
  play?.addEventListener('click', () => boot(true));
}
