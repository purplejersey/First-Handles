import json
from playwright.sync_api import sync_playwright
from PIL import Image
OUT="/home/claude/c2/"
def state(pri, sec, num="23", name="Jon Jr"):
    return {"profile": {"name": name, "number": num, "primary": pri, "secondary": sec}, "completions": {}}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    errs = []
    shots = []
    for (pri, sec, num) in [("purple","neon","23"), ("red","white","7"), ("navy","gold","11"), ("white","royal","4")]:
        for (w, h) in [(390, 664), (1280, 800)]:
            pg = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=2 if w < 500 else 1)
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.add_init_script(f"localStorage.setItem('firstHandles.v1', {json.dumps(json.dumps(state(pri, sec, num)))})")
            pg.goto("http://localhost:8765/#/home"); pg.wait_for_timeout(900)
            btn = pg.get_by_role("button", name="Start Training").bounding_box()
            scroll = pg.evaluate("document.documentElement.scrollHeight - innerHeight")
            print(f"home {pri}/{sec} {w}x{h}: Start Training visible={btn['y']+btn['height']<=h} scroll={scroll}")
            if w < 500: pg.screenshot(path=f"/tmp/home_{pri}.png"); shots.append(f"/tmp/home_{pri}.png")
            pg.close()
    # edit screen: live preview follows a swatch tap and number typing
    pg = b.new_page(viewport={"width": 390, "height": 664}, device_scale_factor=2)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.add_init_script(f"localStorage.setItem('firstHandles.v1', {json.dumps(json.dumps(state('purple','neon')))})")
    pg.goto("http://localhost:8765/#/edit"); pg.wait_for_timeout(800)
    pg.screenshot(path="/tmp/edit_before.png")
    pg.locator('.swatch[data-field="primary"][data-id="teal"]').click()
    pg.locator('.swatch[data-field="secondary"][data-id="white"]').click()
    pg.fill('input[name="number"]', "3"); pg.wait_for_timeout(700)
    pg.screenshot(path="/tmp/edit_after.png")
    num = pg.locator(".player-card__number").text_content()
    print("edit preview number:", num)
    # drill uses the same colors
    pg2 = b.new_page(viewport={"width": 1024, "height": 700})
    pg2.add_init_script(f"localStorage.setItem('firstHandles.v1', {json.dumps(json.dumps(state('red','white','7')))})")
    pg2.goto("http://localhost:8765/#/drill/1-1"); pg2.wait_for_timeout(900)
    href = pg2.evaluate("document.querySelector('[data-j=torso] > image').getAttribute('href')")
    print("drill torso recolored:", href.startswith("blob:"))
    pg2.locator(".anim").screenshot(path="/tmp/drill_red.png")
    print("errors:", errs)
    b.close()
ims = [Image.open(s) for s in shots] + [Image.open("/tmp/edit_before.png"), Image.open("/tmp/edit_after.png")]
H = 1328; ims = [i.resize((int(i.width * H / i.height), H)) for i in ims]
sheet = Image.new("RGB", (sum(i.width for i in ims) + 12 * len(ims), H), "white"); x = 0
for i in ims: sheet.paste(i, (x, 0)); x += i.width + 12
sheet.save(OUT + "card_screens.png")
