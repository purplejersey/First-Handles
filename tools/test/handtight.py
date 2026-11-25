import sys
from playwright.sync_api import sync_playwright
from PIL import Image
qs=[float(x) for x in sys.argv[2].split(",")]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":1300,"height":1000},device_scale_factor=5)
    pg.goto("http://localhost:8765/dev/animation-preview.html"); pg.wait_for_load_state("networkidle")
    ims=[]
    for q in qs:
        pg.evaluate(f"window.__ctls.forEach(c=>{{c.setPhase('paused');c._renderAt({q},0)}})")
        pg.locator(".cell .anim").nth(0).screenshot(path="/tmp/_t.png")
        im=Image.open("/tmp/_t.png"); w,h=im.size
        ims.append(im.crop((int(w*.25),int(h*.38),int(w*.45),int(h*.70))).resize((300,int(300*(h*.32)/(w*.2)))))
    W=sum(i.width for i in ims)+10*len(ims); s=Image.new("RGB",(W,ims[0].height),"white"); x=0
    for i in ims: s.paste(i,(x,0)); x+=i.width+10
    s.save(sys.argv[1])
