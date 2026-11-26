// Drill animation engine (Chunk C). The player's avatar performs the drill.
// drillAnimation({ drill, hand, view, number }) returns the markup;
// mountDrillAnimation(stageEl) starts it and returns { setPhase, destroy }.
//
// - One shared clock (phase 0 -> 1 per cycle) drives the ball, the hand and
//   the body together through requestAnimationFrame, so they never drift.
// - view "mirror": the dribbling hand shows on the same screen side as his
//   hand (copy what you see). view "true": the avatar faces you, so his left
//   hand shows on the screen's right. One flip transform on the rig; the helper
//   label never flips.
// - Moves while intro / countdown / running; freezes in the stance with the
//   ball at the hip when paused or finished; stops when the tab is hidden.
// - Reduced motion: static stance plus an up-and-down arrow by the ball.

import { avatarMarkup, poseAvatar, rigRefs, setNumberFlip, applyTeamColors, DEFAULT_LOOK } from "./avatar.js";
import { motionFor } from "./motions.js";

const W = 400, H = 300;
const MOVING = new Set(["intro", "countdown", "running"]);

// Which screen side the dribbling hand is on.
function screenSide(hand, view) {
  const left = hand === "left";
  return (view === "true" ? !left : left) ? "left" : "right";
}

function helperMarkup(side, hand) {
  // A quiet label: small pill + thin arrow to the hand. Drawn for the left side,
  // then mirrored by coordinates (text never flips).
  const right = side === "right";
  const X = (x) => (right ? W - x : x);
  const label = `YOUR ${hand.toUpperCase()} HAND`;
  const pw = 22 + label.length * 9.1;             // pill width for the 14px label
  const px = right ? W - 12 - pw : 12;
  const arrow = `M${X(40)},44 Q${X(44)},126 ${X(108)},152`;
  const head = `M${X(99)},145 L${X(109)},152.5 L${X(98)},157`;
  return `
    <g class="anim__helper" aria-hidden="true">
      <rect x="${px}" y="12" width="${pw}" height="26" rx="13" fill="#0B0B12" fill-opacity="0.42"/>
      <text x="${px + pw / 2}" y="30" text-anchor="middle" font-size="14" letter-spacing="1"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="800"
        fill="#fff">${label}</text>
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="${arrow}" stroke="#0B0B12" stroke-opacity="0.28" stroke-width="5"/>
        <path d="${head}" stroke="#0B0B12" stroke-opacity="0.28" stroke-width="5"/>
        <path d="${arrow}" stroke="#fff" stroke-opacity="0.92" stroke-width="2.2"/>
        <path d="${head}" stroke="#fff" stroke-opacity="0.92" stroke-width="2.2"/>
      </g>
    </g>`;
}

// Painted ball sprite: a full turn about the spin axis in BALL_FRAMES frames
// (8 x 6 grid of 192px cells). The ball rolls FRAMES_PER_BOUNCE frames (45°)
// each dribble, carried across bounces so the seams keep turning.
const BALL_IMG = new URL("../../assets/avatar/ball_spin.webp", import.meta.url).href;
// Streetball court backdrop (placeholder art made in code: tools/avatar/court_bg.py).
const SCENE_IMG = new URL("../../assets/scene/court.webp", import.meta.url).href;
const BALL_FRAMES = 48, BALL_COLS = 8, FRAMES_PER_BOUNCE = 6;

function ballMarkup(r) {
  return `
    <g class="anim__ball">
      <svg data-ball-inner x="${-r}" y="${-r}" width="${2 * r}" height="${2 * r}" viewBox="0 0 192 192" overflow="hidden">
        <image href="${BALL_IMG}" width="${192 * BALL_COLS}" height="${192 * BALL_FRAMES / BALL_COLS}"/>
      </svg>
    </g>`;
}

export function drillAnimation({ drill, hand, view = "mirror", number = "", look = DEFAULT_LOOK, closeFrame = false }) {
  const motion = motionFor(drill);
  const side = screenSide(hand, view);
  const flipped = side === "right";
  const spotX = flipped ? W / 2 - motion.ballX : W / 2 + motion.ballX;
  const label = `${hand === "left" ? "Left" : "Right"} hand ${drill.replace(/-/g, " ")}, ${view === "true" ? "true" : "mirror"} view`;
  const rmArrowX = flipped ? spotX + 34 : spotX - 34;
  return `
    <div class="anim" role="img" aria-label="Animation: ${label}"
      data-drill="${drill}" data-hand="${hand}" data-view="${view}" data-side="${side}">
      <svg class="anim__svg" viewBox="${closeFrame ? "20 14 360 270" : `0 0 ${W} ${H}`}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
        <image class="anim__scene" href="${SCENE_IMG}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>
        <defs>
          <radialGradient id="anim-team-glow" cx="0.5" cy="0.38" r="0.6">
            <stop offset="0" stop-color="var(--jersey, #4B2E83)" stop-opacity="0.38"/>
            <stop offset="1" stop-color="var(--jersey, #4B2E83)" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="${W}" height="${H}" fill="url(#anim-team-glow)" style="mix-blend-mode:screen"/>
        <defs>
          <radialGradient id="anim-shadow">
            <stop offset="0" stop-color="#000" stop-opacity="0.75"/>
            <stop offset="0.55" stop-color="#000" stop-opacity="0.35"/>
            <stop offset="1" stop-color="#000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <g class="anim__shadow" fill="url(#anim-shadow)" opacity="1">
          <ellipse cx="${W / 2 - 37}" cy="${motion.floor + 0.5}" rx="20" ry="3.6"/>
          <ellipse cx="${W / 2 + 37}" cy="${motion.floor + 0.5}" rx="20" ry="3.6"/>
        </g>
        <ellipse class="anim__spot" cx="0" cy="0" rx="22" ry="4.2" fill="url(#anim-shadow)" opacity="0.3"
          transform="translate(${spotX},${(motion.ballFloor ?? motion.floor) + 1})"/>
        <g class="anim__rig" transform="translate(${W / 2},0)${flipped ? " scale(-1,1)" : ""}">
          ${avatarMarkup({ look, number, dribbleSide: "L", slot: ballMarkup(motion.ballRadius) })}
        </g>
        <g class="anim__rm-arrow" style="display:none">
          <path d="M${rmArrowX},180 L${rmArrowX},236 M${rmArrowX - 9},190 L${rmArrowX},178 L${rmArrowX + 9},190 M${rmArrowX - 9},226 L${rmArrowX},238 L${rmArrowX + 9},226"
            fill="none" stroke="#0B0B12" stroke-opacity="0.28" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M${rmArrowX},180 L${rmArrowX},236 M${rmArrowX - 9},190 L${rmArrowX},178 L${rmArrowX + 9},190 M${rmArrowX - 9},226 L${rmArrowX},238 L${rmArrowX + 9},226"
            fill="none" stroke="#fff" stroke-opacity="0.92" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        ${closeFrame ? "" : helperMarkup(side, hand)}
      </svg>
    </div>`;
}

