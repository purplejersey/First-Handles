// The one avatar: a single character built from swappable SVG parts, used in
// the drills now and on the home screen / player card later.
//
// - Part slots (face shape, hair, brows, eyes, nose, mouth, ears, extras) are
//   small functions that return SVG. Swap a slot's art and every screen updates;
//   the animation never changes because it only moves the joint groups.
// - Colors are CSS variables: --jersey / --jersey-trim from the player card,
//   plus --skin, --hair, --shorts, --shoe, --shoe-trim, --sock with defaults.
// - Joints: neck/head, shoulders, elbows, wrists, hips, knees. Each joint is a
//   <g data-j="..."> that rotates around its own pivot. poseAvatar() places them.
// - Sides: "L" / "R" mean the screen side in the unflipped drawing (front view,
//   so "L" is the character's right hand). The drill engine flips the whole rig
//   with one transform for mirror vs. true view; the jersey number counter-flips.
//
// Coordinates: the rig is drawn around x = 0 (center line) with y in the drill
// box's 0–300 space (floor at y = 258). The caller positions it with a transform.

export const DEFAULT_LOOK = {
  face: "round",
  hair: "shortCrop",
  brows: "soft",
  eyes: "round",
  nose: "button",
  mouth: "smile",
  ears: "round",
  extras: [], // e.g. ["freckles"], ["headband"], ["glasses"]
};

// Body measurements (youth proportions, slightly big head).
export const BODY = {
  hipX: 12, hipDrop: 6,       // hip joints sit a bit below the pelvis point
  thigh: 52, shin: 50,
  ankleX: 23, ankleY: 247,    // feet shoulder-width apart
  shoulderX: 24, shoulderY: -56, // relative to the pelvis
  upperArm: 36, forearm: 34, handReach: 8, // handReach: wrist -> palm center
  neckTop: -66,               // head pivot, relative to the pelvis
  standHipY: 150, stanceHipY: 162,
};

const C = {
  skin: "var(--skin, #D9A066)",
  hair: "var(--hair, #2A1B12)",
  jersey: "var(--jersey, #4B2E83)",
  trim: "var(--jersey-trim, #FDB927)",
  shorts: "var(--shorts, var(--jersey, #4B2E83))",
  shoe: "var(--shoe, #1F2230)",
  shoeTrim: "var(--shoe-trim, var(--jersey-trim, #FDB927))",
  sock: "var(--sock, #FFFFFF)",
  ink: "#1B1B1F",
};
const SHADE = `fill="#000" fill-opacity="0.16"`;   // the one shadow tone
const SHINE = `fill="#fff" fill-opacity="0.22"`;   // the one highlight tone

