"""Contact sheet: phases x (left, right hand, mirror view). Usage: sheet.py out.png [dpr] [zoom]"""
import sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
PH = [0, 0.2, 0.4, 0.44, 0.6, 0.9]
out = sys.argv[1]; dpr = float(sys.argv[2]) if len(sys.argv) > 2 else 1.5
zoom = len(sys.argv) > 3 and sys.argv[3] == "zoom"
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True)
    pg = b.new_page(viewport={"width": 1300, "height": 1000}, device_scale_factor=dpr)
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: m.type == "error" and "favicon" not in m.text and errs.append(m.text))
    pg.goto("http://localhost:8765/dev/animation-preview.html"); pg.wait_for_load_state("networkidle")
    pg.evaluate("document.documentElement.style.setProperty('--jersey-trim','#DFFF1A')")
    rows = []
    for cell in (0, 1):
        row = []
        for q in PH:
            pg.evaluate(f"window.__ctls.forEach(c=>{{c.setPhase('paused');c._renderAt({q})}})")
            el = pg.locator(".cell .anim").nth(cell)
            el.screenshot(path="/tmp/_f.png")
            im = Image.open("/tmp/_f.png").convert("RGB")
            if zoom:
                w, h = im.size
                im = im.crop((int(w*0.22), int(h*0.3), int(w*0.78), int(h*0.98)))
            d = ImageDraw.Draw(im); d.rectangle([0, 0, 150, 26], fill=(0, 0, 0))
            d.text((6, 6), f"{'L' if cell == 0 else 'R'} hand  p={q}", fill=(255, 255, 255))
            row.append(im)
        rows.append(row)
    b.close()
w, h = rows[0][0].size
sheet = Image.new("RGB", (w*len(PH)+4*(len(PH)-1), h*2+4), "white")
for r, row in enumerate(rows):
    for c, im in enumerate(row): sheet.paste(im, (c*(w+4), r*(h+4)))
sheet.save(out); print(sheet.size, "errors:", errs)
