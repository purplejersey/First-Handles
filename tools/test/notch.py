import sys
from playwright.sync_api import sync_playwright
from PIL import Image
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":1300,"height":1000},device_scale_factor=12)
    pg.goto("http://localhost:8765/dev/animation-preview.html"); pg.wait_for_load_state("networkidle")
    pg.evaluate("window.__ctls.forEach(c=>{c.setPhase('paused');c._renderAt(0.15,0)})")
    pg.evaluate("document.querySelectorAll('.anim__svg > rect').forEach(r=>r.style.display='none'); document.querySelectorAll('.anim').forEach(a=>a.style.background='#ff00ff')")
    el=pg.locator(".cell .anim").nth(0); outs=[]
    for hide in ["", "torso", "upperL", "capL"]:
        pg.evaluate("document.querySelectorAll('[data-j]').forEach(e=>e.style.display='')")
        if hide: pg.evaluate(f"document.querySelectorAll('.cell')[0].querySelectorAll('[data-j={hide}]').forEach(e=>e.style.display='none')")
        el.screenshot(path="/tmp/_n.png"); im=Image.open("/tmp/_n.png"); k=im.size[0]/400
        outs.append(im.crop((int((200-34)*k),int(103*k),int((200-16)*k),int(121*k))).resize((300,300)))
    s=Image.new("RGB",(310*4,300),"white")
    for i,o in enumerate(outs): s.paste(o,(i*310,0))
    s.save(sys.argv[1])
