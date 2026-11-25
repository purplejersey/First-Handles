"""Cut the stance illustration into puppet pieces for the drill engine.

Outputs (in OUT): one WebP per piece + rig.js with each piece's size, pivot
and rest angle in rig units (the drill box's 0-300 space, floor at y 258).
"""
import json, math, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from masks import soft_masks, reference_luma

SRC = sys.argv[1]
OUT = sys.argv[2]
DOWN = 0.75                       # output resolution vs. the source

img = np.array(Image.open(SRC).convert("RGB")).astype(np.float32)
H, W, _ = img.shape
R, G, B = img[..., 0], img[..., 1], img[..., 2]
mn, mx = img.min(axis=2), img.max(axis=2)

# ---------- joints (source px) ----------
J = {
    "pelvis": (502, 800), "neck": (512, 352),
    "shL": (357, 430), "elL": (236, 600), "wrL": (156, 716),
    "shR": (652, 430), "elR": (770, 600), "wrR": (848, 716),
    "hipL": (355, 800), "knL": (266, 985), "anL": (217, 1262),
    "hipR": (649, 800), "knR": (733, 985), "anR": (773, 1262),
}
CX, FLOOR_PX = 502, 1458
THUMB_PIVOT = (170, 755)            # base of the dribbling hand's thumb
THUMB_TIP = (198, 787)
S = 0.148                          # rig units per source px

def rig(p):
    return ((p[0] - CX) * S, 258 + (p[1] - FLOOR_PX) * S)

# ---------- figure mask with soft, de-haloed edges ----------
near_white = (mn > 236) & ((mx - mn) < 18)
lab, _ = ndi.label(near_white)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
fig = ~bg
fig = ndi.binary_opening(fig, iterations=1)
fig = ndi.binary_fill_holes(fig) | (fig & ~bg)
# alpha: 1 inside; near the edge estimate coverage from distance to white
edge = fig & ~ndi.binary_erosion(fig, iterations=2)
cov = np.clip((255 - mn) / 70.0, 0, 1)
alpha = fig.astype(np.float32)
alpha[edge] = np.maximum(cov[edge], 0.35)
# un-mix white from edge pixels so no white halo shows on the gym later
a3 = np.maximum(alpha, 1e-3)[..., None]
rgb = img.copy()
rgb[edge] = np.clip((img[edge] - (1 - a3[edge]) * 255) / a3[edge], 0, 255)

# defringe: edge pixels still carry some of the white background; pull their
# color toward the solid art just inside, so no pale halo shows on the ball or gym
inner = ndi.binary_erosion(fig, iterations=3)
_, (iy0, ix0) = ndi.distance_transform_edt(~inner, return_indices=True)
band = fig & ~inner
mixw = 0.7
rgb[band] = rgb[band] * (1 - mixw) + rgb[iy0[band], ix0[band]] * mixw

# ---------- color classes ----------
purple = (B > G + 25) & (R < B + 40) & (G < 120)
neon = (G > 170) & (R > 140) & (B < 130) & (G > B + 70) & (G >= R - 15)
jersey_px = purple | neon
sock = (mn > 175) & ((mx - mn) < 45)
jersey_near = ndi.binary_dilation(jersey_px, iterations=3)
skinlike = (R >= G - 4) & (G >= B - 8) & (R > 60) & ~jersey_near

# ---------- helpers ----------
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

def poly_mask(pts):
    from PIL import ImageDraw
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).polygon([tuple(p) for p in pts], fill=255)
    return np.array(m) > 0

def proj(a, b):
    """Distance along bone a->b (0 at a) and distance off the bone line."""
    ax, ay = a; bx, by = b
    dx, dy = bx - ax, by - ay
    L = math.hypot(dx, dy); ux, uy = dx / L, dy / L
    t = (xx - ax) * ux + (yy - ay) * uy
    off = np.abs(-(xx - ax) * uy + (yy - ay) * ux)
    return t, off, L

def ramp(t, t0, t1):
    return np.clip((t - t0) / (t1 - t0), 0, 1)

def component(mask, pt):
    lab, _ = ndi.label(mask)
    k = lab[pt[1], pt[0]]
    assert k, f"no component at {pt}"
    return lab == k

def fill_hidden(vis, extend):
    """Paint extend-only pixels with the nearest bright, solid piece pixel."""
    src = vis & (mx > 150) & ndi.binary_erosion(vis, iterations=3)
    if src.sum() < 50: src = vis
    _, (iy, ix) = ndi.distance_transform_edt(~src, return_indices=True)
    out = rgb.copy()
    m = extend & ~vis
    out[m] = rgb[iy[m], ix[m]]
    return out

