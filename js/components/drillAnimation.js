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

import { avatarMarkup, poseAvatar, rigRefs, setNumberFlip, DEFAULT_LOOK } from "./avatar.js";
import { motionFor } from "./motions.js";

const W = 400, H = 300;
const MOVING = new Set(["intro", "countdown", "running"]);

// Which screen side the dribbling hand is on.
function screenSide(hand, view) {
  const left = hand === "left";
  return (view === "true" ? !left : left) ? "left" : "right";
}

function helperMarkup(side, hand) {
  // Drawn for the left side, then mirrored by coordinates (text never flips).
  const right = side === "right";
  const X = (x) => (right ? W - x : x);
  const anchor = right ? "end" : "start";
  const textStyle = `font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="900"
    fill="var(--secondary, #FDB927)" stroke="#111" stroke-width="5" stroke-linejoin="round" paint-order="stroke"`;
  const arrow = `M${X(48)},76 Q${X(56)},126 ${X(112)},146`;
  const head = `M${X(100)},134 L${X(116)},147 L${X(98)},155`;
  return `
    <g class="anim__helper" aria-hidden="true">
      <text x="${X(16)}" y="36" text-anchor="${anchor}" font-size="17" letter-spacing="1" ${textStyle}>YOUR</text>
      <text x="${X(16)}" y="62" text-anchor="${anchor}" font-size="24" letter-spacing="0.5" ${textStyle}>${hand.toUpperCase()} HAND</text>
      <path d="${arrow}" fill="none" stroke="#111" stroke-width="9" stroke-linecap="round"/>
      <path d="${head}" fill="none" stroke="#111" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${arrow}" fill="none" stroke="var(--secondary, #FDB927)" stroke-width="5" stroke-linecap="round"/>
      <path d="${head}" fill="none" stroke="var(--secondary, #FDB927)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
}

function ballMarkup(r) {
  return `
    <g class="anim__ball"><g data-ball-inner>
      <circle r="${r}" fill="var(--ball, #E8742C)"/>
      <path d="M${r * 0.15},${-r} C${r * 0.9},${-r * 0.55} ${r * 0.95},${r * 0.45} ${r * 0.2},${r}" fill="#000" fill-opacity="0.16"/>
      <ellipse cx="${-r * 0.38}" cy="${-r * 0.42}" rx="${r * 0.3}" ry="${r * 0.2}" fill="#fff" fill-opacity="0.3" transform="rotate(-30 ${-r * 0.38} ${-r * 0.42})"/>
      <g fill="none" stroke="#4A230B" stroke-width="1.5" stroke-linecap="round">
        <path d="M${-r},0 L${r},0"/>
        <path d="M0,${-r} C${-r * 0.5},${-r * 0.4} ${-r * 0.5},${r * 0.4} 0,${r}"/>
        <path d="M${-r * 0.7},${-r * 0.72} C${-r * 0.3},${-r * 0.3} ${-r * 0.3},${r * 0.3} ${-r * 0.7},${r * 0.72}"/>
        <path d="M${r * 0.7},${-r * 0.72} C${r * 0.3},${-r * 0.3} ${r * 0.3},${r * 0.3} ${r * 0.7},${r * 0.72}"/>
      </g>
      <circle r="${r}" fill="none" stroke="#4A230B" stroke-width="1.6"/>
    </g></g>`;
}

export function drillAnimation({ drill, hand, view = "mirror", number = "", look = DEFAULT_LOOK }) {
  const motion = motionFor(drill);
  const side = screenSide(hand, view);
  const flipped = side === "right";
  const spotX = flipped ? W / 2 - motion.ballX : W / 2 + motion.ballX;
  const label = `${hand === "left" ? "Left" : "Right"} hand ${drill.replace(/-/g, " ")}, ${view === "true" ? "true" : "mirror"} view`;
  const rmArrowX = flipped ? spotX + 34 : spotX - 34;
  return `
    <div class="anim" role="img" aria-label="Animation: ${label}"
      data-drill="${drill}" data-hand="${hand}" data-view="${view}" data-side="${side}">
      <svg class="anim__svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
        <rect class="anim__floor" x="0" y="${motion.floor}" width="${W}" height="${H - motion.floor}" fill="var(--floor, #9AA0A6)"/>
        <rect x="0" y="${motion.floor}" width="${W}" height="2" fill="#000" fill-opacity="0.12"/>
        <ellipse class="anim__spot" cx="0" cy="0" rx="21" ry="4.6" fill="#000" fill-opacity="0.14"
          transform="translate(${spotX},${motion.floor + 2})"/>
        <g class="anim__rig" transform="translate(${W / 2},0)${flipped ? " scale(-1,1)" : ""}">
          ${avatarMarkup({ look, number, detail: "drill", dribbleSide: "L", slot: ballMarkup(motion.ballRadius) })}
        </g>
        <g class="anim__rm-arrow" style="display:none">
          <path d="M${rmArrowX},180 L${rmArrowX},236 M${rmArrowX - 9},190 L${rmArrowX},178 L${rmArrowX + 9},190 M${rmArrowX - 9},226 L${rmArrowX},238 L${rmArrowX + 9},226"
            fill="none" stroke="#111" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M${rmArrowX},180 L${rmArrowX},236 M${rmArrowX - 9},190 L${rmArrowX},178 L${rmArrowX + 9},190 M${rmArrowX - 9},226 L${rmArrowX},238 L${rmArrowX + 9},226"
            fill="none" stroke="var(--secondary, #FDB927)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        ${helperMarkup(side, hand)}
      </svg>
    </div>`;
}

export function mountDrillAnimation(stageEl) {
  const box = stageEl.querySelector(".anim");
  const svg = box?.querySelector("svg");
  if (!svg) return { setPhase() {}, destroy() {} };

  const motion = motionFor(box.dataset.drill);
  const flipped = box.dataset.side === "right";
  const refs = rigRefs(svg);
  setNumberFlip(refs, flipped);
  const ball = svg.querySelector(".anim__ball");
  const spot = svg.querySelector(".anim__spot");
  const spotBase = spot.getAttribute("transform");
  const rmArrow = svg.querySelector(".anim__rm-arrow");
  const reducedQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

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
    const k = 1 + 0.12 * s.touch;
    spot.setAttribute("transform", `${spotBase} scale(${r2(k)},${r2(k)})`);
    spot.setAttribute("fill-opacity", r2(0.14 + 0.08 * s.touch));
  }

  const reduced = () => !!reducedQuery?.matches;
  const shouldMove = () => MOVING.has(phase) && !reduced() && !document.hidden;

  function frame(t) {
    if (last !== null) p = (p + Math.min(0.1, (t - last) / 1000) / motion.cycle) % 1;
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
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      document.removeEventListener("visibilitychange", onVisibility);
      reducedQuery?.removeEventListener?.("change", update);
    },
    // For tests/dev: draw a specific clock phase.
    _renderAt(q) { render(q); },
  };
}
