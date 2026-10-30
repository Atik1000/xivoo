/** Xivoo design tokens — single source of truth for storefront and admin. */
export const COLORS = {
  brand: '#FF6A00',
  dark: '#111315',
  brand50: '#FFEDE0',
  brand25: '#FFF6EF',
  ink: '#16181A',
  ink2: '#3A3F45',
  muted: '#6B7076',
  muted2: '#9AA0A6',
  disabled: '#B5BABF',
  bg: '#F5F5F5',
  surface: '#ffffff',
  surface2: '#EFEFEF',
  line: '#E4E4E4',
  line2: '#ECECEC',
  inputBorder: '#D8D8D8',
  amber: '#FFB133',
  saleRed: '#E02D2D',
  saleTint: '#FDE9E9',
  amberTint: '#FFF4D6',
  amberInk: '#8A6400',
  footerText: '#E8EAED',
  footerLegal: '#9AA0A6',
} as const;

/** Neutral tech tints shown behind product imagery while it loads. */
export const TONES: Record<string, string> = {
  sage: '#E8ECE9',
  sand: '#F0EBE2',
  clay: '#F2E5D9',
  sky: '#E3E9F0',
  blush: '#F3E4E2',
  butter: '#F4EDDC',
  mist: '#E9E8EE',
};

/** Colour swatches: key → [label, hex] */
export const COLOR_SWATCHES: Record<string, [string, string]> = {
  black: ['Black', '#16181A'],
  white: ['White', '#F2F2F0'],
  grey: ['Grey', '#9A9C9E'],
  silver: ['Silver', '#C9CDD2'],
  gunmetal: ['Gunmetal', '#2E3238'],
  navy: ['Navy', '#26344D'],
  orange: ['Xivoo Orange', '#FF6A00'],
  teal: ['Teal', '#2F7A78'],
  pink: ['Rose', '#D99AA5'],
  tan: ['Tan', '#9A6A3E'],
};

/** Format integer taka with the ৳ sign, en-IN grouping. */
export const fmt = (n: number): string => '৳' + Number(n).toLocaleString('en-IN');
