import sys
from playwright.sync_api import sync_playwright
from PIL import Image
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":1300,"height":1000},device_scale_factor=6)
    pg.goto("http://localhost:8765/dev/animation-preview.html"); pg.wait_for_load_state("networkidle")
    pg.evaluate("window.__ctls.forEach(c=>{c.setPhase('paused');c._renderAt(0.15,0)})")
    el=pg.locator(".cell .anim").nth(0); outs=[]
    for hide in ["", "upperL", "torso", "foreL"]:
        pg.evaluate("document.querySelectorAll('[data-j]').forEach(e=>e.style.display='')")
        if hide: pg.evaluate(f"document.querySelectorAll('.cell')[0].querySelectorAll('[data-j={hide}]').forEach(e=>e.style.display='none')")
        el.screenshot(path="/tmp/_i.png"); im=Image.open("/tmp/_i.png"); k=im.size[0]/400
        outs.append(im.crop((int((200-44)*k),int((104)*k),int((200-12)*k),int((146)*k))).resize((256,336)))
    s=Image.new("RGB",(266*4,336),"white")
    for i,o in enumerate(outs): s.paste(o,(i*266,0))
    s.save(sys.argv[1])
