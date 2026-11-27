# First Handles: Beta v1 Brief

The living record of decisions for the dribbling game. Read this at the start of every work session instead of working out the context again. Agent rules are in `AGENTS.md`.

> **Handoff note (Nov 25, 2026):** This brief was kept in a claude.ai project while Claude built Chunks A–C2 and the streetball pass. It now lives here in the repo, and this copy is the source of truth for Codex and any other agent.

## How we work
- **Own the module.** Carry routine, reversible decisions through implementation and verification. Ask Jon when a choice changes what players are taught, changes the visual direction substantially, or needs release approval. Share one review-ready preview per milestone and note the important choices.
- **Make the game feel great.** Treat the illustrated avatar, streetball presentation and fluid, natural motion as core quality goals. Before review, check both hands at full and half speed. Scrub the catch, release, floor contact and any joins between moves. Look for collapsing shoulders, separated joints, foot sliding, ball drift and sudden speed changes. Check readability on a phone in portrait and landscape.
- **Hand off at module boundaries.** Before switching chats, show Jon the next goal, quality bar, guardrails, approved work, local and public status, and open checks. Wait for his go-ahead. The next chat reads this brief first and works from the same standards.
- **Step by step.** Short replies, one topic at a time, with room for Jon to jump in. Don't get ahead of him.
- **Move fast, fill in blanks (Jon, Nov 25):** "expedite… instead of getting stuck on minute details. Fill in a lot of blanks that we can go back and fix later." Make sensible calls, list the blanks you filled, keep going. Polish comes later.
- **Work in chunks.** Each chunk is one focused task with a clear end. Finished chunks aren't reopened; later changes are new tasks and get recorded here.
- **Changing or adding features mid-way:** small fixes get done in the current task. If one would derail it, it goes in the **Fixes & tweaks queue**. Bigger features get decided with Jon first, then built as their own task or folded into the polish chunk.
- **Side ideas go to "Later modules"** instead of being explored on the spot.
- **Small, targeted edits** to code, never full rewrites.
- **Placeholders first, art later.**
- **GitHub:** the agent handles the repo (commits, pushes). Jon only does setup clicks and device testing.
- **Don't push until Jon approves** the preview. Pages deploys from `main`.
- **Always give the live link after every push:** https://purplejersey.github.io/First-Handles/
- **Testing progression:** turn on **Developer mode** (Settings, under Reset progress). Drills then show a Skip button that jumps to time's up.
- **Be honest about art limits.** Near-realistic art can't be hand-drawn in code. High-end art comes from Jon's AI image tool; the agent writes the prompts and does everything after that.
- **Polish workflow:** contact sheet (phases 0, 0.2, 0.4, 0.44, 0.6, 0.9, both hands) plus close-ups; a magenta background at 6× zoom shows joint seams; give Jon a change list, the sheet, and real-speed and quarter-speed recordings. `tools/test/screens.py` screenshots every screen at phone and laptop sizes. Test scripts must set `sessionStorage firstHandles.titleSeen = "1"` to skip the title screen. Tools are in `tools/test/` (see `tools/README.md`).

