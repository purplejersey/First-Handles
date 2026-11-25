import sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
qs=[float(x) for x in sys.argv[2].split(",")]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":1300,"height":1000},device_scale_factor=3)
    pg.goto("http://localhost:8765/dev/animation-preview.html"); pg.wait_for_load_state("networkidle")
    pg.evaluate("document.documentElement.style.setProperty('--jersey-trim','#DFFF1A')")
    ims=[]
    for q in qs:
        pg.evaluate(f"window.__ctls.forEach(c=>{{c.setPhase('paused');c._renderAt({q})}})")
        pg.locator(".cell .anim").nth(0).screenshot(path="/tmp/_j.png")
        im=Image.open("/tmp/_j.png"); w,h=im.size
        im=im.crop((int(w*.27),int(h*.12),int(w*.73),int(h*.92)))
        ImageDraw.Draw(im).text((8,8),f"p={q}",fill=(0,0,0)); ims.append(im)
    W=sum(i.width for i in ims); s=Image.new("RGB",(W,ims[0].height),"white"); x=0
    for i in ims: s.paste(i,(x,0)); x+=i.width
    s.save(sys.argv[1])
