import sys, re
from playwright.sync_api import sync_playwright
from PIL import Image
qs=[float(x) for x in sys.argv[2].split(",")]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":1300,"height":1000},device_scale_factor=6)
    pg.goto("http://localhost:8765/dev/animation-preview.html"); pg.wait_for_load_state("networkidle")
    pg.evaluate("document.querySelectorAll('.anim__svg > rect, .anim__helper').forEach(r=>r.style.display='none'); document.querySelectorAll('.anim').forEach(a=>a.style.background='#ff00ff')")
    rows=[]
    for q in qs:
        pg.evaluate(f"window.__ctls.forEach(c=>{{c.setPhase('paused');c._renderAt({q},0)}})")
        el=pg.locator(".cell .anim").nth(0); el.screenshot(path="/tmp/_s.png")
        im=Image.open("/tmp/_s.png"); k=im.size[0]/400
        def crop(cx,cy,h=16): return im.crop((int((200+cx-h)*k),int((cy-h)*k),int((200+cx+h)*k),int((cy+h)*k))).resize((360,360))
        rows.append([crop(-26,126,18),crop(26,126,18)])
    out=Image.new("RGB",(730,370*len(rows)),"white")
    for i,(a,c) in enumerate(rows): out.paste(a,(0,i*370)); out.paste(c,(370,i*370))
    out.save(sys.argv[1])