## Current status
- **Nov 26 Levels 2–3 release approved:** Jon approved pushing the local Pound + Float build to GitHub Pages. The release includes all six Floats sets, all six Pound + Float sets and Developer mode access to playable sets. The sets alternate left/right at 15, 20, and 30 seconds per hand. Completing Floats opens 3-1, and completing the combo level opens the Level 4 placeholder. Pound + Float uses the course plan's coaching and star challenges, and starts and freezes with the ball in hand.
- **Nov 26 Level 3 map verification:** Browser played the full 3-1 timer with Developer mode off, saved three stars through reload and opened the right-hand 3-2 via Next step. Progress checks covered all six locks, best stars and the Level 4 gate. The drill fit 360×600, 390×664, 430×740, 568×320 and 844×390 without scrolling. Console clean. Real-device playtest remains open.
- **Nov 26 Level 3 Animation Lab:** `dev/pound-float-preview.html` repeats two .4 s Pounds and one .76 s Float on the selected hand (1.56 s total). A reusable combo sampler joins the approved motions at maximum floor compression and blends free-hand/body recovery over 55 ms on either side. Catches retain fingertip contact. The combo uses the Float elbow guide throughout and keeps the approved low stance and art. The lab has beat highlighting, both hands, 1×/½×, pause, scrub and frame stepping. Jon reviewed the lab before the map was wired.
- **Nov 26 Level 3 verification:** 20,000 motion samples pass finite values, floor bounds, held-ball contact, low stance, distinct Float height and position/velocity continuity at all three joins, including the wrap. Browser playback sampled with both hands at 1×/½×; catches and joins scrubbed visually. Feet transforms stay fixed throughout. Portrait 360×600, 390×664, 430×740 and landscape 568×320, 667×375, 844×390 checked; short landscape controls tightened after finding overflow. Browser console clean. A timed CDP playback probe stalled; visual playback checks and deterministic motion tests were used instead. Physical-device review remains Jon's check.
- **Nov 26 Floats approved and Level 3 handoff:** Jon approved the local Floats playtest and asked to begin Pound + Float in a fresh chat. Build and verify a fluid two-pounds, one-float loop first. Use the standalone Animation Lab for review before wiring the Level 3 map.
- **Nov 26 Developer mode access (local):** Jon asked to open playable levels directly for testing. Developer mode opens every playable level and step, with the existing timer Skip button. Normal progression applies when Developer mode is off.
- **Nov 26 Level 2 map (local):** Jon asked for Floats to match Pounds. The six sets alternate left and right at 15, 20, and 30 seconds per hand. The existing Step 2-1 ID preserves earned stars. Finishing all six opens the Level 3 placeholder.
- **Nov 26 Floats shoulder and rhythm refinement (local lab):** The painted shoulder cap keeps its shape as the upper arm shortens in perspective. A shallower elbow lift and greater overlap make the bend read as one arm. The knees and torso dip just after the push, with 1.26 rig units of hip travel per cycle (Pounds uses 1.8). Float keeps its .76 s loop and existing bounce. Review both hands at full and half speed in the standalone lab.
- **Floats quick review:** Jon prefers the standalone Animation Lab for incremental animation review. `dev/floats-preview.html` opens the game's actual Float loop directly with hand selection, half speed, pause, and a position slider. Use the full drill for timed sets and progression checks.
- **Nov 26 Level 2 Floats playtest:** Coach Dags calls it a change of height and pace. Let the ball and the same hand come up while the body stays low (1:55–2:20 and 2:45–3:16). The first prototype is a 15-second left-hand set with standalone floats, slower than Pounds. The two-pound lead-in belongs to the later combo drill. Step 2-1 opens after Level 1 and saves stars normally. Level 2 is marked as a preview so finishing that one step does not unlock Level 3. Private phone playtest first.
- **Nov 26 phone release approved:** Jon approved the combined device preview with the larger landscape court, saved-map startup fix, and final-five timer cues for GitHub Pages.
- **Nov 26 final-five drill cue (approved in local preview):** After completing Level 1, the player asked for a warning as the timer nears zero. The running timer turns coral at 5 and plays a soft tick at each displayed second through 1 using the existing sound toggle. The cue clears when the set pauses or finishes. Jon approved the cue for a final device check alongside the larger landscape court on First Handles Phone Preview.
- **Nov 26 full-height landscape playtest:** The header moved beside the court. Wide phones put the court between the header and controls. Narrower landscape screens put them together on the right. Dribble Tips expands in the controls area and temporarily hides Start. The court measures 374 px high on an 844×390 viewport, up from 310 px in the first pass. Checked five landscape sizes, portrait at 390×664, and Start, Lost it, and tips on the shortest landscape viewport. The existing private First Handles Phone Preview is the phone test target before any GitHub Pages release.
- **Nov 26 phone playtest fixes (local preview):** A fresh load of a saved Levels or level-map address with an existing player now opens the avatar home screen. The map remains reachable through Play Drills, and direct drill links still open the drill. Landscape drills give the court most of the screen height with the timer and controls beside it. Checked five landscape sizes from 568×320 to 1366×768 and the three target portrait sizes. Start and Lost it fit on the shortest landscape screen.
- **Nov 26 Pounds integration (approved for release):** The actual Level 1 drill uses Revised for every One-Hand Pounds step, with the low stance, earlier catch and 0.4 s cycle at full speed (0.8 s at half speed). The original motion remains the lab baseline. The taller posture remains available for future drills. The drill fit at 360×600, 390×664 and 430×740 without scrolling. Verified half-speed selection, countdown into play, Lost it freezing in the low pose, and the static reduced-motion pose and arrow. Gameplay screenshot: `dev/review/pounds-drill-phone.png`.
- **Nov 26 posture preservation:** Jon approved the lower stance and asked to retain the taller posture for future drills. `js/components/postures.js` now provides named `low` and `tall` presets plus `samplePosture(name, react)`. `tall` preserves the earlier Revised posture exactly; `low` preserves the accepted lower stance. Revised Pounds selects `low`, independently of ball/hand timing. Original Current motion is also unchanged. Future drills can use either preset; this does not add a player-facing stance switch. No push.
- **Nov 26 lower-stance follow-up (local):** Jon liked the uptempo pass and requested a more aggressive bent-over posture. Revised now sits 7.4 rig units deeper, increases forward torso foreshortening from .065 to .16, adds knee bend, and reduces body bob from 2.4 to 1.8 units. Feet remain planted; the accepted 0.4 s cycle and ball/hand path are unchanged. Full-body stance and rebound joint check inspected in the browser with no console errors. Portable phone preview rebuilt; `dev/review/lower-stance.png` records this pass. No push.
- **Nov 26 uptempo follow-up (local):** Jon requested faster pounds with the ball intercepted on its return. Revised now uses a 0.4 s cycle (150/min, 25% faster than Current's unchanged 120/min). Catch is at phase .78 with upward velocity, followed by a brief continuous fingertip redirection instead of waiting for a free-flight apex. This supersedes the initial equal-cycle comparison below. The two variants share elapsed time, with their own cycle durations; phase scrubbing still aligns poses. Both hands and 1×/½× remain available. The 150/min setting is an implementation choice for review, not a measured cadence from the videos. Numerical contact/floor/continuity and rising-catch checks passed; refreshed browser preview has no console errors. Portable `dev/review/phone-preview.html` is rebuilt; `uptempo-preview.png` shows this pass. Earlier contact sheets and WebM clips document the previous slower pass. No push.
- **Nov 26 animation comparison (local, awaiting Jon's review):** `dev/animation-preview.html` now compares Current/Revised for both hands at 1× and ½×, using the existing illustrated puppet and 0.5 s cycle. Current remains the production motion. The lab-only candidate (`dev/revised-pound.js`) extends fingertip push contact, softens the catch, follows through at the wrist, shortens floor compression, and reduces body bob. Coach Dags at 1:21 and CoachUp at 0:38 were opened and visually inspected; timing is an original interpretation, not motion capture. No Blender or new art needed. Mirror view retained. Synchronized pairs, pause/restart, shared phase scrub, hand close-up, magenta joint check and team colors are available. Phone widths 360/390/430 and laptop 1366 checked without horizontal overflow; browser console clean, reduced-motion starts paused, 10,001 numerical motion samples passed floor/contact/continuity checks. Review images and a self-contained phone HTML are in `dev/review/`; rebuild the portable file with `node tools/test/pack_animation_preview.mjs`. No push or deployment made.
- **Nov 26 playtest checkpoint:** The private [Sites preview](https://first-handles-phone-preview.resplendenthawk2.chatgpt.site/) changes through the green Done button were recovered into the editable GitHub review branch, `redesign/player-prototype`. The public build still deploys from `main`.
- **Next phase:** Open a focused Work chat within the First Handles project named **First Handles — Animation Lab**. Find useful real footage of One-Hand Pounds and evaluate reusable tools, rigs and licensed assets against the current illustrated 2D animation. Compare the existing rig with Spine and Rive before choosing or buying anything. Test fingertip contact, a natural bounce and smooth full- and half-speed loops. Consider what each option needs for rear three-quarter views, ball occlusion, different player likenesses, recolorable gear and Android play.
- **Build phase follows research:** Switch to a focused Codex thread for a playable One-Hand Pounds before-and-after on the review branch. Use this as the quality benchmark before a second-angle or accessory test and before course expansion. Keep one phase per chat, share a short handoff and exact steps when switching, and seek approval before public releases, purchases or a major change in direction. Reuse existing resources when their quality, editability, performance and licensing fit.
- **Chunks A, B, C, C2: done.** C2 = his illustrated puppet avatar, polished pound dribble, team colors on the card and in the drill (944f11e); follow-ups e665e90 (Level 1 rename, menu music) and 82f0970 (shoulder/neck cleanup, laptop button, autoplay).
- **Streetball UX pass: done** (8329344): game skin, title screen, trading-card player card, level tiles with progress, streetball court behind the drill (placeholder art made in code), countdown punch, broadcast Nice Work + swoosh celebration, drill music. Follow-ups: aab4076 (real basketball logo icon, themed Settings button), cfafd92 (compact Settings; step tiles show stars on their own line).
- **Chunk F (course research): proposed, waiting on Jon.** The full course is below under "Course plan". Jon needs to (1) confirm what a "float" is (see the open question) and (2) approve or adjust the course. After that, mark Chunk F done.
- **Handed off to Codex (Nov 25).**
- **Waiting on Jon:** a device check of the live app (new look on tablet/phone/laptop, title screen tap, both music tracks, dribble at real speed). Optional later: painted art from his AI tool (prompts under "Art to replace later").
- **Next after F:** build Level 2's content + animation (new motion in `motions.js`), then the later levels in order. The APK step (PWA + package) is small and can happen any time Jon wants it.

## Course plan (Chunk F proposal, Nov 25; NOT yet approved)

### Research basis
- Breakthrough Basketball's beginner stationary progression: right-hand pound, left-hand pound, half circles each hand, continuous crossovers, one-dribble crossovers, control dribble. Cues: finger pads not palm, pound it hard, eyes up. https://www.breakthroughbasketball.com/play.asp?id=8326
- Youth Sports Coaching 4-phase sequence: 7U–9U stay stationary (ball control + low dribble), with no two-ball drills for 7U; directional change and pressure come at 10U+.
- Zig-zag teaching order: crossover first, then between the legs, then behind the back (FastModel Sports).
- So the course is **stationary, one ball**. Moving and two-ball drills go to Later modules.

### Levels (10 levels, 4 zones; zones match the future level map)
| # | Zone | Level | What it is | Animation work |
|---|---|---|---|---|
| 1 | Driveway | Pounds | built (`one-hand-dribble`) | done |
| 2 | Driveway | Floats | same hand rises with a higher, slower bounce while the player stays low | **six steps in local playtest** |
| 3 | Driveway | Pound + Float | 2 pounds, 1 float, repeat | combo; build a reusable "combo player" that chains motions here |
| 4 | Driveway | Push-Pulls | one hand, ball rocks forward/back beside the foot | variation of Floats (turned 90°, depth shown by ball scale + shadow) |
| 5 | Park | Crossovers | bounce in front, hand to hand, nonstop | **new motion** (both hands) |
| 6 | Park | Pound-Pound-Cross | 2 pounds, cross, repeat | combo |
| 7 | Gym | Between the Legs | staggered stance, through and back | **new motion** + new leg pose for the puppet |
| 8 | Gym | Cross + Between | cross, then between back | combo |
| 9 | Arena | Behind the Back | wrap around the back to the other hand | **new motion**, the hardest: the ball passes behind the body (layer swap) |
| 10 | Arena | The Combo | cross → between → behind | combo |

Totals: 4 new motions, 1 variation, 4 combos.

### Steps, times, stars
- 6 steps per level. One-hand levels alternate left/right (like Level 1). Two-hand levels alternate "start left / start right" (store as `hand: "left"`/`"right"` = starting hand).
- Times: Levels 1–6 are 15/15/20/20/30/30 s. Levels 7–10 are 20/20/30/30/45/45 s.
- ★ = finish. ★★ = "Eyes up the whole time" on every level. ★★★ = eyes up plus:
  - Floats, Pound + Float, Push-Pulls: "stay low the whole time"
  - Crossovers, Pound-Pound-Cross: "crosses stay below your knees"
  - Between the Legs, Behind the Back: "the ball never touches you"
  - Cross + Between, The Combo: "never hit Lost it"

### Key tips (3 per drill, shown under the animation)
- **Floats:** "Stay low as the ball rises" · "Let your hand rise with the ball" · "Keep your hand above it, then push it back down"
- **Pound + Float:** "Pound, pound, float: keep the beat" · "Hand stays on top for the float" · "Stay low the whole time"
- **Push-Pulls:** "Push it forward, pull it back" · "Keep it beside your foot" · "Hand on top, no carrying"
- **Crossovers:** "Low and quick across your body" · "Catch it with the other hand's fingertips" · "Bounce it in the middle"
- **Pound-Pound-Cross:** "Two hard pounds, then cross" · "Cross low, below your knees" · "Same beat both sides"
- **Between the Legs:** "Step one foot forward first" · "Bounce it in the middle, under you" · "Stay low so it fits"
- **Cross + Between:** "Cross, then through" · "Smooth first, fast later" · "Eyes up between moves"
- **Behind the Back:** "Wrap it around your hip" · "Bounce it behind your heels" · "Turn your hand to push it across"
- **The Combo:** "Smooth first, fast later" · "Same beat every move" · "Eyes up between moves"
- Pro tips (do / don't / level up) get written per drill when each level is built. Idea: "high-low pounds" as a Level 1 level-up tip.

### Reference videos (to analyze when each level gets built)
- Floats / Pound + Float: Coach Dags, https://www.youtube.com/watch?v=8qvCSEG0SIQ (floats 1:51–3:16)
- Push-Pulls: none picked yet; choose one at build time
- Crossovers / Pound-Pound-Cross: https://www.youtube.com/watch?v=vYKacBAyDWs · https://www.youtube.com/watch?v=I-_yRvGPkWU
- Between the Legs / Cross + Between: Jr. NBA under-the-leg drill https://www.youtube.com/watch?v=KIBJzEn_QG8 · Hawks Academy stationary cross + between https://www.youtube.com/watch?v=h7s31K0kPh4
- Behind the Back: https://www.youtube.com/watch?v=nLvBb6bGLcc · https://www.youtube.com/watch?v=Ze9QKvjZxYQ

### Open question for Jon
- **Float definition for the playtest:** The Coach Dags demo shows a higher, slower bounce on the same side with the hand rising and the body staying low. The earlier front-V idea is a different move.

### Blanks filled (Jon can change)
Zone names (Driveway/Park/Gym/Arena), the level names, 45 s steps in Levels 7–10, and high-low pounds as a tip instead of a level.

## Install as an app (APK) (goal set Nov 25)
Jon wants to install First Handles as an APK on his Android phone/tablet. Plan (no backend; the GitHub Pages site stays the source):
1. **Make it a PWA:** `manifest.webmanifest` (name, short name, dark theme color, landscape+portrait, icons 192/512 + maskable, start URL `/First-Handles/`), a small service worker that caches the app files, music, art and font for offline play, and "Add to Home Screen" support. Installed PWAs also get reliable music autoplay. Needs an app icon (the basketball + "FH", made in code; painted icon later if Jon wants).
2. **Package as an APK:** wrap the live PWA as a Trusted Web Activity APK with PWABuilder (pwabuilder.com, enter the live URL, choose Android) or Bubblewrap. Jon downloads the APK and sideloads it (allow "install unknown apps"). For full screen with no browser bar, Digital Asset Links needs `.well-known/assetlinks.json` at the domain root (`purplejersey.github.io/.well-known/`), which means a `purplejersey.github.io` repo or a custom domain. Without it the APK still works but shows a slim URL bar.
3. **Keep in mind while building:** everything must work offline from a fixed start URL; no dependence on the browser's back button; progress stays in local storage per device (the APK and the browser keep separate progress).
- Play Store publishing is possible later (one-time $25 developer account) but isn't needed for sideloading.

## Fixes & tweaks queue
- **Uncomplete a step** completed by accident (long-press or edit option in the step list). Re-lock later steps? Decide when building.
- **Pro tips panel:** 3 key tips under the animation + a "Pro tips" button with a scrollable ✅ Do / ❌ Don't / ⭐ Level up list (data in `DRILL_TIPS[drill].pro`). Before Start only.
- **Drill page scrolls by ~36px at 1366×680 in the intro** (Start still visible).
- **Portrait shoe logo (minor):** swoosh-like mark on the portrait's left sneaker.
- **Neck under the collar (minor):** a little hidden neck shows in the V at the lowest knee bob; invisible at normal size.
- **Card stat labels** are a bit wide-spaced on laptops (cosmetic).
- **Test script output paths:** some `tools/test/` scripts write to `/home/claude/c2/`; make the path configurable.

Done (recent): compact Settings + step tile stars (cfafd92); logo ball + Settings button (aab4076); streetball UX pass + drill music (8329344); shoulder joints, neck in the V, laptop Start button, music autoplay (82f0970). Earlier: drill fits all screen shapes, star review, developer mode + Skip, tip 3 reworded, Level 1 renamed, menu music.

Done (Nov 26): Developer mode opens playable levels and drills for local testing. Floats has a full six-step map and refined animation ready for local review. Jon approved the revised One-Hand Pounds drill and the recovered private playtest changes for release together.
Done (Nov 26, Level 3): Same-hand Pound + Float lab and six playable course steps built and checked locally.
Review bundle: `dev/review/phone-preview.html` (portable, embedded art/modules), `phone-preview.png`, `contact-sheet.png` (both hands at 0/.2/.4/.44/.6/.9), `joint-closeups.png`, and `real-speed.webm` / `quarter-speed.webm` (both hands, wall-clock sampled canvas recordings). The live HTML remains the best smooth-motion comparison; recordings depend on capture frame rate. Physical Android testing remains for Jon.

## Goal of Beta v1
Get **Level 1** working end to end with a solid base UX. Use it with the player, learn from that, then expand.

## Locked decisions
- **It's a game more than an app (Jon, Nov 24).** Direction: **NBA Street–style streetball** (Nov 25): sleek, sporty, fun.
- **Platform:** a single static web app (HTML/CSS/JS, no backend), on GitHub Pages from `purplejersey/First-Handles`. **Live: https://purplejersey.github.io/First-Handles/** Will also be installable as an **APK**.
- **Devices:** mainly tablet and laptop/TV; must also work on a phone. Progress saves on one device (browser storage). The drill screen fits a phone held upright without scrolling.
- **Structure:** levels contain steps; locked ladder; finished steps are replayable.
- **Completion:** timed, honor system. Lost it (any time, also after time's up) pauses and resets the timer; "I'm ready" → 3-2-1 → full restart. Only Done saves.
- **Drill flow:** tutorial loops with optional tips and half-speed playback → Start drill → 3-2-1 → "GO!" → animation loops next to a big timer → Done → Nice Work with the star review.
- **Mirror vs. true view:** basic drills use mirror view + a "YOUR LEFT HAND" helper; set per drill (`DRILLS[drill].view`).
- **Content pipeline:** drill videos are analyzed to make original animations.
- **Music (Jon's own Suno tracks, by johnnycito):**
  - **Menu: "Jackie Moon"**, starts 5 s in, loops outside the countdown, active drills and paused drills.
  - **Drill: "Nostalgia"**, starts 10 s in, starts at GO and plays until time's up. The countdown plays three separate tones, then the drill track starts. Finishing restarts the menu track.
  - The completed **Tap to play** gesture starts music when enabled. The music button top-right turns all music on/off (saved). `js/music.js` (`setTrack()`, `restartMusic()`) is the one place to change.
- **Title screen:** "First Handles" logo + "Tap to play" over the court, once per app open (sessionStorage).
- **Art direction:** game-quality painted style for the character (his AI illustration, cut-out puppet). The UI skin is the streetball look; backgrounds are placeholder art made in code until painted art replaces them.
- **One avatar everywhere:** the same character on the card (portrait) and in drills (puppet), with the same team colors and number.
- **Privacy:** his illustrated avatar is on the public site (Jon's choice); photos never go in the repo.
- **Team colors:** main = jersey + shorts (and the UI glow); accent = trim, number, buttons, highlights. Sneakers use the secondary color for their body and the primary color for their accents. Socks keep their own color. Swatches include Neon Yellow.
- **Jersey number:** drawn live in block athletic digits (`jerseyNumber.js`), never baked into art.
- **Stars per step:** ★ finish; ★★ / ★★★ honor-system bonus challenges; one star unlocks the next step; the best is kept. Level 1: ★★ eyes up the whole time; ★★★ eyes up + stay low.

## Streetball UX pass (DONE Nov 25)
- **Skin:** `css/street.css` layered over `css/styles.css` (layout/sizing stays in styles.css). Dark court background with team-color radial glow and diagonal texture; **Anton** display font (bundled `assets/fonts/anton.woff`, OFL license next to it), italic uppercase headings with an accent slash; slanted clip-path buttons with drop shadows and a light sweep on main buttons; slanted back button, inputs, tips, tiles.
- **Logo:** wordmark (`logo()` in `js/ui.js`): an SVG basketball (true seams, shading, outline, tilted) + "FIRST" + "HANDLES" on an accent slab.
- **Title screen:** `js/components/titleScreen.js`.
- **Home:** logo, "What's up, <name>!", trading-card player card (`playerCard(profile, stats)`: holo shine, team-color frame, halftone glow, "#23 NAME" plate, Stars/Steps/Reps badges from `getTotals()` in `progress.js`), **Settings** button (`GEAR_SVG` in `ui.js`), **"Let's ball"** button. Landscape: card left, the rest right.
- **Levels:** tiles with side stripe, steps done, stars x/18, progress bar (`levelList` items take `meta` and `progress`).
- **Drill:** court backdrop `assets/scene/court.webp` (made by `tools/avatar/court_bg.py`) + team-color glow in the SVG; contact/foot shadows; 3-2-1 punches in, then "GO!".
- **Nice Work:** broadcast band (kicker "STEP 1-2 COMPLETE", "NICE WORK!", "#23 NAME" tag) animating in; star review. Celebration = skewed swoosh band (a step closes after 1.6 s; a level waits for a tap).
- **Screen transitions:** each screen slides in slightly (`#app.screen-in`).

## Art to replace later (optional, Jon's AI tool; upload the boy portrait as style reference)
- **Drill court (4:3):** painted 2D game background in the reference's style; outdoor streetball court at dusk, city skyline, chain-link fence, colorful graffiti wall, asphalt with painted lines; seen from mid-court at a child's eye height; court floor in the bottom 30% with a straight horizon; calm center, no people/ball/text/logos. Keep the floor line at y 258 and the ball bounce line at y 268 of the 400×300 box (re-tune shadows if needed).
- **Title / menu backdrop (16:9):** the same court, wider, more dramatic lighting, room in the middle for the logo.
- **App icon (512×512, for the APK):** basketball on a dark court tile with "FH", bold and readable at small sizes.

## Animation spec: one-hand pound dribble (revised Nov 26)
The local drill uses a 0.4 s cycle with the low stance. The hand releases at phase .16, the ball compresses at .34–.375, and the fingertips meet the rising ball at .78. The original motion below is retained as the comparison baseline.

Front view, full body, ~60% of box height. 0.5 s cycle on one clock. Push 0–0.30 (catch at upper thigh, ball accelerates into the floor), floor 0.30–0.355 (squash 0.78/1.14), up to 0.88, catch/give to 1.0. Fingertips on the top-outer ball, thumb on the inner side, palm hovering; wrist steady while touching, flicks on release. Body dips after each push, shoulder dips, head steady, hair trails. Painted 8-panel ball, 48-frame spin, 45° per bounce. No screen shake. Helper: small dark pill "YOUR LEFT HAND" + thin arrow. Freeze on paused/finished, restart on I'm ready, reduced motion = still stance + arrow. New motions should match this quality bar and live in `js/components/motions.js` with the same `sample(p)` shape.

## Puppet avatar (Chunk C2)
Art: `art/source/stance.png`, `art/source/portrait.png`. Cutting: `tools/avatar/cut.py` (defringe, pieces incl. hair + dribbling thumb, hidden fills, shoulder skin on arms, armhole on torso, despike, neck fitted). Renderer `avatar.js`, ball `tools/avatar/ball2.py`, recolor `recolor.js`, card `playerCard.js`. New art means re-measuring joints, thumb pivot, armhole boxes, chest number box and the portrait number spot. New poses (e.g. the staggered stance for Between the Legs) may need new pieces or joint ranges.

## Where things live in the repo
- `AGENTS.md`: agent rules. `docs/BRIEF.md`: this file.
- `index.html`: loads `css/styles.css` + `css/street.css`, preloads the font.
- `js/app.js`: router; `initMusic()`; `showTitleScreen()`; screen-in animation.
- `js/music.js`: menu + drill tracks, `setTrack(name, {restart})`, `restartMusic()`, `preloadDrillMusic()`, music button. `assets/audio/menu.mp3`, `assets/audio/drill.mp3`.
- `js/data/levels.js`: `LEVELS`, `DRILLS`, `DRILL_TIPS`. `js/data/swatches.js`.
- `js/screens/`: `home.js`, `levels.js`, `level.js`, `drill.js` (Start → `setTrack("drill")`; finish → `restartMusic()`; cleanup → menu), `nicework.js`, `setup.js` (first launch + Settings).
- `js/components/`: `drillAnimation.js` (court backdrop + glow, shadows, rig, helper), `motions.js`, `avatar.js`, `puppetRig.js` (generated), `recolor.js`, `jerseyNumber.js`, `playerCard.js`, `titleScreen.js`, `celebration.js`, `levelList.js`, `toast.js`.
- `js/progress.js`: saved state (`firstHandles.v1`: profile, completions, dev, music); `completeStep()`, stars, `getTotals()`, dev mode, music on/off.
- `js/ui.js`: helpers, `header()`, `logo()`, `GEAR_SVG`.
- `assets/avatar/`, `assets/scene/court.webp`, `assets/fonts/`, `art/source/`, `tools/avatar/`, `tools/test/`, `dev/animation-preview.html`.
- Pounds motion: `js/components/poundMotion.js` supplies the revised motion registered in `motions.js`. The animation lab in `dev/animation-preview.js` compares the original and revised variants. `tools/test/pack_animation_preview.mjs` packages the offline comparison.
- Combo motion: `js/components/comboMotion.js` chains aligned same-hand bounces; `motions.js` registers `pound-float`. `dev/pound-float-preview.html` + `.js` provide its standalone review lab. `tools/test/combo_check.mjs` checks floor/contact/stance/joins (`node tools/test/combo_check.mjs`).

## Chunk B: Level 1 content (DONE)
Reference: Coach Steve Dagostino ("Coach Dags"), "Basketball Dribbling Drills for Beginners", https://www.youtube.com/watch?v=8qvCSEG0SIQ (ages ~5–10). Pound dribble 0:25–1:51; floats 1:51–3:16. Tips: "Sit in your stance: knees bent, back straight" · "Push it, don't slap it: use your fingertips" · "Pound it low by your hip, sneak a peek up"; 9 pro tips; stars as above. Level 1 steps: 1-1/1-2 15 s, 1-3/1-4 20 s, 1-5/1-6 30 s, alternating left/right.

## Beta v1 work chunks
- **A, B, C, C2, Streetball UX pass:** DONE.
- **F. Course research:** proposed (above), waiting on Jon's OK.
- **Install as APK (any time):** PWA manifest + service worker + icon, then PWABuilder APK.
- **Then:** build the next levels' content + animations (one motion per new move in `motions.js`, a combo player for combo levels), then **E. polish + test with the player** (real devices, fixes queue, Pro tips panel), and painted art when Jon has it.

## Later modules (doors kept open)
- **Avatar locker + unlockables (Jon):** shoes, shoe/sock colors, accessories (headband, wristbands, sleeves, goggles, balls), some unlocked by stars/levels. Fits the puppet: recolor masks for shoes/socks; accessories as image layers pinned to joints; the profile gains a `look` object; keep card and puppet in sync.
- **More audio:** sound effects (bounce, countdown, star tally), volume slider.
- **More course:** moving drills (walk/jog dribbling, zig-zag), two-ball drills, ball-control warmups (slaps, around the world, figure 8).
- Game-style level map (driveway → park → gym → arena) · park/driveway backgrounds · "upload a photo" avatar for other kids (needs an AI service + backend) · progressive celebrations · parent controls · Play Store release · 3D character (parked) · camera dribble counting · cross-device sync · skip-ahead progression.

## Design notes for keeping doors open
- Postures are reusable: `js/components/postures.js` exports `POSTURES` and `samplePosture(name, react)`. Spread the returned fields into a motion's pose; choose `low` for aggressive Pounds or `tall` when a future drill needs the previous higher stance. Ball paths, timing, arms, hair and cloth remain owned by the motion.
- Levels/steps are data; completions record stars; "step complete" is one signal.
- Colors are CSS variables; recolor reads the theme; the street skin is one file (`css/street.css`) and can be swapped.
- One avatar shared everywhere; tips and star challenges are data per drill.
- New moves = new motion entries in `motions.js`, not a new engine.
- Music has one home (`js/music.js`); celebration and level list are swappable components.
- Stay install-friendly: relative asset paths, everything cacheable for offline, own Back buttons.
