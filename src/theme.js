/**
 * Site-wide color rotation.
 *
 * Every accent on the page is one hue at a different lightness and alpha, so
 * the whole palette resolves from a single `--hue` custom property and can be
 * rotated as a set. `--sat` is a multiplier, not an absolute: perceived
 * intensity varies a lot by hue, so warm and green hues get trimmed to keep
 * them from shouting at the lavender's original saturation.
 *
 * Hues are curated rather than random over [0, 360). The band from roughly
 * 60-140 degrees turns muddy at these lightnesses, so it is skipped, and so is
 * the green around 152 -- that is where the fixed "Playable!" status badge
 * lives, and it has to stay visibly separate from whatever the palette is.
 */
export const THEME_PRESETS = [
  { id: "lavender", name: "Lavender", hue: 262, sat: 1 },
  { id: "amethyst", name: "Amethyst", hue: 274, sat: 1 },
  { id: "violet", name: "Violet", hue: 285, sat: 1 },
  { id: "orchid", name: "Orchid", hue: 300, sat: 1 },
  { id: "magenta", name: "Magenta", hue: 318, sat: 0.96 },
  { id: "rose", name: "Rose", hue: 334, sat: 0.98 },
  { id: "crimson", name: "Crimson", hue: 352, sat: 0.94 },
  { id: "scarlet", name: "Scarlet", hue: 8, sat: 0.95 },
  { id: "ember", name: "Ember", hue: 24, sat: 0.88 },
  { id: "gold", name: "Gold", hue: 44, sat: 0.86 },
  { id: "teal", name: "Teal", hue: 186, sat: 0.94 },
  { id: "cyan", name: "Cyan", hue: 194, sat: 0.92 },
  { id: "azure", name: "Azure", hue: 205, sat: 1 },
  { id: "steel", name: "Steel", hue: 216, sat: 0.9 },
  { id: "indigo", name: "Indigo", hue: 232, sat: 1 },
  { id: "periwinkle", name: "Periwinkle", hue: 246, sat: 1 },
  // Two near-neutrals. The hue still drives everything, but at this little
  // saturation the site reads as monochrome rather than tinted -- a genuinely
  // different look rather than another point on the color wheel.
  { id: "graphite", name: "Graphite", hue: 224, sat: 0.16 },
  { id: "sand", name: "Sand", hue: 36, sat: 0.2 },
];

export const DEFAULT_THEME = THEME_PRESETS[0];

const STORAGE_KEY = "portfolio:theme";

/**
 * CSS consumes --hue directly, but the Dither background cannot: it takes a raw
 * RGB triple. This is the one conversion, so the shader and the CSS borders
 * stay in step. Defaults match the wave color the site shipped with.
 */
export function themeToRgbTriple(theme, saturation = 0.51, lightness = 0.63) {
  const s = Math.min(1, saturation * theme.sat);
  const h = (((theme.hue % 360) + 360) % 360) / 60;
  const c = (1 - Math.abs(2 * lightness - 1)) * s;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = lightness - c / 2;
  const [r, g, b] =
    h < 1 ? [c, x, 0]
    : h < 2 ? [x, c, 0]
    : h < 3 ? [0, c, x]
    : h < 4 ? [0, x, c]
    : h < 5 ? [x, 0, c]
    : [c, 0, x];
  return [r + m, g + m, b + m];
}

export function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--hue", String(theme.hue));
  root.style.setProperty("--sat", String(theme.sat));
}

export function findTheme(id) {
  return THEME_PRESETS.find((theme) => theme.id === id) ?? null;
}

/** Never returns the theme already on screen, so every click visibly changes. */
export function pickRandomTheme(currentId) {
  const pool = THEME_PRESETS.filter((theme) => theme.id !== currentId);
  return pool[Math.floor(Math.random() * pool.length)] ?? DEFAULT_THEME;
}

export function readStoredTheme() {
  try {
    return findTheme(window.localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_THEME;
  } catch {
    // Private mode or blocked site data: fall back to the default palette.
    return DEFAULT_THEME;
  }
}

export function storeTheme(theme) {
  try {
    if (theme.id === DEFAULT_THEME.id) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, theme.id);
  } catch {
    // Persistence is a convenience; ignore quota or permission failures.
  }
}
