"""Screenshots of every screen at a phone and a laptop size. screens.py outdir"""
import json, sys, os
from playwright.sync_api import sync_playwright
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
st = {"profile": {"name": "Jon Jr", "number": "23", "primary": "purple", "secondary": "neon"},
      "completions": {"1-1": {"count": 3, "stars": 3, "firstAt": "x", "lastAt": "x"}, "1-2": {"count": 1, "stars": 2, "firstAt": "x", "lastAt": "x"}}, "dev": True}
routes = ["#/home", "#/levels", "#/level/1", "#/drill/1-3", "#/done/1-2", "#/edit"]
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--mute-audio"])
    for (w, h, tag) in [(390, 664, "phone"), (1366, 680, "laptop")]:
        for r in routes:
            pg = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=2 if w < 500 else 1)
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.on("console", lambda m: m.type == "error" and "favicon" not in m.text and errs.append(m.text))
            pg.add_init_script(f"localStorage.setItem('firstHandles.v1', {json.dumps(json.dumps(st))}); sessionStorage.setItem('firstHandles.titleSeen','1')")
            pg.goto("http://localhost:8765/" + r); pg.wait_for_timeout(900)
            name = r.replace("#/", "").replace("/", "_")
            pg.screenshot(path=f"{out}/{tag}_{name}.png")
            pg.close()
        # title screen
        pg = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=2 if w < 500 else 1)
        pg.add_init_script(f"localStorage.setItem('firstHandles.v1', {json.dumps(json.dumps(st))})")
        pg.goto("http://localhost:8765/#/home"); pg.wait_for_timeout(900)
        pg.screenshot(path=f"{out}/{tag}_title.png"); pg.close()
    b.close()
print("errors:", errs)
