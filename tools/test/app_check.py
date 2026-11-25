"""Real drill screen 1-1: fit at sizes, loop moves, freeze on Lost it, reduced motion, true view, frame cost."""
import json
from playwright.sync_api import sync_playwright
STATE = {"profile": {"name": "Test", "number": "23", "primary": "purple", "secondary": "gold"}, "completions": {}}
SIZES = [(360,600),(390,664),(430,740),(768,950),(820,1100),(1024,700),(1366,680),(1280,800),(1920,1000)]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    errs = []
    for (w,h) in SIZES:
        pg = b.new_page(viewport={"width":w,"height":h})
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.add_init_script(f"localStorage.setItem('firstHandles.v1', {json.dumps(json.dumps(STATE))}); sessionStorage.setItem('firstHandles.titleSeen','1')")
        pg.goto("http://localhost:8765/#/drill/1-1"); pg.wait_for_timeout(700)
        start = pg.get_by_role("button", name="Start")
        sb = start.bounding_box(); anim = pg.locator(".anim").bounding_box()
        scroll = pg.evaluate("document.documentElement.scrollHeight - innerHeight")
        print(f"{w}x{h}: Start visible={sb is not None and sb['y']+sb['height']<=h} anim={int(anim['width'])}x{int(anim['height'])} scroll={scroll}")
        if (w,h) == (390,664): pg.screenshot(path="/home/claude/c2/app_390.png")
        if (w,h) == (1366,680): pg.screenshot(path="/home/claude/c2/app_1366.png")
        pg.close()
    # motion + freeze + frame cost on one size
    pg = b.new_page(viewport={"width":1024,"height":700})
    pg.add_init_script(f"localStorage.setItem('firstHandles.v1', {json.dumps(json.dumps(STATE))}); sessionStorage.setItem('firstHandles.titleSeen','1')")
    pg.goto("http://localhost:8765/#/drill/1-1"); pg.wait_for_timeout(600)
    t = lambda: pg.evaluate("document.querySelector('.anim__ball').getAttribute('transform')")
    a = t(); pg.wait_for_timeout(130); bb = t()
    print("moving in intro:", a != bb)
    cost = pg.evaluate("""() => { const st=document.querySelector('.drill__stage'); const m=performance.now();
      return 0 }""")
    pg.get_by_role("button", name="Start").click(); pg.wait_for_timeout(4200)
    lost = pg.get_by_role("button", name="Lost it")
    lost.click(); pg.wait_for_timeout(300)
    a = t(); pg.wait_for_timeout(200); bb = t()
    print("frozen after Lost it:", a == bb, a)
    pg.close()
    # reduced motion
    ctx = b.new_context(viewport={"width":1024,"height":700}, reduced_motion="reduce")
    pg = ctx.new_page(); pg.add_init_script(f"localStorage.setItem('firstHandles.v1', {json.dumps(json.dumps(STATE))}); sessionStorage.setItem('firstHandles.titleSeen','1')")
    pg.goto("http://localhost:8765/#/drill/1-1"); pg.wait_for_timeout(600)
    a = t(); pg.wait_for_timeout(200); bb = t()
    arrow = pg.evaluate("getComputedStyle(document.querySelector('.anim__rm-arrow')).display")
    print("reduced motion still:", a == bb, "arrow shown:", arrow != "none")
    pg.screenshot(path="/home/claude/c2/app_reduced.png"); ctx.close()
    # frame cost of render()
    pg = b.new_page(viewport={"width":1300,"height":1000})
    pg.goto("http://localhost:8765/dev/animation-preview.html"); pg.wait_for_timeout(600)
    ms = pg.evaluate("""() => { const c = window.__ctls[0]; c.setPhase('paused'); const t0 = performance.now();
      for (let i = 0; i < 2000; i++) c._renderAt((i % 400) / 400); return (performance.now() - t0) / 2000; }""")
    print(f"render cost per frame: {ms:.3f} ms")
    print("page errors:", errs)
    b.close()
