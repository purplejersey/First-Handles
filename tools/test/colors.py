import sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":1300,"height":1000},device_scale_factor=2)
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://localhost:8765/dev/animation-preview.html"); pg.wait_for_load_state("networkidle")
    opts = pg.eval_on_selector_all("#jersey option", "os => os.map(o => [o.value, o.textContent])")
    ims=[]
    for val, label in opts:
        pg.select_option("#jersey", val); pg.wait_for_timeout(500)
        pg.evaluate("window.__ctls.forEach(c=>{c.setPhase('paused');c._renderAt(0.9,0)})")
        pg.locator(".cell .anim").nth(0).screenshot(path="/tmp/_c.png")
        im=Image.open("/tmp/_c.png").convert("RGB"); w,h=im.size
        im=im.crop((int(w*.28),int(h*.12),int(w*.72),int(h*.95)))
        ImageDraw.Draw(im).text((6,6),label,fill=(0,0,0)); ims.append(im)
    s=Image.new("RGB",(sum(i.width for i in ims)+6*len(ims),ims[0].height),"white"); x=0
    for i in ims: s.paste(i,(x,0)); x+=i.width+6
    s.save(sys.argv[1]); print(errs)
    b.close()
