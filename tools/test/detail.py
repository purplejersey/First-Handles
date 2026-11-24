"""Very tight crops of the dribbling hand and elbow at given phases. detail.py out.png phases"""
import sys
from playwright.sync_api import sync_playwright
from PIL import Image
qs=[float(x) for x in sys.argv[2].split(",")]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":1300,"height":1000},device_scale_factor=8)
    pg.goto("http://localhost:8765/dev/animation-preview.html"); pg.wait_for_load_state("networkidle")
    rows=[]
    for q in qs:
        pg.evaluate(f"window.__ctls.forEach(c=>{{c.setPhase('paused');c._renderAt({q},0)}})")
        # rig-space boxes -> svg is 400x300; read the hand/elbow joint transforms
        js = """() => { const g = s => document.querySelectorAll('.cell')[0].querySelector('[data-j="'+s+'"]').getAttribute('transform');
          return [g('handL'), g('foreL')]; }"""
        hand, fore = pg.evaluate(js)
        import re
        hx, hy = map(float, re.search(r'translate\(([-\d.]+),([-\d.]+)\)', hand).groups())
        ex, ey = map(float, re.search(r'translate\(([-\d.]+),([-\d.]+)\)', fore).groups())
        el = pg.locator(".cell .anim").nth(0); bb = el.bounding_box()
        el.screenshot(path="/tmp/_d.png"); im = Image.open("/tmp/_d.png"); W, H = im.size
        k = W / 400
        def crop(cx, cy, half):
            X, Y = (200 + cx) * k, cy * k
            return im.crop((int(X - half*k), int(Y - half*k), int(X + half*k), int(Y + half*k))).resize((420, 420))
        rows.append([crop(hx - 4, hy + 6, 15), crop(ex, ey, 9)])
    out = Image.new("RGB", (860, 430 * len(rows)), "white")
    for i, (a, c) in enumerate(rows): out.paste(a, (0, i * 430)); out.paste(c, (430, i * 430))
    out.save(sys.argv[1])
