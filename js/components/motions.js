// Motion descriptions, one per drill. Each takes the shared clock phase
// (0 -> 1, one cycle) and returns where everything is at that moment, in rig
// space with the dribbling hand on the screen-left side ("L"). The engine
// flips the result for the other side. New moves = new entries here.

const R = 19;          // ball radius (sized to the illustrated avatar)
const FLOOR = 258;     // floor line in the 0-300 box (where the shoes stand)
const BALL_FLOOR = 268; // the ball bounces just outside and in front of the foot, so lower on screen

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const lerp = (a, b, t) => a + (b - a) * t;

// Cubic-bezier easing, the same curve a CSS/GSAP CustomEase describes, sampled
// by our one clock (no separate timeline). x1, x2 in 0..1.
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t;
  const fy = (t) => ((ay * t + by) * t + cy) * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {            // Newton steps on x(t) = x
      const d = (3 * ax * t + 2 * bx) * t + cx;
      if (Math.abs(d) < 1e-6) break;
      t -= (fx(t) - x) / d;
    }
    return fy(Math.min(1, Math.max(0, t)));
  };
}
const PUSH = bezier(0.42, 0.06, 0.86, 0.58);   // accelerates into the floor (hard pound)
const RISE = bezier(0.18, 0.72, 0.4, 1.0);     // pops off the floor, slows into the hand
const GIVE = bezier(0.3, 0.0, 0.7, 1.0);       // hand absorbs the catch
const SNAP = bezier(0.55, 0.0, 0.2, 1.0);      // wrist flicks down

// A 0 -> 1 -> 0 bump over one cycle: quick to its peak, slow to recover.
function bump(p, peak) {
  const q = ((p % 1) + 1) % 1;
  return q < peak ? smooth(q / peak) : 1 - smooth((q - peak) / (1 - peak));
}

// Phase marks for the pound (fractions of one cycle).
const P_FLOOR = 0.30;   // ball reaches the floor
const P_UP = 0.355;     // leaves the floor
const P_CATCH = 0.88;   // hand meets the ball
const P_REL = 0.065;     // ball leaves the fingertips
const P_LOW = 0.135;     // hand at its lowest