def seg_angle(a, b):  # same convention as avatar.js: rotation that points +y along a->b
    return math.degrees(math.atan2(-(b[0] - a[0]), b[1] - a[1]))

pieces = {}
REFS = {}

def despike(a, r):
    """Grey opening with a disk: removes points and slivers thinner than ~2r px."""
    yy0, xx0 = np.ogrid[-r:r + 1, -r:r + 1]
    disk = (xx0 * xx0 + yy0 * yy0) <= r * r
    opened = ndi.grey_opening(np.pad(a, r + 2), footprint=disk)[r + 2:-(r + 2), r + 2:-(r + 2)]
    return np.minimum(a, ndi.gaussian_filter(opened, 0.6))

def save(name, colors, a, pivot, rest=0.0, recolor=False, smooth=0):
    a = np.clip(a, 0, 1)
    if smooth:
        a = despike(a, smooth)
    ys, xs = np.where(a > 0.01)
    x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
    x0, y0 = max(x0, 0), max(y0, 0)
    rgba = np.dstack([colors, a[..., None] * 255])[y0:y1, x0:x1].astype(np.uint8)
    im = Image.fromarray(rgba, "RGBA")
    w, h = round(im.width * DOWN), round(im.height * DOWN)
    im = im.resize((w, h), Image.LANCZOS)
    im.save(f"{OUT}/{name}.webp", "WEBP", quality=88, method=6)
    if recolor:
        # recolor mask: R = jersey/shorts fabric, G = trim (soft, same crop and size)
        jw, tw = soft_masks(colors)
        m = np.dstack([jw * a * 255, tw * a * 255, np.zeros_like(a), a * 255])[y0:y1, x0:x1].astype(np.uint8)
        Image.fromarray(m, "RGBA").resize((w, h), Image.LANCZOS).save(f"{OUT}/{name}_mask.webp", "WEBP", lossless=True)
        REFS[name] = {"jersey": round(reference_luma(colors, jw * a), 2), "trim": round(reference_luma(colors, tw * a), 2)}
    pieces[name] = {
        "w": round((x1 - x0) * S, 3), "h": round((y1 - y0) * S, 3),
        "x": round((x0 - pivot[0]) * S, 3), "y": round((y0 - pivot[1]) * S, 3),
        "rest": round(rest, 2),
    }

# ---------- torso (jersey + shorts + chest skin in the V) ----------
torso_poly = [(366, 322), (650, 322), (652, 528), (668, 700), (775, 860), (775, 905),
              (230, 905), (232, 860), (336, 700), (364, 528)]
head_poly = [(370, 15), (660, 15), (660, 326), (582, 326), (574, 356), (452, 356), (442, 326), (370, 326)]
headzone = poly_mask(head_poly)
tj = ndi.binary_closing(jersey_px & poly_mask(torso_poly), iterations=4)
chest_v = poly_mask([(445, 326), (580, 326), (514, 474)])
torso_vis = fig & (ndi.binary_fill_holes(tj | chest_v) | chest_v) & ~(headzone & ~jersey_px)
# the shorts hems hang below 905 in the middle: take the shorts' purple/neon there too
shorts_low = fig & ndi.binary_closing(jersey_px, iterations=3) & (yy >= 880) & (yy < 990) & (xx > 300) & (xx < 720)
torso_vis |= shorts_low
# Shoulders: the torso carries the dark inside of each armhole but none of the
# shoulder skin. The torso is drawn above
# the upper arms, so the seam where an arm rotates is always covered by the
# original art and never opens a sliver.
torso_a = alpha * torso_vis
# the chest skin in the V fades in from the top, so its edge never shows a line
# across the neck when the head and body move a little apart
torso_a = np.where(chest_v & ~jersey_px, torso_a * ramp(yy, 330, 372), torso_a)
for side in ("L", "R"):
    sx, sy = J["sh" + side]
    d = np.hypot(xx - sx, yy - sy)
    # no skin on the torso at the shoulders: the arm piece owns all of it (any
    # torso-owned skin there would show as a pale sliver once the arm turns)
    skin_here = fig & (R > B + 18) & (R > 110) & ~jersey_px & (d < 60)
    torso_a = np.where(skin_here, 0, torso_a)
    ax0, ax1 = (340, 392) if side == "L" else (612, 664)
    # only the dark purple/black inside of the armhole, not the arm's brown outline
    pit = fig & (mx < 95) & (B >= R - 8) & (xx >= ax0) & (xx < ax1) & (yy > 470) & (yy < 540)
    pit = ndi.binary_closing(pit, iterations=2) & fig & (B >= R - 20)
    torso_a = np.maximum(torso_a, alpha * pit)
