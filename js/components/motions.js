// Motion descriptions, one per drill. Each takes the shared clock phase
// (0 -> 1, one cycle) and returns where everything is at that moment, in rig
// space with the dribbling hand on the screen-left side ("L"). The engine
// flips the result for the other side. New moves = new entries here.

const R = 17;          // ball radius
const FLOOR = 258;     // floor line in the 0-300 box

const easeOut = (t) => 1 - (1 - t) * (1 - t);
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.min(1, Math.max(0, t));

export const MOTIONS = {
  "one-hand-dribble": {
    cycle: 0.5,          // seconds per dribble (~2 bounces a second)
    ballRadius: R,
    ballX: -59,          // just outside the dribbling-side foot
    floor: FLOOR,
    sample(p) {
      const top = 177;                // ball center at the push start (hip height)
      const crest = top - 5;          // where the hand catches it
      const low = FLOOR - R;          // ball center when it touches the floor

      // ---- ball (center y, squash/stretch) ----
      let y, sx = 1, sy = 1, touch = 0;
      if (p < 0.40) {                       // 1. push: ease-in, like gravity + a push
        const t = p / 0.40;
        y = top + (low - top) * (0.3 * t + 0.7 * t * t);
      } else if (p < 0.48) {                // 2. floor: brief squash, no wobble
        const t = (p - 0.40) / 0.08;
        touch = Math.sqrt(Math.sin(Math.PI * t)); // quick in, held, quick out
        y = low; sy = 1 - 0.15 * touch; sx = 1 + 0.12 * touch;
      } else if (p < 0.90) {                // 3. up: slows near the top, slight stretch early
        const t = (p - 0.48) / 0.42;
        y = low + (crest - low) * easeOut(t);
        const st = t < 0.6 ? Math.sin(Math.PI * t / 0.6) : 0;
        sy = 1 + 0.06 * st; sx = 1 - 0.03 * st;
      } else {                              // 4. catch: hand gives with the ball
        const t = (p - 0.90) / 0.10;
        y = crest + (top - crest) * t * t;
      }

      // ---- dribbling hand (palm center), locked to the ball while touching ----
      const ballTop = (q) => {
        if (q < 0.40) { const t = q / 0.40; return top + (low - top) * (0.3 * t + 0.7 * t * t) - R; }
        if (q >= 0.90) { const t = (q - 0.90) / 0.10; return crest + (top - crest) * t * t - R; }
        return null;
      };
      const PALM = 4;   // palm sits a little onto the ball (fingers over the top)
      const REL = 0.16, LOWP = 0.26;
      let hy;
      const h0 = ballTop(REL);
      const v0 = (ballTop(REL) - ballTop(REL - 0.001)) / 0.001;
      const handLow = h0 + v0 * (LOWP - REL) / 2;
      const handCatch = crest - R;
      if (p < REL || p >= 0.90) hy = ballTop(p);
      else if (p < LOWP) { const tau = p - REL; hy = h0 + v0 * tau - (v0 * tau * tau) / (2 * (LOWP - REL)); }
      else hy = handLow + (handCatch - handLow) * smooth(clamp01((p - LOWP) / (0.90 - LOWP)));

      // ---- body: small knee bob, lowest just after the push ----
      const drop = 5 * (0.5 + 0.5 * Math.cos(2 * Math.PI * (p - 0.3)));
      const hipY = 166 + drop;

      return {
        ball: { x: this.ballX, y, sx, sy },
        touch,
        pose: {
          hipY,
          headY: 166 + drop * 0.4 - 66,       // head steadier than the torso
          knees: 8 + drop * 0.6,
          arms: {
            L: { target: { x: this.ballX, y: hy + PALM }, hand: 0 },
            R: { upper: -13 + Math.sin(2 * Math.PI * p) * 1.2, fore: 12, hand: 4 }, // relaxed free arm, tiny sway
          },
        },
      };
    },
  },
};

export function motionFor(drill) {
  return MOTIONS[drill] || MOTIONS["one-hand-dribble"];
}
