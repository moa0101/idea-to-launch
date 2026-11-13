import { load, save } from './storage';

type Name = 'pick' | 'place' | 'rotate' | 'error' | 'deliver' | 'penalty' | 'click' | 'over' | 'full';

/** Tiny WebAudio synth: no audio files, no licensing. */
class Sfx {
  private ctx?: AudioContext;
  muted = load('vanful.muted', '0') === '1';

  toggle() {
    this.muted = !this.muted;
    save('vanful.muted', this.muted ? '1' : '0');
    return this.muted;
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number, delay = 0) {
    try {
      this.ctx ??= new AudioContext();
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      const t = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch {
      /* audio unavailable */
    }
  }

  play(name: Name) {
    if (this.muted) return;
    switch (name) {
      case 'pick': return this.tone(520, 0.07, 'triangle', 0.12, 700);
      case 'place': return this.tone(220, 0.1, 'square', 0.08, 140);
      case 'rotate': return this.tone(880, 0.04, 'triangle', 0.08);
      case 'click': return this.tone(660, 0.05, 'triangle', 0.1);
      case 'error': return this.tone(150, 0.16, 'sawtooth', 0.07, 110);
      case 'penalty': return this.tone(200, 0.25, 'square', 0.08, 90);
      case 'deliver':
        this.tone(660, 0.1, 'triangle', 0.12);
        return this.tone(990, 0.16, 'triangle', 0.12, undefined, 0.08);
      case 'full':
        [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.14, 'triangle', 0.1, undefined, i * 0.07));
        return;
      case 'over':
        [523, 415, 330].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.12, undefined, i * 0.16));
        return;
    }
  }
}

export const sfx = new Sfx();