torso_cols = rgb.copy()
TORSO_COVER = torso_a > 0.5
TORSO_COVER_PIT = fig & (mx < 95) & (B >= R - 8) & (yy > 470) & (yy < 540) & (((xx >= 340) & (xx < 392)) | ((xx >= 612) & (xx < 664)))
save("torso", torso_cols, torso_a, J["pelvis"], recolor=True, smooth=4)

# ---------- head (+ neck that reaches under the collar) ----------
head_vis = fig & headzone & ~jersey_near
# Neck under the collar: extend the neck straight down, exactly as wide as the neck
# itself (column by column), painted from the neck's lowest visible pixels and
# softened, so nothing boxy or streaky shows inside the V of the jersey.
# the neck's own width, measured just under the jaw
row = np.where(head_vis[338, 430:600])[0] + 430
nx0, nx1 = int(row.min()) + 2, int(row.max()) - 2
cols = rgb.copy()
neck_ext = np.zeros_like(head_vis)
for x in range(nx0, nx1 + 1):
    ys = np.where(head_vis[300:420, x])[0]
    if ys.size == 0:
        continue
    yb = 300 + ys.max()
    src = rgb[yb - 7:yb - 2, x].mean(axis=0)               # a few px above the cut
    neck_ext[yb - 2:450, x] = True                          # overlaps the cut: no seam
    cols[yb - 2:450, x] = src
    for k, yk in enumerate(range(yb - 10, yb - 2)):         # fade the art into the fill
        t = (k + 1) / 9
        cols[yk, x] = rgb[yk, x] * (1 - t) + src * t
smooth_cols = np.dstack([ndi.gaussian_filter(cols[..., c], 2.5) for c in range(3)])
band = neck_ext | ndi.binary_dilation(neck_ext, structure=np.ones((11, 1)), iterations=1)
cols[band & ~head_vis | neck_ext] = smooth_cols[band & ~head_vis | neck_ext]
side = ndi.gaussian_filter1d(neck_ext.astype(np.float32), 1.5, axis=1)   # soft sides only
a = np.maximum(alpha * head_vis, np.where(neck_ext, np.clip(side * 1.6, 0, 1), 0))
# hair: the top of the head as its own piece (for a tiny trailing bounce),
# cross-faded with the head through the bangs so a small offset never shows a seam
hair_t = 1 - ramp(yy, 150, 205)
save("head", cols, a * (1 - hair_t), J["neck"])
save("hair", cols, a * hair_t, J["neck"])

