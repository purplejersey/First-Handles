// Team-color recolor for the illustrated avatar (Chunk C2).
//
// Each recolorable image ships with a mask image of the same size:
//   red = jersey/shorts fabric, green = trim (soft edges), alpha = the art's alpha.
// Every masked pixel keeps its own light and shadow (its brightness compared with
// the art's average fabric tone) but takes the new color, so folds and shading
// survive any team color. Runs once per image + color pair, then it's cached;
// the animation itself never pays for it.

const cache = new Map();

function hexToRgb(hex) {
  const h = String(hex).trim().replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// New channel value for a pixel that is `ratio` times as bright as the art's average
// fabric. `soft` (0..1) eases the contrast for light colors, where the fabric's
// fine grain would otherwise read as speckles.
function shade(target, ratio, soft) {
  let r = Math.pow(Math.max(ratio, 0), 0.8);        // keep folds, soften extremes a touch
  r = 1 + (r - 1) * (1 - 0.5 * soft);
  return r <= 1 ? target * r : target + (255 - target) * Math.min(1, (r - 1) * 0.35);
}
const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const softFor = (c) => Math.min(1, Math.max(0, (luma(c) - 120) / 110));

/**
 * Recolor an image. ref = { jersey, trim }: the art's mean fabric luminance under each mask.
 * Returns a promise of an object URL (cached per image + colors).
 */
export function recolorImage(src, mask, jerseyHex, trimHex, ref) {
  const key = `${src}|${jerseyHex}|${trimHex}`;
  if (cache.has(key)) return cache.get(key);
  const job = Promise.all([loadImage(src), loadImage(mask)]).then(([img, msk]) => {
    const w = img.naturalWidth, h = img.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(msk, 0, 0, w, h);
    const m = ctx.getImageData(0, 0, w, h).data;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, w, h);
    const p = data.data;
    const J = hexToRgb(jerseyHex), T = hexToRgb(trimHex);
    const sJ = softFor(J), sT = softFor(T) * 0.5;
    for (let i = 0; i < p.length; i += 4) {
      const a = m[i + 3];
      if (!a) continue;
      const wj = m[i] / a, wt = m[i + 1] / a;          // masks were stored pre-multiplied by alpha
      if (wj < 0.004 && wt < 0.004) continue;
      const L = 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2];
      for (const [wgt, C, base, soft] of [[wj, J, ref.jersey, sJ], [wt, T, ref.trim, sT]]) {
        if (wgt < 0.004) continue;
        const ratio = L / base;
        for (let c = 0; c < 3; c++) p[i + c] = p[i + c] * (1 - wgt) + shade(C[c], ratio, soft) * wgt;
      }
    }
    ctx.putImageData(data, 0, 0);
    return new Promise((resolve) => canvas.toBlob((b) => resolve(URL.createObjectURL(b)), "image/png"));
  });
  cache.set(key, job);
  return job;
}

/** The team colors currently applied (CSS variables set by the theme). */
export function teamColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    jersey: s.getPropertyValue("--jersey").trim() || "#4B2E83",
    trim: s.getPropertyValue("--jersey-trim").trim() || "#FDB927",
  };
}
