"""Streetball court backdrop for the drill animation (placeholder art, made in code).

Dusk sky, city skyline, chain-link fence over a graffiti-style wall, and an asphalt
court with painted lines in perspective. Matches the drill box (400 x 300 units,
floor contact at y 258). Team color is added live on top (CSS/SVG), so the image
stays neutral. Usage: court_bg.py out.webp
"""
import math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

S = 4                      # pixels per drill-box unit
W, H = 400 * S, 300 * S
HORIZON = 182 * S          # where the court meets the fence line
rng = np.random.default_rng(11)

def lerp(a, b, t): return a + (b - a) * t

# ---------- sky ----------
yy = np.linspace(0, 1, H)[:, None]
top = np.array([22, 16, 48.0]); mid = np.array([92, 44, 96.0]); low = np.array([236, 124, 70.0])
t = np.clip(yy / (HORIZON / H), 0, 1)
sky = np.where(t < 0.6, lerp(top, mid, (t / 0.6)), lerp(mid, low, (t - 0.6) / 0.4))
img = np.repeat(sky[:, None, :], W, axis=1).reshape(H, W, 3).copy()

im = Image.fromarray(img.clip(0, 255).astype(np.uint8))
d = ImageDraw.Draw(im, "RGBA")

# ---------- skyline ----------
x = 0
while x < W:
    w = int(rng.integers(60, 170)); h = int(rng.integers(200, 560))
    y0 = HORIZON - 60 - h
    d.rectangle([x, y0, x + w, HORIZON], fill=(28, 20, 46, 255))
    for wy in range(y0 + 16, HORIZON - 70, 22):           # a few lit windows
        for wx in range(x + 10, x + w - 10, 18):
            if rng.random() < 0.18:
                d.rectangle([wx, wy, wx + 7, wy + 10], fill=(255, 200, 120, 150))
    x += w + int(rng.integers(0, 20))

