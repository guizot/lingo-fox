export type AccentColor = 'emerald' | 'blue' | 'cyan' | 'violet' | 'rose' | 'amber';

export interface AccentOption {
  id: AccentColor;
  label: string;
  sublabel: string;
  colorHex: string;
  previewClass: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  {
    id: 'blue',
    label: 'Ocean Blue',
    sublabel: 'Aviation & Travel Blue',
    colorHex: '#3b82f6',
    previewClass: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    sublabel: 'Nature & Adventure',
    colorHex: '#10b981',
    previewClass: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'cyan',
    label: 'Cyan',
    sublabel: 'Tropical Lagoon',
    colorHex: '#06b6d4',
    previewClass: 'from-cyan-500 to-teal-600',
  },
  {
    id: 'violet',
    label: 'Royal Violet',
    sublabel: 'Luxury Voyage',
    colorHex: '#8b5cf6',
    previewClass: 'from-violet-500 to-purple-600',
  },
  {
    id: 'rose',
    label: 'Rose',
    sublabel: 'Sunset Horizon',
    colorHex: '#f43f5e',
    previewClass: 'from-rose-500 to-pink-600',
  },
  {
    id: 'amber',
    label: 'Amber',
    sublabel: 'Desert Sun',
    colorHex: '#f59e0b',
    previewClass: 'from-amber-500 to-orange-600',
  },
];

export function applyAccent(accent: AccentColor) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('lingo_fox_accent_preference', accent);
    localStorage.setItem('travel_accent_preference', accent);
  } catch {}
  document.documentElement.setAttribute('data-accent', accent);
}

export function getStoredAccent(): AccentColor {
  if (typeof window === 'undefined') return 'cyan';
  try {
    const stored = (localStorage.getItem('lingo_fox_accent_preference') || localStorage.getItem('travel_accent_preference')) as AccentColor;
    if (stored && ACCENT_OPTIONS.some((o) => o.id === stored)) {
      return stored;
    }
  } catch {}
  return 'cyan';
}
