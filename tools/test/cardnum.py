import json, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
cases=[("purple","neon","23"),("purple","neon","7"),("red","white","11"),("navy","gold","88"),("white","royal","4"),("black","sky","10")]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome"); errs=[]; ims=[]
    for pri,sec,num in cases:
        pg=b.new_page(viewport={"width":390,"height":664},device_scale_factor=3); pg.on("pageerror",lambda e:errs.append(str(e)))
        st={"profile":{"name":"Jon Jr","number":num,"primary":pri,"secondary":sec},"completions":{}}
        pg.add_init_script(f"localStorage.setItem('firstHandles.v1', {json.dumps(json.dumps(st))})")
        pg.goto("http://localhost:8765/#/home"); pg.wait_for_timeout(900)
        el=pg.locator(".player-card__avatar"); el.screenshot(path="/tmp/_n.png")
        im=Image.open("/tmp/_n.png").convert("RGB"); w,h=im.size
        ims.append(im.crop((int(w*.2),int(h*.12),int(w*.8),int(h*.55))))
        pg.close()
    H=max(i.height for i in ims); s=Image.new("RGB",(sum(i.width for i in ims)+8*len(ims),H),"white"); x=0
    for i in ims: s.paste(i,(x,0)); x+=i.width+8
    s.save(sys.argv[1]); print(errs); b.close()
