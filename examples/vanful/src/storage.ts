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