// ---------- part slots (head parts drawn around the head center 0,-22) ----------
export const PARTS = {
  face: {
    round: () => `
      <path d="M0,-45 C13,-45 21,-36 21,-23 C21,-10 13,1 0,1 C-13,1 -21,-10 -21,-23 C-21,-36 -13,-45 0,-45 Z" fill="${C.skin}"/>
      <path d="M21,-23 C21,-10 13,1 0,1 C9,-3 15,-11 16,-23 Z" ${SHADE}/>`,
  },
  ears: {
    round: () => `
      <ellipse cx="-20.5" cy="-21" rx="4.5" ry="6" fill="${C.skin}"/>
      <ellipse cx="20.5" cy="-21" rx="4.5" ry="6" fill="${C.skin}"/>
      <ellipse cx="20.5" cy="-21" rx="4.5" ry="6" ${SHADE}/>`,
  },
  hair: {
    // back: drawn behind the face; front: on top of it. Any custom shape works.
    shortCrop: {
      back: () => ``,
      front: () => `
        <path d="M-21.5,-22 C-24,-41 -14,-49 0,-49 C14,-49 24,-41 21.5,-22
                 C20.5,-29 18,-33 14,-35 C9,-31 2,-31 -3,-35 C-7,-31 -13,-31 -17,-33
                 C-19.5,-30 -21,-26 -21.5,-22 Z" fill="${C.hair}"/>
        <path d="M-12,-45 C-6,-48 4,-48 9,-45" stroke="#fff" stroke-opacity="0.25" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    },
  },
  brows: {
    soft: () => `
      <path d="M-12.5,-28.5 Q-8.5,-31 -4.5,-29" stroke="${C.hair}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M12.5,-28.5 Q8.5,-31 4.5,-29" stroke="${C.hair}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
  },
  eyes: {
    // Eyes look straight ahead: reads as "eyes up".
    round: () => `
      <ellipse cx="-8.2" cy="-20.5" rx="4.2" ry="4.9" fill="#fff"/>
      <ellipse cx="8.2" cy="-20.5" rx="4.2" ry="4.9" fill="#fff"/>
      <circle cx="-7.8" cy="-20.6" r="2.7" fill="${C.ink}"/>
      <circle cx="8.6" cy="-20.6" r="2.7" fill="${C.ink}"/>
      <circle cx="-6.8" cy="-21.8" r="0.95" fill="#fff"/>
      <circle cx="9.6" cy="-21.8" r="0.95" fill="#fff"/>`,
  },
  nose: {
    button: () => `<path d="M-2.4,-12.2 Q0,-10.2 2.4,-12.2" stroke="#000" stroke-opacity="0.35" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  },
  mouth: {
    smile: () => `
      <path d="M-6,-6.5 Q0,-1 6,-6.5 Q0,-4.2 -6,-6.5 Z" fill="${C.ink}"/>
      <path d="M-6,-6.5 Q0,-1 6,-6.5" stroke="${C.ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  },
  extras: {
    freckles: () => `<g fill="#000" fill-opacity="0.22">
      <circle cx="-11" cy="-13" r="0.8"/><circle cx="-13.5" cy="-11.5" r="0.8"/><circle cx="-9.5" cy="-10.8" r="0.8"/>
      <circle cx="11" cy="-13" r="0.8"/><circle cx="13.5" cy="-11.5" r="0.8"/><circle cx="9.5" cy="-10.8" r="0.8"/></g>`,
    headband: () => `<path d="M-21.5,-32 Q0,-38 21.5,-32 L21,-27 Q0,-33 -21,-27 Z" fill="${C.trim}"/>`,
    glasses: () => `<g fill="none" stroke="${C.ink}" stroke-width="1.6">
      <circle cx="-8.2" cy="-20.5" r="6"/><circle cx="8.2" cy="-20.5" r="6"/><path d="M-2.2,-21 Q0,-22.5 2.2,-21"/></g>`,
  },
};

function part(slot, name, fallback) {
  const fn = PARTS[slot][name] || PARTS[slot][fallback];
  return typeof fn === "function" ? fn() : "";
}

// ---------- body pieces ----------
function shoe(sign) {
  // Front view, toes turned slightly out (sign = -1 left, +1 right).
  return `
    <g transform="translate(${sign * 3},0)">
      <path d="M-11,7 C-12,-3 -6,-6 0,-6 C6,-6 12,-3 11,7 Z" fill="${C.shoe}"/>
      <path d="M-4,-4 L4,-4 M-4.5,-1 L4.5,-1" stroke="#fff" stroke-opacity="0.7" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M${sign * 6},-2 Q${sign * 10},2 ${sign * 11},6" stroke="${C.shoeTrim}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <rect x="-13" y="5" width="26" height="6" rx="3" fill="#F2F2F2"/>
      <rect x="-13" y="8.5" width="26" height="2.5" rx="1.2" fill="#000" fill-opacity="0.12"/>
    </g>`;
}

function thighArt() {
  return `<rect x="-8" y="0" width="16" height="${BODY.thigh}" rx="8" fill="${C.skin}"/>`;
}

function shinArt(detail) {
  return `
    <rect x="-6.8" y="-2" width="13.6" height="${BODY.shin + 2}" rx="6.8" fill="${C.skin}"/>
    ${detail === "full" ? `<rect x="1.5" y="2" width="4.5" height="26" rx="2.2" ${SHADE}/>` : ""}
    <rect x="-7" y="29" width="14" height="${BODY.shin - 29 + 1}" rx="3" fill="${C.sock}"/>
    <rect x="-7" y="32" width="14" height="3" fill="${C.trim}"/>`;
}

function upperArmArt(detail) {
  return `
    <circle cx="0" cy="1" r="7.6" fill="${C.skin}"/>
    <rect x="-6.6" y="0" width="13.2" height="${BODY.upperArm + 3}" rx="6.6" fill="${C.skin}"/>
    ${detail === "full" ? `<rect x="1.8" y="3" width="4.6" height="${BODY.upperArm - 6}" rx="2.3" ${SHADE}/>` : ""}`;
}

function forearmArt(detail) {
  return `
    <rect x="-5.8" y="-2" width="11.6" height="${BODY.forearm + 3}" rx="5.8" fill="${C.skin}"/>
    ${detail === "full" ? `<rect x="1.4" y="2" width="4" height="${BODY.forearm - 6}" rx="2" ${SHADE}/>` : ""}`;
}

function dribbleHandArt() {
  // Palm down on the ball, fingers spread (fingertips, not the palm).
  const finger = (deg, len) =>
    `<rect x="-1.9" y="0" width="3.8" height="${len}" rx="1.9" fill="${C.skin}" transform="translate(0,9) rotate(${deg})"/>`;
  return `
    ${finger(38, 9)}${finger(13, 10.5)}${finger(-13, 10.5)}${finger(-38, 9)}
    <ellipse cx="0" cy="6" rx="7.2" ry="6.6" fill="${C.skin}"/>
    <rect x="-1.9" y="0" width="3.8" height="9" rx="1.9" fill="${C.skin}" transform="translate(6,4) rotate(-70)"/>
    <ellipse cx="2.5" cy="7" rx="3" ry="4" ${SHADE}/>`;
}

function relaxedHandArt() {
  return `
    <ellipse cx="0" cy="6.5" rx="6.2" ry="7.2" fill="${C.skin}"/>
    <path d="M-3.5,4 Q-5,8 -2.5,11" stroke="#000" stroke-opacity="0.25" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
}

function arm(side, detail, dribble) {
  // Flat groups (not nested) so each segment can be foreshortened on its own.
  return `
    <g data-j="upper${side}">${upperArmArt(detail)}</g>
    <g data-j="fore${side}">${forearmArt(detail)}</g>
    <g data-j="hand${side}">${dribble ? dribbleHandArt() : relaxedHandArt()}</g>`;
}

function torsoArt(number, detail) {
  const num = String(number ?? "").slice(0, 2);
  return `
    <rect x="-6.2" y="-74" width="12.4" height="20" rx="4" fill="${C.skin}"/>
    <rect x="-6.2" y="-66" width="12.4" height="6" ${SHADE}/>
    <ellipse cx="0" cy="-53" rx="28.5" ry="8.5" fill="${C.skin}"/>
    <path d="M-20,3 L-23.5,-37 C-22.5,-46 -20,-53 -17.5,-60 L-9,-61.5
             C-7,-54 -4,-51.5 0,-51.5 C4,-51.5 7,-54 9,-61.5 L17.5,-60
             C20,-53 22.5,-46 23.5,-37 L20,3 Z" fill="${C.jersey}"/>
    <path d="M-9,-61.5 C-7,-54 -4,-51.5 0,-51.5 C4,-51.5 7,-54 9,-61.5" stroke="${C.trim}" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path d="M-23.5,-37 C-22.5,-46 -20,-53 -17.5,-60 M23.5,-37 C22.5,-46 20,-53 17.5,-60" stroke="${C.trim}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M23.5,-37 L20,3 L12,3 C15,-10 16,-24 19,-40 Z" ${SHADE}/>
    ${detail === "full" ? `<path d="M-17,-44 C-15,-38 -14,-30 -14.5,-24 L-18.5,-24 C-19,-31 -19,-38 -17,-44 Z" ${SHINE}/>` : ""}
    <g class="av-num" transform="translate(0,-27)">
      <text x="0" y="0" text-anchor="middle" dominant-baseline="central"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="900"
        font-size="${num.length > 1 ? 17 : 19}" fill="${C.trim}" stroke="#000" stroke-opacity="0.25"
        stroke-width="1" paint-order="stroke">${num.replace(/[<&>"]/g, "")}</text>
    </g>`;
}

function shortsArt() {
  return `
    <path d="M-21.5,-6 L21.5,-6 L29,31 L3.5,31 L0,17 L-3.5,31 L-29,31 Z" fill="${C.shorts}"/>
    <rect x="-21.5" y="-8" width="43" height="5" rx="1.5" fill="${C.trim}"/>
    <path d="M-23,-3 L-28.6,29 M23,-3 L28.6,29" stroke="${C.trim}" stroke-width="3" stroke-linecap="round"/>
    <path d="M29,31 L3.5,31 L0,17 L6,-3 L21.5,-6 Z" ${SHADE}/>`;
}

function headArt(look) {
  const hair = PARTS.hair[look.hair] || PARTS.hair.shortCrop;
  const extras = (look.extras || []).map((x) => part("extras", x)).join("");
  return `
    ${hair.back()}
    ${part("ears", look.ears, "round")}
    ${part("face", look.face, "round")}
    ${part("brows", look.brows, "soft")}
    ${part("eyes", look.eyes, "round")}
    ${part("nose", look.nose, "button")}
    ${part("mouth", look.mouth, "smile")}
    <ellipse cx="-12" cy="-10" rx="3.6" ry="2.2" fill="#E8614D" fill-opacity="0.22"/>
    <ellipse cx="12" cy="-10" rx="3.6" ry="2.2" fill="#E8614D" fill-opacity="0.22"/>
    ${extras}
    ${hair.front()}`;
}

/**
 * SVG markup for the rigged avatar (no <svg> wrapper).
 * opts.dribbleSide: "L" | "R" | null — which hand gets the spread dribbling hand.
 * opts.detail: "full" (home/player card) | "drill" (fewer shading pieces on fast parts).
 * opts.slot: optional markup to place between the body and the dribbling arm
 *            (the ball goes here so the hand sits on top of it).
 */
export function avatarMarkup({ look = DEFAULT_LOOK, number = "", detail = "full", dribbleSide = "L", slot = "" } = {}) {
  const sides = ["L", "R"];
  return `
    <g class="av">
      ${sides.map((s) => `<g data-j="foot${s}">${shoe(s === "L" ? -1 : 1)}</g>`).join("")}
      ${sides.map((s) => `<g data-j="shin${s}">${shinArt(detail)}</g>`).join("")}
      ${sides.map((s) => `<g data-j="thigh${s}">${thighArt()}</g>`).join("")}
      <g data-j="torso">${torsoArt(number, detail)}</g>
      <g data-j="hips">${shortsArt()}</g>
      <g data-j="head">${headArt(look)}</g>
      ${sides.filter((s) => s !== dribbleSide).map((s) => arm(s, detail, false)).join("")}
      ${slot}
      ${sides.filter((s) => s === dribbleSide).map((s) => arm(s, detail, true)).join("")}
    </g>`;
}

/** Collect the joint groups once, so posing each frame is cheap. */
export function rigRefs(svgRoot) {
  const refs = {};
  svgRoot.querySelectorAll("[data-j]").forEach((el) => { refs[el.dataset.j] = el; });
  refs.num = svgRoot.querySelector(".av-num");
  return refs;
}

// ---------- posing ----------
const DEG = 180 / Math.PI;
const r2 = (n) => Math.round(n * 100) / 100;
// Rotation (deg) that points a segment drawn along +y in direction (dx, dy).
const segAngle = (dx, dy) => Math.atan2(-dx, dy) * DEG;

// Two-bone IK. bend = +1 puts the elbow/knee toward -x (screen left), -1 toward +x.
export function solveTwoBone(sx, sy, tx, ty, l1, l2, bend) {
  const dx = tx - sx, dy = ty - sy;
  const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const base = Math.atan2(dy, dx);
  const a = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
  const ex = sx + l1 * Math.cos(base + bend * a);
  const ey = sy + l1 * Math.sin(base + bend * a);
  const upper = segAngle(ex - sx, ey - sy);
  const lower = segAngle(tx - ex, ty - ey);
  return { upper, lower: lower - upper, elbow: { x: ex, y: ey } };
}

/**
 * Place every joint for one frame.
 * pose = {
 *   hipY,                 // pelvis height (stance ≈ 162; lower = deeper knees)
 *   headY,                // optional head pivot override (head steadier than torso)
 *   arms: { L: { target: {x,y} } | { upper, fore, hand }, R: ... },
 *   knees: outward knee offset in px (bent knees read as slightly out in front view)
 * }
 * Targets are the palm center in rig space (x around 0, y in the 0–300 box).
 */
export function poseAvatar(refs, pose) {
  const B = BODY;
  const hipY = pose.hipY ?? B.stanceHipY;
  const set = (key, t) => refs[key]?.setAttribute("transform", t);

  set("torso", `translate(0,${r2(hipY)})`);
  set("hips", `translate(0,${r2(hipY)})`);
  set("head", `translate(0,${r2(pose.headY ?? hipY + B.neckTop)})`);

  // Legs: feet planted; knees placed between hip and ankle, nudged outward.
  // Segment lengths are fitted with scaleY (front-view foreshortening).
  for (const s of ["L", "R"]) {
    const sign = s === "L" ? -1 : 1;
    const hx = sign * B.hipX, hy = hipY + B.hipDrop;
    const ax = sign * B.ankleX, ay = B.ankleY;
    const kx = (hx + ax) / 2 + sign * (pose.knees ?? 4);
    const ky = hy + (ay - hy) * 0.48;
    set(`thigh${s}`, `translate(${r2(hx)},${r2(hy)}) rotate(${r2(segAngle(kx - hx, ky - hy))}) scale(1,${r2(Math.hypot(kx - hx, ky - hy) / B.thigh)})`);
    set(`shin${s}`, `translate(${r2(kx)},${r2(ky)}) rotate(${r2(segAngle(ax - kx, ay - ky))}) scale(1,${r2(Math.hypot(ax - kx, ay - ky) / B.shin)})`);
    set(`foot${s}`, `translate(${ax},${ay})`);
  }

  // Arms. In a front view a bent elbow mostly points toward the camera, so the
  // elbow only swings out a little (FORESHORTEN) and the segments get shorter
  // on screen (scaleY). The hand is never scaled, and its palm lands exactly on
  // the target, so the hand and ball can't drift apart.
  const FORESHORTEN = 0.35;
  for (const s of ["L", "R"]) {
    const a = pose.arms?.[s];
    if (!a) continue;
    const sign = s === "L" ? -1 : 1;
    const sx = sign * B.shoulderX, sy = hipY + B.shoulderY;
    const L1 = B.upperArm, L2 = B.forearm + B.handReach;
    let tx, ty, ex, ey;
    if (a.target) {
      tx = a.target.x; ty = a.target.y;
      const sol = solveTwoBone(sx, sy, tx, ty, L1, L2, s === "L" ? 1 : -1);
      const k = L1 / (L1 + L2);
      const mx = sx + (tx - sx) * k, my = sy + (ty - sy) * k;
      ex = mx + (sol.elbow.x - mx) * FORESHORTEN;
      ey = my + (sol.elbow.y - my) * FORESHORTEN;
    } else {
      const rad = (d) => d / DEG;
      const u = rad(a.upper ?? 0), f = rad((a.upper ?? 0) + (a.fore ?? 0));
      ex = sx - Math.sin(u) * L1; ey = sy + Math.cos(u) * L1;
      tx = ex - Math.sin(f) * L2; ty = ey + Math.cos(f) * L2;
    }
    const foreAng = segAngle(tx - ex, ty - ey);
    const fl = Math.hypot(tx - ex, ty - ey);
    const wx = tx - (tx - ex) / fl * B.handReach, wy = ty - (ty - ey) / fl * B.handReach;
    set(`upper${s}`, `translate(${r2(sx)},${r2(sy)}) rotate(${r2(segAngle(ex - sx, ey - sy))}) scale(1,${r2(Math.hypot(ex - sx, ey - sy) / L1)})`);
    set(`fore${s}`, `translate(${r2(ex)},${r2(ey)}) rotate(${r2(foreAng)}) scale(1,${r2(Math.hypot(wx - ex, wy - ey) / B.forearm)})`);
    set(`hand${s}`, `translate(${r2(wx)},${r2(wy)}) rotate(${r2(foreAng + (a.hand ?? 0))})`);
  }
}

/** Keep the jersey number readable when the rig is flipped. */
export function setNumberFlip(refs, flipped) {
  refs.num?.setAttribute("transform", `translate(0,-27)${flipped ? " scale(-1,1)" : ""}`);
}
