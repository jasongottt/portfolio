/**
 * Pixel art: the landmark sprites section headings wear. (The character the
 * world draws is in heroSprite.js.)
 *
 * Sprites are rows of characters, one per pixel. Each character is a color
 * with a CSS class (index.css), so the site hue colors it:
 *   o outline   l light   m mid   d dark   g gold   t mint
 */

export const PIXEL_CLASS = {
  o: "px-outline",
  l: "px-light",
  m: "px-mid",
  d: "px-dark",
  g: "px-gold",
  t: "px-mint",
};

const grid = (width, height) => Array.from({ length: height }, () => new Array(width).fill("."));
const join = (rows) => rows.map((row) => row.join(""));

function envelope() {
  const rows = grid(11, 8);
  rows.forEach((row, r) =>
    row.forEach((_, c) => {
      const edge = r === 0 || r === 7 || c === 0 || c === 10;
      const flap = r <= 4 && (c === r || c === 10 - r);
      row[c] = edge || flap ? "o" : r >= 5 ? "m" : "l";
    })
  );
  return join(rows);
}

function sailboat() {
  const rows = grid(13, 12);
  for (let r = 0; r <= 9; r++) rows[r][6] = "o";
  rows[1][7] = rows[1][8] = rows[2][7] = rows[2][8] = "g";
  for (let r = 3; r <= 8; r++) for (let c = 7; c <= 7 + (r - 3); c++) rows[r][c] = "t";
  for (let r = 5; r <= 8; r++) for (let c = 6 - (r - 4); c <= 5; c++) rows[r][c] = "l";
  rows[9].fill("o");
  for (let c = 1; c < 12; c++) rows[10][c] = c === 1 || c === 11 ? "o" : "m";
  for (let c = 2; c < 11; c++) rows[11][c] = "o";
  return join(rows);
}

function boxingRing() {
  const rows = grid(13, 11);
  for (let r = 0; r <= 7; r++) rows[r][0] = rows[r][12] = "o";
  rows[0][0] = rows[0][12] = "g";
  for (const r of [2, 4, 6]) for (let c = 1; c < 12; c++) rows[r][c] = "t";
  rows[8].fill("o");
  rows[10].fill("o");
  rows[9].fill("m");
  rows[9][0] = rows[9][12] = "o";
  return join(rows);
}

// Stage landmarks.
export const SPRITES = {
  house: [
    "....ooo....",
    "...olllo...",
    "..ollllmo..",
    ".ollllmmmo.",
    "ooooooooooo",
    ".ommmmmmmo.",
    ".oggmmmddo.",
    ".oggmmmddo.",
    ".ommmmmddo.",
    ".ooooooooo.",
  ],
  tower: [
    "....ooo....",
    "...olllo...",
    "...ollmo...",
    "..ooooooo..",
    "...olllo...",
    "...odddo...",
    "...odgdo...",
    "...olllo...",
    "...ollmo...",
    "...olgmo...",
    "...ollmo...",
    "...ollmo...",
    "..ooooooo..",
    ".ommmmmmmo.",
    ".ooooooooo.",
  ],
  computer: [
    "ooooooooooo",
    "olllllllllo",
    "oldddddddlo",
    "oldtdddddlo",
    "olddtddddlo",
    "oldtddttdlo",
    "oldddddddlo",
    "olllllllllo",
    "ooooooooooo",
    "....omo....",
    "..ooooooo..",
  ],
  letter: envelope(),
  scroll: [
    "oooooo...",
    "ollllloo.",
    "olllllolo",
    "olllllooo",
    "olllllllo",
    "oldddddlo",
    "olllllllo",
    "oldddddlo",
    "olllllllo",
    "olddddllo",
    "olllllllo",
    "ooooooooo",
  ],
  ship: sailboat(),
  ring: boxingRing(),
};

const rectPath = (x, y, width, height) => `M${x} ${y}h${width}v${height}h${-width}Z`;

/** A sprite as one path per color, in pixels with its top-left at (x, y). */
export function spritePaths(rows, x = 0, y = 0) {
  const paths = {};
  rows.forEach((row, r) =>
    [...row].forEach((color, c) => {
      if (color === ".") return;
      paths[color] = (paths[color] ?? "") + rectPath(x + c, y + r, 1, 1);
    })
  );
  return paths;
}
