// One-Hand Pounds: intercept the rebound in a low stance.
import { samplePosture } from './postures.js';

const clamp = x => Math.max(0, Math.min(1, x));
const smooth = x => { const t = clamp(x); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
// Tangents are in rig units per cycle, giving continuous catch/release velocity.
function hermite(a, b, va, vb, t, duration) {
  return (2*t**3-3*t*t+1)*a + (t**3-2*t*t+t)*va*duration
    + (-2*t**3+3*t*t)*b + (t**3-t*t)*vb*duration;
}
export const marks = { release: .16, floor: .34, rebound: .375, catch: .78 };
const { release, floor, rebound, catch: receive } = marks;
const R = 19, crest = 194, start = 198, low = 249, angle = 18 * Math.PI / 180;
const catchVelocity = -100; // Intercept while still rising; never wait for a free-flight apex.
const reach = R - .6;
function ballY(p) {
  if (p < release) return hermite(start, 211, 120, 160, p/release, release);
  if (p < floor) { const t = p-release; return 211 + 160*t + (low-211-160*(floor-release))*(t/(floor-release))**2; }
  if (p < rebound) return low;
  if (p < receive) {
    const d = receive-rebound, t = (p-rebound)/d;
    // Ball remains on its rising arc at contact, then the fingertips redirect it.
    return low + (2*(crest-low)-catchVelocity*d)*t + (catchVelocity*d-(crest-low))*t*t;
  }
  return hermite(crest, start, catchVelocity, 120, (p-receive)/(1-receive), 1-receive);
}
const poundMotion = {
  cycle: .4, // 150 pounds/minute, a 25% cadence increase over Current's 120.
  posture: 'low', // Future motions can select 'tall' without changing this drill.
  sample(p) {
    p = ((p % 1) + 1) % 1;
    const base = this.baseline.sample(p);
    const y = ballY(p);
    const contact = p < release || p >= receive;
    const touch = p >= floor && p < rebound ? Math.sin(Math.PI*(p-floor)/(rebound-floor))**2 : 0;
    // Renderer anchors squash at the ball's bottom, exactly on the floor.
    const sy = 1 - .12*touch, sx = 1 + .075*touch;
    const handAtRelease = ballY(release)-reach*Math.cos(angle);
    let hy;
    if (contact) hy = y-reach*Math.cos(angle);
    else if (p < .26) hy = hermite(handAtRelease, handAtRelease+8, 160, 0, (p-release)/.1, .1);
    else hy = hermite(handAtRelease+8, crest-reach*Math.cos(angle), 0, catchVelocity, (p-.26)/(receive-.26), receive-.26);
    let wrist;
    if (p < release) wrist = mix(62, 56, smooth(p/release));
    else if (p < .28) wrist = mix(56, 32, smooth((p-release)/.12));
    else if (p < .52) wrist = mix(32, 43, smooth((p-.28)/.24));
    else if (p < receive) wrist = mix(43, 65, smooth((p-.52)/(receive-.52)));
    else wrist = mix(65, 62, smooth((p-receive)/(1-receive)));
    const react = (1-Math.cos(2*Math.PI*p))/2;
    return {
      ...base, ball: { x: this.ballX, y, sx, sy, spin: p }, touch,
      near: clamp((y-crest)/(low-crest)),
      // Sit deeper and hinge forward; keep feet planted and avoid bouncing upright.
      pose: { ...base.pose, ...samplePosture(this.posture, react),
        hair: base.pose.hair*.5, cloth: base.pose.cloth*.5,
        arms: { ...base.pose.arms, L: {
          target: { x: this.ballX-reach*Math.sin(angle), y: hy }, hand: wrist,
          ball: { x: this.ballX, y: hy+reach*Math.cos(angle), r: R },
          grip: contact ? 1 : p < .24 ? 1-smooth((p-release)/.08) : smooth((p-(receive-.1))/.1),
        } },
      },
    };
  },
};
export function createPoundMotion(baseline) {
  return { ...baseline, ...poundMotion, baseline };
}