# ---------- arms ----------
def arm(side):
    sh, el, wr = J["sh" + side], J["el" + side], J["wr" + side]
    sgn = -1 if side == "L" else 1
    outside = (xx < 366) if side == "L" else (xx > 650)
    # the shoulder skin between that line and the strap belongs to the arm too
    skin_c = fig & (R > B + 18) & (R > 110) & ~jersey_px & (yy < 470)
    outside = outside | (skin_c & ((xx < 392) if side == "L" else (xx > 624)))
    # keep the arm's own pixels a little away from the strap (the art's dark edge
    # line along the strap stays with the jersey); the gap is filled with skin
    strap_band = ndi.binary_dilation(jersey_px, iterations=7) & (yy < 480)
    region = component(fig & outside & ~torso_vis & ~jersey_near & ~strap_band & ~TORSO_COVER_PIT, el)
    # trim the pointed tip where the arm met the top of the strap in the art
    region &= ~((yy < sh[1] - 50) & (ndi.distance_transform_edt(~jersey_px) < 16))
    tu, offu, Lu = proj(sh, el)
    tf, offf, Lf = proj(el, wr)
    # upper arm: shoulder cap to a little past the elbow (under the forearm). Past
    # the elbow it is narrowed and rounded off, so its edge never pokes outside the
    # forearm when the elbow bends.
    depth = ndi.distance_transform_edt(region)                      # px in from the arm's outline
    up_vis = region & (tf < 24) & ((tf <= 0) | (depth > 9 * np.clip(tf, 0, 24) / 24))
    # under the jersey edge, including the thin band right beside the strap
    up_ext = (offu < 46) & (tu > -60) & (tu < Lu * 0.45) & (~outside | (fig & ~region & ndi.binary_dilation(region, iterations=8)))
    # fill the concave corner where the top of the arm meets the jersey strap, so
    # turning the arm a little never opens a notch there
    sx_, sy_ = sh
    near_top = (np.hypot(xx - sx_, yy - (sy_ - 30)) < 34)
    yy2, xx2 = np.ogrid[-10:11, -10:11]
    comb = np.pad((region | jersey_px) & near_top, 12)
    closed_c = ndi.binary_closing(comb, structure=(xx2 * xx2 + yy2 * yy2) <= 100)[12:-12, 12:-12]
    up_ext |= closed_c & ~fig & near_top
    # round off the top of the shoulder: close the V between the pointed tip
    # (where the arm met the strap in the art) and the hidden cap, so turning the
    # arm never opens a notch beside the strap
    yy3, xx3 = np.ogrid[-16:17, -16:17]
    top_zone = (tu < Lu * 0.4)
    m0 = np.pad((up_vis | up_ext) & top_zone, 20)
    rounded = ndi.binary_closing(m0, structure=(xx3 * xx3 + yy3 * yy3) <= 256)[20:-20, 20:-20]
    rounded &= ~(outside & ~fig & (offu > 30)) | ~outside   # don't bulge past the outer outline
    up_ext = up_ext | (rounded & top_zone & ~up_vis)
    tip_zone = (yy < sh[1] - 50) & (ndi.distance_transform_edt(~jersey_px) < 16)
    up_ext &= ~((yy < sh[1] - 50) & ~fig) & ~tip_zone   # nothing pokes above the shoulder line
    cols = fill_hidden(up_vis, up_ext)
    up_a = (alpha * up_vis + (up_ext & ~up_vis)) * np.where(tf > 0, ramp(-tf, -24, -6), 1)

    save("upper" + side, cols, up_a, sh, seg_angle(sh, el), smooth=4)
    # forearm: feathered top over the elbow, ends a little past the wrist
    tf_w, _, _ = proj(wr, (wr[0] + (wr[0] - el[0]), wr[1] + (wr[1] - el[1])))
    fo = region & (tu > Lu - 30) & (tf_w < 18)
    # above the elbow the forearm only overlaps inside the arm (narrowing upward),
    # so its edge never shows past the upper arm when the elbow bends
    fo &= (tf >= 0) | (depth > 9 * np.clip(-tf, 0, 22) / 22)
    # the forearm ends at the wrist with a rounded tip; the hand's soft top edge
    # covers the joint (the hand bends a lot, so nothing may stick out past it)
    fo &= (tf_w < 6) & ((tf_w <= 0) | (depth > 4 + 14 * np.clip(tf_w, 0, 6) / 6))
    save("fore" + side, rgb, alpha * fo * ramp(tf, -22, 2), el, seg_angle(el, wr))
    # hand: everything past the wrist, feathered onto the forearm
    ha = region & (tf_w > -16)
    # the hand's soft top overlaps the forearm only inside the arm's outline
    ha_top = (tf_w >= 0) | (depth > 3 + 6 * np.clip(-tf_w, 0, 16) / 16)
    ha_a = alpha * ha * ramp(tf_w, -16, 4) * ha_top
    if side == "L":
        # dribbling hand: the thumb is its own piece (pivot at its base) so it can
        # fold onto the ball with the fingertips; the hand under it is filled in
        thumb_poly = [(148, 774), (161, 744), (174, 734), (191, 745), (207, 778), (204, 799), (184, 801), (157, 781)]
        tp = poly_mask(thumb_poly)
        big = ndi.binary_dilation(tp, iterations=4)       # the thumb, outline included
        # The hand underneath is rebuilt solid: remove the thumb, close the notch it
        # leaves with a smooth outline, and paint the new area from the hand's own
        # skin. The thumb piece then always lies over skin, never over a gap.
        base = ha & ~big
        yy0, xx0 = np.ogrid[-16:17, -16:17]
        disk = (xx0 * xx0 + yy0 * yy0) <= 256
        closed = ndi.binary_closing(np.pad(base, 20), structure=disk)[20:-20, 20:-20]
        closed = ndi.binary_fill_holes(closed) & ndi.binary_dilation(ha, iterations=2)
        # solid under the thumb's base and edges too (inside the hand's silhouette)
        under = big & ndi.binary_erosion(ndi.binary_dilation(base, iterations=10), iterations=6)
        closed = ndi.binary_opening(closed | under, iterations=3)  # smooth, no jaggies
        # round off the sharp corner the thumb cut leaves (only near the thumb)
        yy1, xx1 = np.ogrid[-8:9, -8:9]
        round8 = ndi.binary_opening(np.pad(closed, 10), structure=(xx1 * xx1 + yy1 * yy1) <= 64)[10:-10, 10:-10]
        near = ndi.binary_dilation(big, iterations=14)
        closed = np.where(near, round8, closed)
        new = closed & ~base
        src = base & ndi.binary_erosion(base, iterations=3) & (mx > 140)
        _, (iy, ix) = ndi.distance_transform_edt(~src, return_indices=True)
        cols = rgb.copy(); cols[new] = rgb[iy[new], ix[new]]
        blur = np.dstack([ndi.gaussian_filter(cols[..., c], 2.5) for c in range(3)])
        cols[new] = blur[new]                               # soft, no streaks
        hand_a = np.where(new, np.clip(ndi.gaussian_filter(closed.astype(np.float32), 1.0) * 2 - 0.5, 0, 1), ha_a * base)
        hand_a = hand_a * ramp(tf_w, -16, 4) * ha_top
        save("hand" + side, cols, hand_a, wr, seg_angle(el, wr))
        save("thumb" + side, rgb, ha_a * big, THUMB_PIVOT, seg_angle(el, wr))
    else:
        save("hand" + side, rgb, ha_a, wr, seg_angle(el, wr))
    return Lu, Lf

