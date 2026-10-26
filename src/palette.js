/**
 * Palette helpers. Every accent on the site is the same hue at a different
 * lightness and alpha, so they all resolve from --hue (index.css): the
 * indigo of the world's dusk sea. --sat scales the saturation.
 */
export const tint = (saturation, lightness, alpha) =>
  `hsl(var(--hue) calc(${saturation}% * var(--sat)) ${lightness}%${
    alpha === undefined ? "" : ` / ${alpha}`
  })`;

/**
 * Panel and page grounds. These take the hue but skip the saturation scaling:
 * at 2-7% lightness the tint is barely perceptible, and trimming it further
 * would just flatten every palette to the same black.
 */
export const shade = (saturation, lightness, alpha) =>
  `hsl(var(--hue) ${saturation}% ${lightness}%${
    alpha === undefined ? "" : ` / ${alpha}`
  })`;

export const RULE = tint(50, 80, 0.18);
export const RULE_SOFT = tint(50, 80, 0.1);
export const PANEL_BG = shade(27, 4, 0.58);
