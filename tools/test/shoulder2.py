"""Both shoulders on magenta (so any stray fragment stands out), many phases."""
import sys
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
        rows.append(im.crop((int((200-46)*k),int(104*k),int((200+46)*k),int(152*k))).resize((552,288)))
    out=Image.new("RGB",(552,296*len(rows)),"white")
    for i,r in enumerate(rows): out.paste(r,(0,i*296))
    out.save(sys.argv[1])
