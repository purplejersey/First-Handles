# AGENTS.md: First Handles

Instructions for coding agents (Codex and others) working in this repo.

## What this is
First Handles is a dribbling-training game for a young basketball player (Jon's son), and later for other youth players. It has an NBA Street–style streetball look: a locked ladder of levels, each level made of timed steps, an illustrated puppet avatar of the player shown dribbling, honor-system stars, and music.

**Read `docs/BRIEF.md` before doing anything.** It is the single source of truth: locked decisions, current status, the next task, the fixes queue, and where everything lives. Keep it up to date (see "Keeping the brief current").

- Live site: https://purplejersey.github.io/First-Handles/ (GitHub Pages from `main`, repo root)
- Owner: Jon. He tests on a tablet, a laptop/TV and a phone. He isn't a developer, so keep explanations plain and short.

## Stack and constraints
- Static HTML/CSS/JS with ES modules. **No build step, no framework, no backend, no npm dependencies in the app.**
- Progress lives in `localStorage` (key `firstHandles.v1`), so it is per device.
- Use relative asset paths only. The site is served under `/First-Handles/` and will become an installable PWA/APK, so everything must work offline from a fixed start URL.
- The app has its own Back buttons. Never rely on the browser's back button.
- Must fit tablet, laptop and phone. The drill screen must fit a phone held upright with no scrolling (test at 360×600, 390×664, 430×740).

## Run locally
```
python3 -m http.server 8765    # from the repo root
# open http://localhost:8765
```
ES modules won't load from `file://`.

## Testing
- Headless checks live in `tools/test/` (Python + Playwright + Chrome). See `tools/README.md`.
  - `screens.py` screenshots every screen at phone and laptop sizes.
  - `app_check.py` checks drill fit at 9 sizes, motion, freeze on Lost it, reduced motion and frame cost.
  - `sheet.py` makes an animation contact sheet (phases 0, 0.2, 0.4, 0.44, 0.6, 0.9, both hands).
- Some scripts write images to `/home/claude/c2/`. Change the output path at the top of the script for your machine.
- Test scripts must set `sessionStorage["firstHandles.titleSeen"] = "1"` to skip the title screen.
- To test progression in the app, turn on **Developer mode** (Settings, under Reset progress). Drills then show a Skip button that jumps to time's up.
- Look at the screenshots, not just pass/fail. After a push, open the live link and check the console for errors.

## Working rules (from Jon)
1. **Small, targeted edits.** Never rewrite whole files.
2. **Don't push to `main` until Jon has seen and approved the change.** Show him screenshots or a local preview first. GitHub Pages deploys straight from `main`, so a push goes live.
3. **After every push, give Jon the live link:** https://purplejersey.github.io/First-Handles/
4. **Move fast and fill in blanks.** Make sensible calls instead of stalling on small details, then list the blanks you filled so Jon can change them.
5. **Placeholders first, art later.** Painted art comes from Jon's AI image tool. The agent writes the prompts and does everything after that.
6. **Levels, steps, tips and stars are data** (`js/data/levels.js`). A new move means a new motion entry in `js/components/motions.js`, not a new engine.
7. **Music has one home:** `js/music.js`. The skin has one home: `css/street.css` (layout and sizing stay in `css/styles.css`).
8. **Never commit photos of the player.** The illustrated avatar is fine to publish (Jon's choice).
9. If something Jon reports is really a design decision (for example mirror view vs. true view), lay out the options with a recommendation instead of silently picking one.
10. Small fixes that would derail the current task go in the brief's **Fixes & tweaks queue**. Side ideas go in **Later modules**.

## Commits
- Plain-English commit messages describing what changed for the player (see `git log`).
- One logical change per commit where practical.

## Keeping the brief current
When you finish a task or make a decision, update `docs/BRIEF.md` in the same commit: Current status, the decision with its date, the Done list, and "Where things live" if files moved or were added.

## Map of the code (details in the brief)
- `index.html` loads `css/styles.css` + `css/street.css` and `js/app.js` (the router).
- `js/screens/`: one file per screen (home, levels, level, drill, nicework, setup).
- `js/components/`: drill animation, motions, puppet avatar + rig, recolor, jersey number, player card, title screen, celebration, level list, toast.
- `js/data/levels.js`: `LEVELS`, `DRILLS` (view per drill), `DRILL_TIPS` (key tips, pro tips, star challenges).
- `js/progress.js`: saved state, `completeStep()`, stars, totals, dev mode, music on/off.
- `tools/avatar/`: Python pipeline that cuts the painted avatar into puppet pieces and renders the ball sprite.
- `art/source/`: source illustrations. `assets/`: shipped images, audio, font.
