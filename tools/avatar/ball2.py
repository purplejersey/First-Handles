"""Painted basketball sprite: pebbled leather, seam channels, soft shading.

Frames show a quarter turn about the spin axis (the seam pattern repeats every
90 degrees around it), so cycling the frames loops seamlessly.
Usage: ball2.py out.webp preview.png
"""
import math, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.spatial import cKDTree

FR = 48          # frames per full turn (7.5° each)
COLS = 8         # sprite grid: 8 x 6 frames
SS = 2           # supersampling
N = 192          # output frame size
M = N * SS
r = M / 2 - 2 * SS

yy, xx = np.mgrid[0:M, 0:M].astype(np.float64)
x = (xx - M / 2 + 0.5) / r
y = (yy - M / 2 + 0.5) / r
d2 = x * x + y * y
inside = d2 <= 1.0
z = np.sqrt(np.clip(1 - d2, 0, 1))
P = np.stack([x, -y, z], -1)                         # view space (z toward camera)

def R(axis, deg):
    a = np.asarray(axis, float); a /= np.linalg.norm(a)
    c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    K = np.array([[0, -a[2], a[1]], [a[2], 0, -a[0]], [-a[1], a[0], 0]])
    return np.eye(3) + s * K + (1 - c) * K @ K

VIEW = R([0, 0, 1], 6)                               # spin axis = screen horizontal, slightly rolled
# how the seam pattern sits on the ball relative to the spin axis (classic front view, turned a little)
ORIENT = R([0, 1, 0], 24) @ R([0, 0, 1], -12)

# pebble centers, evenly spread on the sphere (ball space)
n = 15000
i = np.arange(n) + 0.5
phi = np.arccos(1 - 2 * i / n); th = math.pi * (1 + 5 ** 0.5) * i
pts = np.stack([np.cos(th) * np.sin(phi), np.sin(th) * np.sin(phi), np.cos(phi)], -1)
pts += np.random.default_rng(3).normal(0, 0.006, pts.shape)
pts /= np.linalg.norm(pts, axis=1, keepdims=True)
tree = cKDTree(pts)
spacing = math.sqrt(4 * math.pi / n)

L = np.array([-0.5, 0.62, 0.6]); L /= np.linalg.norm(L)
H = (L + np.array([0, 0, 1])); H /= np.linalg.norm(H)
ndl = P @ L
light = np.clip(0.5 + 0.5 * ndl, 0, 1) ** 1.6         # soft wrap, painterly
rim = 1 - 0.42 * (1 - z) ** 2.4
bounce = np.clip(-(P @ np.array([0.1, -1, 0.25])), 0, 1) ** 2   # warm floor bounce from below

base_lit = np.array([240, 128, 52], float)
base_dark = np.array([128, 44, 18], float)
seam_col = np.array([24, 14, 10], float)
outline = np.array([58, 24, 10], float)

frames = []
for f in range(FR):
    rot = R([1, 0, 0], 360.0 * f / FR)
    Q = P @ VIEW @ rot @ ORIENT                        # ball-space point for each pixel
    # pebbles: height bumps from the nearest pebble center
    dist, _ = tree.query(Q[inside].reshape(-1, 3), k=1)
    hgt = np.zeros((M, M)); hgt[inside] = np.clip(1 - (dist / (spacing * 0.62)) ** 2, 0, 1) ** 0.7
    gy, gx = np.gradient(ndi.gaussian_filter(hgt, 0.6 * SS))
    bump = -(gx * L[0] - gy * L[1]) * 4.2 * z           # emboss toward the light, fades at the rim
    # real 8-panel layout: two great circles crossing at right angles (x = 0 and
    # y = 0), plus two curved seams, one around each y pole. Those curves are not
    # flat: like a saddle, they dip toward the equator front and back and rise at
    # the sides (polar angle = T0 + B*cos(2*azimuth)). Seen straight on, that's the
    # cross with a smile above it and a frown below it.
    a1 = np.abs(Q[..., 1]); a2 = np.abs(Q[..., 0])
    T0, B = math.radians(52), math.radians(12)
    theta = np.arccos(np.clip(np.abs(Q[..., 1]), 0, 1))
    azim = np.arctan2(Q[..., 0], Q[..., 2])
    side = np.abs(theta - (T0 + B * np.cos(2 * azim)))
    ds = np.minimum(np.minimum(a1, a2), side)
    w = 0.027
    seam = np.clip((w - ds) / (0.006) + 0.5, 0, 1)     # crisp black channel
    groove = np.clip(1 - (ds - w) / (w * 1.4), 0, 1) * (ds > w)  # leather dips into the seam
    # color
    t = np.clip(light * rim + 0.06 * bump, 0, 1.15)
    col = base_dark[None, None] + (base_lit - base_dark)[None, None] * t[..., None]
    col *= (1 - 0.11 * hgt)[..., None]                 # valleys between pebbles slightly darker
    col = col + np.array([60, 22, 8]) * (0.18 * bounce)[..., None]
    col *= (1 - 0.32 * groove)[..., None]
    spec = np.clip(P @ H, 0, 1) ** 18 * 0.22 * (1 - seam)   # broad, soft sheen (painted, not glossy)
    col += (255 * spec)[..., None]
    col = col * (1 - seam[..., None]) + seam_col * seam[..., None]
    # dark outline like the illustration
    rr = np.sqrt(d2)
    edge = np.clip((rr - (1 - 0.028)) / 0.012, 0, 1)
    col = col * (1 - edge[..., None]) + outline * edge[..., None]
    alpha = np.clip((1 - rr) * r + 0.5, 0, 1)
    rgba = np.dstack([np.clip(col, 0, 255), alpha * 255]).astype(np.uint8)
    frames.append(Image.fromarray(rgba, "RGBA").resize((N, N), Image.LANCZOS))

sheet = Image.new("RGBA", (N * COLS, N * (FR // COLS)))
for k, im in enumerate(frames): sheet.paste(im, ((k % COLS) * N, (k // COLS) * N))
sheet.save(sys.argv[1], "WEBP", quality=82, method=6)
prev = Image.new("RGBA", (N * 6 + 50, N), (200, 205, 210, 255))
for k in range(6): prev.alpha_composite(frames[k * 8], (k * (N + 10), 0))
prev.save(sys.argv[2])
print("ok", sheet.size)
