"""Player-card portrait: remove the baked-in jersey number, build recolor masks.

Outputs portrait.webp, portrait_mask.webp (R = jersey, G = trim) and prints the
number's spot and the reference tones for the recolor module.
Usage: prep_portrait.py src.png outdir
"""
import json, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from masks import soft_masks, reference_luma

src, out = sys.argv[1], sys.argv[2]
im = np.array(Image.open(src).convert("RGBA")).astype(np.float32)
rgb, alpha = im[..., :3].copy(), im[..., 3] / 255.0
H, W = alpha.shape
yy, xx = np.mgrid[0:H, 0:W]

# --- paint out the "0": neon + its drop shadow inside the number's box ---
NUM_BOX = (500, 448, 606, 608)                     # x0, y0, x1, y1 (source px)
box = (xx >= NUM_BOX[0]) & (xx < NUM_BOX[2]) & (yy >= NUM_BOX[1]) & (yy < NUM_BOX[3])
_, trim0 = soft_masks(rgb)
hole = ndi.binary_fill_holes(ndi.binary_dilation((trim0 > 0.08) & box, iterations=9)) & box
known = ~hole
fill = rgb.copy()
ring = ndi.binary_dilation(hole, iterations=6) & ~hole
fill[hole] = rgb[ring].mean(axis=0)                # start from the surrounding fabric
# harmonic fill: repeatedly blur, keeping the known fabric fixed
for it in range(400):
    blur = np.dstack([ndi.uniform_filter(fill[..., k], 5) for k in range(3)])
    fill[hole] = blur[hole]
# a little fabric grain so the patch isn't plastic-smooth
grain = ndi.gaussian_filter(np.random.default_rng(5).standard_normal((H, W)), 1.2)
fill[hole] *= (1 + 0.02 * grain[hole])[:, None]
soft = np.clip(ndi.gaussian_filter(hole.astype(np.float32), 3.0) * 1.4, 0, 1)[..., None]
rgb = rgb * (1 - soft) + fill * soft

# --- masks + reference tones (shoes excluded: they're his real sneakers) ---
jersey, trim = soft_masks(rgb)
shoes = yy > 1300
jersey[shoes] = 0; trim[shoes] = 0
jersey *= alpha; trim *= alpha
ref = {"jersey": round(reference_luma(rgb, jersey), 2), "trim": round(reference_luma(rgb, trim), 2)}

# --- save at card size ---
scale = 0.6
size = (round(W * scale), round(H * scale))
Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8), "RGBA") \
    .resize(size, Image.LANCZOS).save(f"{out}/portrait.webp", "WEBP", quality=86, method=6)
mask = np.dstack([jersey * 255, trim * 255, np.zeros_like(jersey), alpha * 255]).astype(np.uint8)
Image.fromarray(mask, "RGBA").resize(size, Image.LANCZOS).save(f"{out}/portrait_mask.webp", "WEBP", lossless=True)
# --- jersey number helpers (card size) ---
# fabric-only mask for the number: front of the jersey, kept clear of the trim
L = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
front = (jersey > 0.5) & (yy < 760) & (xx > 420) & (xx < 650)
front = ndi.binary_erosion(front, iterations=4)
front_a = np.clip(ndi.gaussian_filter(front.astype(np.float32), 1.5) * 1.6 - 0.3, 0, 1)
chest = np.dstack([np.full_like(front_a, 255)] * 3 + [front_a * 255]).astype(np.uint8)
Image.fromarray(chest, "RGBA").resize(size, Image.LANCZOS).save(f"{out}/portrait_chest.webp", "WEBP", lossless=True)
# fabric shading: 1 on lit fabric, darker in folds (multiplied over the number)
hi = np.percentile(L[front], 70)
shade = np.clip(L / hi, 0.62, 1.0)
shade = np.where(front, shade, 1.0)
shade = ndi.gaussian_filter(shade, 1.2)
g = (shade * 255).astype(np.uint8)
Image.fromarray(np.dstack([g, g, g]), "RGB").resize(size, Image.LANCZOS).save(f"{out}/portrait_shade.webp", "WEBP", quality=85)
# number box: centered on the front panel at chest height (source px)
spot = {"cx": 533, "cy": 532, "height": 124, "maxWidth": 126}
json.dump({"ref": ref, "number": spot, "aspect": round(W / H, 4)}, open(f"{out}/portrait.json", "w"))
print(json.dumps({"ref": ref, "number": spot}))