export const MOTIONS = {
  "one-hand-dribble": {
    cycle: 0.5,          // seconds per dribble (~2 bounces a second)
    ballRadius: R,
    ballX: -60,          // beside the dribbling-side foot, a little in front of it
    floor: FLOOR,
    ballFloor: BALL_FLOOR,
    sample(p) {
      const SIT = 5;                         // sits deeper than the art's stance
      const crest = 184;                     // ball center at the catch (ball top at the upper thigh)
      const top = crest + 4;                 // after the hand gives: where the push starts
      const low = BALL_FLOOR - R;            // ball center when it touches the floor

      // ---- ball (center y, squash/stretch, spin) ----
      const ballY = (q) => {
        if (q < P_FLOOR) return lerp(top, low, PUSH(q / P_FLOOR));
        if (q < P_UP) return low;
        if (q < P_CATCH) return lerp(low, crest, RISE((q - P_UP) / (P_CATCH - P_UP)));
        return lerp(crest, top, GIVE((q - P_CATCH) / (1 - P_CATCH)));
      };
      let y = ballY(p), sx = 1, sy = 1, touch = 0;
      if (p >= P_FLOOR && p < P_UP) {        // firm squash: quick in, brief hold, quick out
        const t = (p - P_FLOOR) / (P_UP - P_FLOOR);
        touch = Math.pow(Math.sin(Math.PI * t), 0.6);
        sy = 1 - 0.22 * touch; sx = 1 + 0.14 * touch;
      } else if (p >= P_UP && p < P_UP + 0.16) { // slight stretch as it leaves, settles fast
        const st = Math.sin(Math.PI * (p - P_UP) / 0.16);
        sy = 1 + 0.07 * st; sx = 1 - 0.04 * st;
      } else if (p > P_FLOOR - 0.07 && p < P_FLOOR) { // stretched by speed just before impact
        const st = (p - (P_FLOOR - 0.07)) / 0.07;
        sy = 1 + 0.06 * st; sx = 1 - 0.03 * st;
      }
      // how far through this bounce's roll the ball is (0 -> 1); the engine carries it across bounces
      const spin = p < P_FLOOR ? 0.55 * smooth(p / P_FLOOR)
        : p < P_UP ? 0.55 + 0.05 * (p - P_FLOOR) / (P_UP - P_FLOOR)
        : 0.6 + 0.4 * smooth((p - P_UP) / (1 - P_UP));
      // 0 high up -> 1 on the floor, for the contact shadow
      const near = clamp01((y - crest) / (low - crest));

      // ---- dribbling hand: fingers locked to the ball while touching ----
      // Fingertips press the top-outer part of the ball (ALPHA out from the top),
      // so the palm hovers and the thumb can fold onto the inner side.
      const PALM = 1;                        // how far the pads press into the leather
      const ALPHA = 20 / 57.2958;
      const reachR = R - PALM;
      const ballTop = (q) => ballY(q) - reachR * Math.cos(ALPHA);
      const h0 = ballTop(P_REL);
      const v0 = (ballTop(P_REL) - ballTop(P_REL - 0.001)) / 0.001;
      const handLow = h0 + v0 * (P_LOW - P_REL) / 2;   // keeps moving, eases to a stop
      const handCatch = crest - reachR * Math.cos(ALPHA);
      let hy;
      if (p < P_REL || p >= P_CATCH) hy = ballTop(p);
      else if (p < P_LOW) { const tau = p - P_REL; hy = h0 + v0 * tau - (v0 * tau * tau) / (2 * (P_LOW - P_REL)); }
      else hy = lerp(handLow, handCatch, smooth(clamp01((p - P_LOW) / (P_CATCH - P_LOW))));

      // wrist: bent back so the hand is near level; it holds steady while the fingertips push, flicks as the ball leaves, then cocks back to receive
      const COCK = 62, PRESS = 3, FLICK = 42, MID = 47;   // hand stays fairly level; fingertips do the work
      let wrist;
      if (p < P_REL) wrist = lerp(COCK, COCK - PRESS, SNAP(p / P_REL));   // fingertips press: wrist barely moves
      else if (p < P_LOW + 0.04) wrist = lerp(COCK - PRESS, FLICK - 4, SNAP((p - P_REL) / (P_LOW + 0.04 - P_REL))); // flick follows through
      else if (p < 0.62) wrist = lerp(FLICK - 4, MID, smooth((p - P_LOW - 0.04) / (0.62 - P_LOW - 0.04)));
      else if (p < P_CATCH) wrist = lerp(MID, COCK + 3, smooth((p - 0.62) / (P_CATCH - 0.62)));
      else wrist = lerp(COCK + 3, COCK, GIVE((p - P_CATCH) / (1 - P_CATCH)));

      // thumb grips just before the catch and lets go just after the release
      const grip = p < P_REL ? 1 : p < P_REL + 0.07 ? 1 - smooth((p - P_REL) / 0.07)
        : p < P_CATCH - 0.1 ? 0 : p < P_CATCH ? smooth((p - (P_CATCH - 0.1)) / 0.1) : 1;

      // ---- body: reacts to each push (knees, hips, shoulder), head stays quiet ----
      const react = bump(p - 0.02, 0.2);     // peaks just after the push
      const drop = 5.5 * react;
      const hipY = 160.6 + SIT + drop;
      const lean = -2.2 - 2.4 * bump(p - 0.03, 0.2);   // dribbling shoulder dips with the push
      const hinge = 0.05 + 0.015 * react;   // slight forward lean reads as a shorter torso
      // secondary motion: hair and jersey trail the body's dip by a few frames
      const late = bump(p - 0.09, 0.2);
      const hair = 0.8 * (late - react);   // up to ~0.6 units, settles back
      const cloth = 0.008 * (late - react);

      return {
        ball: { x: this.ballX, y, sx, sy, spin },
        touch,
        near,
        pose: {
          hipY,
          lean,
          hinge,
          headLift: drop * 0.55,             // head rides only part of the bob
          hair,
          cloth,
          knees: 4 + drop * 0.5,
          arms: {
            L: {
              target: { x: this.ballX - reachR * Math.sin(ALPHA), y: hy },
              hand: wrist,
              // where the ball sits in the hand (the real ball while touching); the
              // thumb rests on it, then eases back to relaxed via grip
              ball: { x: this.ballX, y: hy + reachR * Math.cos(ALPHA), r: R },
              grip,
            },
            R: { upper: -27 + 1.4 * react, fore: -3 - 2 * react, hand: 2 }, // free arm: tiny, weighted sway
          },
        },
      };
    },
  },
};

export function motionFor(drill) {
  return MOTIONS[drill] || MOTIONS["one-hand-dribble"];
}
