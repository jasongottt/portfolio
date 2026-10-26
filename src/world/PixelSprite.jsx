import { useMemo } from "react";
import { PIXEL_CLASS, spritePaths } from "./pixelArt";

// A sprite from pixelArt.js, drawn as one path per color with its top-left at
// (x, y) in pixels. Colors come from the px-* classes in index.css.
export default function PixelSprite({ rows, x = 0, y = 0 }) {
  const paths = useMemo(() => spritePaths(rows, x, y), [rows, x, y]);
  return Object.entries(paths).map(([key, d]) => (
    <path key={key} d={d} className={PIXEL_CLASS[key]} />
  ));
}
