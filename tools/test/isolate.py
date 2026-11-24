import sys, re
from playwright.sync_api import sync_playwright
from PIL import Image
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":1300,"height":1000},device_scale_factor=8)
    pg.goto("http://localhost:8765/dev/animation-preview.html"); pg.wait_for_load_state("networkidle")
    pg.evaluate("window.__ctls.forEach(c=>{c.setPhase('paused');c._renderAt(0,0)})")
    hand = pg.evaluate("document.querySelectorAll('.cell')[0].querySelector('[data-j=handL]').getAttribute('transform')")
    hx, hy = map(float, re.search(r'translate\(([-\d.]+),([-\d.]+)\)', hand).groups())
    el = pg.locator(".cell .anim").nth(0)
    outs = []
    for hide in ["", "foreL", "handL", "thumbL", "foreL,thumbL"]:
        pg.evaluate("document.querySelectorAll('[data-j]').forEach(e=>e.style.display='')")
        for h in filter(None, hide.split(",")):
            pg.evaluate(f"document.querySelectorAll('.cell')[0].querySelectorAll('[data-j={h}]').forEach(e=>e.style.display='none')")
        el.screenshot(path="/tmp/_i.png"); im = Image.open("/tmp/_i.png"); k = im.size[0] / 400
        X, Y = (200 + hx + 2) * k, (hy + 2) * k
        outs.append(im.crop((int(X - 12*k), int(Y - 12*k), int(X + 12*k), int(Y + 12*k))).resize((300, 300)))
    s = Image.new("RGB", (310 * len(outs), 300), "white")
    for i, o in enumerate(outs): s.paste(o, (i * 310, 0))
    s.save(sys.argv[1])