LuL, LfL = arm("L")
LuR, LfR = arm("R")

# ---------- legs + shoes ----------
shoe_zone = ndi.binary_opening(fig & (yy > 1250) & ~sock, iterations=2)
def leg(side):
    hip, kn, an = J["hip" + side], J["kn" + side], J["an" + side]
    shoe = component(shoe_zone, (an[0], 1400))
    legs = fig & (skinlike | sock) & (yy > 860) & ~shoe & ~torso_vis
    region = component(legs, kn)
    tt, offt, Lt = proj(hip, kn)
    ts, offs, Ls = proj(kn, an)
    th_vis = region & (ts < 30)
    th_ext = (offt < 62) & (tt > -10) & (tt < Lt * 0.75)           # up under the shorts
    cols = fill_hidden(th_vis, th_ext)
    save("thigh" + side, cols, alpha * th_vis + (th_ext & ~th_vis), hip, seg_angle(hip, kn))
    sh_vis = region & (tt > Lt - 34)
    sh_ext = (offs < 30) & (ts > Ls - 30) & (ts < Ls + 40)          # sock down into the shoe
    cols = fill_hidden(sh_vis, sh_ext)
    a = (alpha * sh_vis + (sh_ext & ~sh_vis)) * ramp(ts, -26, 2)
    save("shin" + side, cols, a, kn, seg_angle(kn, an))
    save("foot" + side, rgb, alpha * shoe, an)
    return Lt, Ls

LtL, LsL = leg("L")
LtR, LsR = leg("R")

# ---------- body measurements in rig units ----------
pel = rig(J["pelvis"])
def rr(p): x, y = rig(p); return (round(x, 2), round(y, 2))
body = {
    "pelvisY": round(pel[1], 2),
    "neckTop": round(rig(J["neck"])[1] - pel[1], 2),
    "shoulderX": round((J["shR"][0] - J["shL"][0]) / 2 * S, 2),
    "shoulderY": round(rig(J["shL"])[1] - pel[1], 2),
    "upperArm": round((LuL + LuR) / 2 * S, 2), "forearm": round((LfL + LfR) / 2 * S, 2),
    "hipX": round((J["hipR"][0] - J["hipL"][0]) / 2 * S, 2), "hipDrop": 0,
    "thigh": round((LtL + LtR) / 2 * S, 2), "shin": round((LsL + LsR) / 2 * S, 2),
    "ankleX": round((J["anR"][0] - J["anL"][0]) / 2 * S, 2), "ankleY": round(rig(J["anL"])[1], 2),
    "joints": {k: rr(v) for k, v in J.items()},
    "thumb": {"pivot": [round((THUMB_PIVOT[0] - J["wrL"][0]) * S, 3), round((THUMB_PIVOT[1] - J["wrL"][1]) * S, 3)],
              "tip": [round((THUMB_TIP[0] - J["wrL"][0]) * S, 3), round((THUMB_TIP[1] - J["wrL"][1]) * S, 3)]},
}
with open(f"{OUT}/rig.json", "w") as f:
    json.dump({"scale": S, "pieces": pieces, "body": body, "refs": REFS}, f, indent=1)
print(json.dumps(body, indent=1))
