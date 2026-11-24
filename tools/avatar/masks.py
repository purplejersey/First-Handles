"""Soft jersey / trim masks for recoloring (shared by cut.py and prep_portrait.py)."""
import numpy as np

def soft_masks(rgb):
    """rgb: float array (H, W, 3) 0..255. Returns (jersey, trim) weights 0..1."""
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb.max(axis=2); mn = rgb.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1)
    c = lambda x: np.clip(x, 0, 1)
    # purple fabric (incl. dark folds): blue clearly above green, red not far above blue
    jersey = c((B - G - 18) / 22) * c((B + 40 - R) / 30) * c((sat - 0.18) / 0.15)
    # neon trim: green highest, well above blue, not orange
    trim = c((G - B - 60) / 40) * c((G - R + 20) / 20) * c((G - 140) / 30)
    return jersey, trim

def reference_luma(rgb, w):
    """Weighted mean luminance of the masked area (the art's own fabric tone)."""
    L = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    return float((L * w).sum() / max(w.sum(), 1e-6))
