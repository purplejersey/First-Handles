// Jersey numbers in a block athletic style that matches the illustration's own
// numerals: thick strokes with chamfered outer corners and a dark edge.
// Shared by the player card and the drill avatar so they always match.
//
// Each digit is a centerline path on a 60 x 100 cell, drawn with a thick
// stroke; bevel joins give the chamfered outer corners.

const STROKE = 21;
const CELL_W = 60, CELL_H = 100, GAP = 9;
const DIGITS = {
  0: "M10,10 H50 V90 H10 Z",
  1: "M17,23 L31,10 V90",
  2: "M10,10 H50 V50 H10 V90 H50",
  3: "M10,10 H50 V90 H10 M22,50 H50",
  4: "M10,10 V50 H50 M50,10 V90",
  5: "M50,10 H10 V50 H50 V90 H10",
  6: "M50,10 H10 V90 H50 V50 H10",
  7: "M10,10 H50 V90",
  8: "M10,10 H50 V90 H10 Z M10,50 H50",
  9: "M50,50 H10 V10 H50 V90 H10",
};

/** Width / height of a number in glyph units (height 100). */
function unitsWide(digits) {
  return digits.length * CELL_W + Math.max(0, digits.length - 1) * GAP;
}

/**
 * SVG markup for a jersey number centered at (cx, cy), at most `height` tall
 * and `maxWidth` wide (it shrinks to fit). Colors may be CSS variables.
 */
export function jerseyNumberSVG(number, { cx, cy, height, maxWidth, fill = "var(--jersey-trim)", edge = "rgba(16,6,32,0.55)" }) {
  const digits = String(number ?? "").replace(/\D/g, "").slice(0, 2);
  if (!digits) return "";
  const w = unitsWide(digits);
  const k = Math.min(height / CELL_H, maxWidth / w);
  const x0 = cx - (w * k) / 2, y0 = cy - (CELL_H * k) / 2;
  const paths = [...digits].map((d, i) => `<path d="${DIGITS[d]}" transform="translate(${i * (CELL_W + GAP)},0)"/>`).join("");
  const common = `fill="none" stroke-linejoin="bevel" stroke-linecap="butt" stroke-miterlimit="1"`;
  return `
    <g class="jersey-number" transform="translate(${x0.toFixed(2)},${y0.toFixed(2)}) scale(${k.toFixed(4)})">
      <g ${common} stroke="${edge}" stroke-width="${STROKE + 5}" transform="translate(1.6,2.2)">${paths}</g>
      <g ${common} stroke="${edge}" stroke-width="${STROKE + 3}">${paths}</g>
      <g ${common} stroke="${fill}" stroke-width="${STROKE}">${paths}</g>
    </g>`;
}
