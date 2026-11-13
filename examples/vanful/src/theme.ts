import tokens from '../brand/tokens.json';

const n = (hex: string) => parseInt(hex.replace('#', ''), 16);

export const BRAND = { name: tokens.name, slogan: tokens.slogan };

export const C = {
  primary: n(tokens.color.primary),
  accent: n(tokens.color.accent),
  bg: n(tokens.color.bg),
  fg: n(tokens.color.fg),
  muted: n(tokens.color.muted),
  border: n(tokens.color.border),
  danger: n(tokens.color.danger),
  success: n(tokens.color.success),
  white: 0xffffff,
  stops: tokens.color.stops.map(n),
};

export const HEX = {
  primary: tokens.color.primary,
  accent: tokens.color.accent,
  fg: tokens.color.fg,
  muted: tokens.color.muted,
  danger: tokens.color.danger,
  success: tokens.color.success,
  bg: tokens.color.bg,
  white: '#FFFFFF',
};

/** Text colour that reads on each stop colour (white on dark, ink on light). */
export const STOP_TEXT = ['#FFFFFF', tokens.color.fg, '#FFFFFF', '#FFFFFF', tokens.color.fg, tokens.color.fg];

export const FONT = { display: 'Fredoka, "Arial Rounded MT Bold", sans-serif', text: 'Nunito, system-ui, sans-serif' };