# ---------- graffiti wall (low, behind the fence) ----------
wall_top = HORIZON - 160
d.rectangle([0, wall_top, W, HORIZON], fill=(58, 44, 70, 255))
for by in range(wall_top, HORIZON, 26):                   # brick courses
    d.line([(0, by), (W, by)], fill=(40, 30, 52, 255), width=3)
    off = 0 if (by // 26) % 2 else 40
    for bx in range(off, W, 80):
        d.line([(bx, by), (bx, by + 26)], fill=(40, 30, 52, 255), width=3)
# abstract graffiti: bold blobs and stripes (no letters), soft so it stays calm
g = Image.new("RGBA", (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
palette = [(255, 70, 160), (60, 220, 255), (255, 210, 40), (140, 255, 90), (170, 90, 255)]
for i in range(14):
    cx = int(rng.integers(0, W)); cy = int(rng.integers(wall_top + 40, HORIZON - 40))
    if abs(cx - W / 2) < 260: continue                     # keep the middle quiet
    c = palette[i % len(palette)]
    r = int(rng.integers(40, 110))
    gd.ellipse([cx - r, cy - r * 0.45, cx + r, cy + r * 0.45], fill=c + (110,))
    gd.line([(cx - r, cy + 20), (cx + r * 1.4, cy - 30)], fill=palette[(i + 2) % 5] + (170,), width=18)
g = g.filter(ImageFilter.GaussianBlur(3))
im.alpha_composite(g) if im.mode == "RGBA" else im.paste(g, (0, 0), g)
d = ImageDraw.Draw(im, "RGBA")

# ---------- chain-link fence ----------
fence_top = HORIZON - 420
fence = Image.new("RGBA", (W, H), (0, 0, 0, 0)); fd = ImageDraw.Draw(fence)
step = 34
for k in range(-H, W + H, step):
    fd.line([(k, fence_top), (k + (HORIZON - fence_top), HORIZON)], fill=(200, 200, 220, 70), width=3)
    fd.line([(k, HORIZON), (k + (HORIZON - fence_top), fence_top)], fill=(200, 200, 220, 70), width=3)
for px in range(0, W + 1, 320):                           # posts + top rail
    fd.rectangle([px - 7, fence_top - 10, px + 7, HORIZON], fill=(70, 70, 90, 255))
fd.rectangle([0, fence_top - 12, W, fence_top], fill=(80, 80, 100, 255))
im.paste(fence, (0, 0), fence)

# depth: soften everything behind the court a touch
bg = im.crop((0, 0, W, HORIZON)).filter(ImageFilter.GaussianBlur(2.2))
im.paste(bg, (0, 0))

# ---------- asphalt court ----------
court = np.zeros((H - HORIZON, W, 3))
ty = np.linspace(0, 1, H - HORIZON)[:, None]

base = lerp(np.array([62, 60, 70.0]), np.array([34, 33, 40.0]), ty)
court = np.repeat(base[:, None, :], W, axis=1).reshape(H - HORIZON, W, 3)
grain = rng.normal(0, 1, (H - HORIZON, W))
court += (grain * 7)[..., None]
speck = rng.random((H - HORIZON, W)) < 0.012
court[speck] += 30
crack = Image.new("L", (W, H - HORIZON), 0); cd = ImageDraw.Draw(crack)
for i in range(6):                                         # a few hairline cracks
    x0 = int(rng.integers(0, W)); y0 = int(rng.integers(20, H - HORIZON - 20))
    pts = [(x0, y0)]
    for _ in range(8):
        x0 += int(rng.integers(-60, 60)); y0 += int(rng.integers(-20, 30)); pts.append((x0, y0))
    cd.line(pts, fill=255, width=2)
court -= (np.array(crack) / 255.0 * 22)[..., None]
cim = Image.fromarray(court.clip(0, 255).astype(np.uint8))
im.paste(cim, (0, HORIZON))
d = ImageDraw.Draw(im, "RGBA")

# painted lines in perspective (vanishing point above the middle)
VX, VY = W / 2, HORIZON - 900
def proj(x, z):
    """x: court units from center, z: 0 = far (horizon) .. 1 = near (bottom)."""
    y = lerp(HORIZON, H + 140, z ** 1.15)
    sc = (y - VY) / (H - VY)
    return (VX + x * sc, y)
line = (235, 235, 240, 200)
# baseline far away + sidelines
d.line([proj(-900, 0.02), proj(900, 0.02)], fill=line, width=5)
for sx in (-700, 700):
    d.line([proj(sx, 0.02), proj(sx, 1.0)], fill=line, width=7)
# key (lane), painted a muted color, under the player
lane = [proj(-210, 0.06), proj(210, 0.06), proj(210, 0.78), proj(-210, 0.78)]
d.polygon(lane, fill=(120, 40, 60, 90))
d.line(lane + [lane[0]], fill=line, width=6)
# free-throw circle (ellipse in perspective) at the lane's near end
cx, cy = proj(0, 0.78)
rx = 210 * ((cy - VY) / (H - VY)); ry = rx * 0.28
d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=line, width=6)
# three-point arc around the lane
pts = []
for a in np.linspace(math.radians(-82), math.radians(82), 60):
    xx = 640 * math.sin(a); zz = 0.06 + 0.86 * math.cos(a)
    pts.append(proj(xx, min(zz, 1.05)))
d.line(pts, fill=line, width=6)

# streetlight glow from both upper corners
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0)); gl = ImageDraw.Draw(glow)
for gx in (80, W - 80):
    for r, a in ((520, 18), (340, 26), (180, 34)):
        gl.ellipse([gx - r, -r * 0.6, gx + r, r * 0.9], fill=(255, 190, 110, a))
glow = glow.filter(ImageFilter.GaussianBlur(40))
im = im.convert("RGBA"); im.alpha_composite(glow)
# vignette
vy, vx = np.mgrid[0:H, 0:W]
vig = 1 - 0.38 * (((vx - W / 2) / (W / 2)) ** 2 + ((vy - H * 0.55) / (H * 0.7)) ** 2).clip(0, 1.4)
arr = np.array(im).astype(np.float32)
arr[..., :3] *= vig[..., None]
out = Image.fromarray(arr.clip(0, 255).astype(np.uint8)).convert("RGB")
out.save(sys.argv[1], "WEBP", quality=82, method=6)
out.resize((800, 600)).save(sys.argv[1].replace(".webp", "_preview.png"))
print("ok", out.size)