export function mountDrillAnimation(stageEl) {
  const box = stageEl.querySelector(".anim");
  const svg = box?.querySelector("svg");
  if (!svg) return { setPhase() {}, setSpeed() {}, destroy() {}, recolor() {} };

  const motion = motionFor(box.dataset.drill);
  const flipped = box.dataset.side === "right";
  const refs = rigRefs(svg);
  setNumberFlip(refs, flipped);
  applyTeamColors(svg);                               // jersey + trim in the player card's colors
  const ball = svg.querySelector(".anim__ball");
  const ballInner = svg.querySelector("[data-ball-inner]");
  const spot = svg.querySelector(".anim__spot");
  const spotBase = spot.getAttribute("transform");
  const rmArrow = svg.querySelector(".anim__rm-arrow");
  const reducedQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

  let lastFrame = -1;
  let speed = 1;
  let bounces = 0;      // completed dribbles, so the ball's spin carries over
  let phase = "intro";
  let p = 0;            // shared clock phase, 0 -> 1 per dribble
  let last = null;
  let raf = 0;

  const r2 = (n) => Math.round(n * 100) / 100;

  function render(q) {
    const s = motion.sample(q);
    poseAvatar(refs, s.pose);
    const { x, y, sx, sy } = s.ball;
    const R = motion.ballRadius;
    // Squash/stretch anchored at the bottom of the ball.
    ball.setAttribute("transform", `translate(${x},${r2(y + R)}) scale(${r2(sx)},${r2(sy)}) translate(0,${-R})`);
    const frame = Math.floor((bounces + (s.ball.spin ?? 0)) * FRAMES_PER_BOUNCE) % BALL_FRAMES;
    if (frame !== lastFrame) {
      ballInner.setAttribute("viewBox", `${(frame % BALL_COLS) * 192} ${Math.floor(frame / BALL_COLS) * 192} 192 192`);
      lastFrame = frame;
    }
    // Contact shadow: grows and darkens as the ball nears the floor.
    const near = s.near ?? s.touch;
    const k = 0.5 + 0.5 * near + 0.1 * s.touch;
    spot.setAttribute("transform", `${spotBase} scale(${r2(k)},${r2(k)})`);
    spot.setAttribute("opacity", r2(0.2 + 0.7 * near * near + 0.1 * s.touch));
  }

  const reduced = () => !!reducedQuery?.matches;
  const shouldMove = () => MOVING.has(phase) && !reduced() && !document.hidden;

  function frame(t) {
    if (last !== null) {
      const next = p + Math.min(0.1, (t - last) / 1000) * speed / motion.cycle;
      if (next >= 1) bounces = (bounces + 1) % BALL_FRAMES;
      p = next % 1;
    }
    last = t;
    render(p);
    raf = requestAnimationFrame(frame);
  }

  function update() {
    const move = shouldMove();
    rmArrow.style.display = reduced() ? "" : "none";
    if (move && !raf) {
      last = null;
      raf = requestAnimationFrame(frame);
    } else if (!move && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
      // Freeze in the stance (ball held at the hip) unless only the tab hid.
      if (!MOVING.has(phase) || reduced()) { p = 0; render(0); }
    } else if (!move) {
      p = 0; render(0);
    }
  }

  const onVisibility = () => update();
  document.addEventListener("visibilitychange", onVisibility);
  reducedQuery?.addEventListener?.("change", update);

  render(0);

  return {
    setPhase(next) {
      const restart = !MOVING.has(phase) && MOVING.has(next);
      phase = next;
      if (restart) p = 0;
      update();
    },
    setSpeed(value) { speed = value; },
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      document.removeEventListener("visibilitychange", onVisibility);
      reducedQuery?.removeEventListener?.("change", update);
    },
    // Re-apply team colors (e.g. after the colors change while mounted).
    recolor() { return applyTeamColors(svg); },
    // For tests/dev: draw a specific clock phase (optionally after n dribbles, for the ball's spin).
    _renderAt(q, n) { if (n !== undefined) bounces = n % BALL_FRAMES; render(q); },
  };
}
