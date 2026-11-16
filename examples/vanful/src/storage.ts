// localStorage can throw (private mode, blocked storage): never let it break the game.
export function load(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export const getBest = () => Number(load('vanful.best', '0')) || 0;
export const setBest = (v: number) => save('vanful.best', String(v));

export const tutorialDone = () => load('vanful.tutorial', '0') === '1';
export const setTutorialDone = () => save('vanful.tutorial', '1');

// Daily Load
import type { RoundResult, Streak } from './logic/daily';
export const getDaily = (key: string): { score: number; rounds: RoundResult[] } | null => {
  try {
    return JSON.parse(load(`vanful.daily.${key}`, 'null'));
  } catch {
    return null;
  }
};
export const setDaily = (key: string, v: { score: number; rounds: RoundResult[] }) => save(`vanful.daily.${key}`, JSON.stringify(v));
export const getStreak = (): Streak | null => {
  try {
    return JSON.parse(load('vanful.streak', 'null'));
  } catch {
    return null;
  }
};
export const setStreak = (s: Streak) => save('vanful.streak', JSON.stringify(s));

// Garage
export const getPaint = () => load('vanful.paint', 'classic');
export const setPaint = (id: string) => save('vanful.paint', id);
export const isSupporter = () => load('vanful.supporter', '0') === '1';
export const setSupporter = () => save('vanful.supporter', '1');
export const emailJoined = () => load('vanful.emailJoined', '0') === '1';
export const setEmailJoined = () => save('vanful.emailJoined', '1');

export const feedbackGiven = () => load('vanful.feedback', '0') === '1';
export const setFeedbackGiven = () => save('vanful.feedback', '1');
