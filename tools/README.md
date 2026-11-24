# Tools (not part of the app)

## `avatar/` — the cut-out puppet avatar (Chunk C2)
Python 3 with numpy, scipy, Pillow. Run from `tools/avatar/`, writing to a scratch `out/` folder,
then copy the results into `assets/avatar/`.

- `cut.py ../../art/source/stance.png out` — cuts the stance illustration into puppet pieces
  (WebP), with pivots, rest angles, hidden areas filled, edge defringe, the separate dribbling
  thumb, and the torso's recolor mask. Writes `out/rig.json`.
- `genrig.py out/rig.json ../../js/components/puppetRig.js` — turns `rig.json` into the JS data file.
- `prep_portrait.py ../../art/source/portrait.png out` — player-card portrait: paints out the
  baked-in number, recolor mask, fabric-only chest mask and fold shading for the live number.
- `ball2.py out/ball_spin.webp preview.png` — renders the painted, pebbled basketball as a
  48-frame full-turn sprite (8 x 6 grid) with real 8-panel seams.
- `masks.py` — shared jersey / trim mask helpers.

Joint positions, the thumb pivot, and the number box are measured on the current art and written
at the top of each script. New art means re-measuring those (see the C2 notes in the brief).

## `test/` — headless checks (Playwright + Chrome)
Serve the repo root on port 8765 (`python3 -m http.server 8765`), then:
- `sheet.py out.png [dpr] [zoom]` — contact sheet: phases 0, 0.2, 0.4, 0.44, 0.6, 0.9, left and right hand.
- `app_check.py` — drill screen fit at 9 sizes, motion, freeze on Lost it, reduced motion, frame cost.
- `card_check.py` — home card and edit preview in several colors, sizes, drill recolor.
- `detail.py`, `isolate.py`, `colors.py` — close-ups of hand/elbow joints, single-piece isolation, color presets.
Some scripts write their images to `/home/claude/c2/`; change the path at the top if needed.
