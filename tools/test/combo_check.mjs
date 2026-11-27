// Run from the repo root: node tools/test/combo_check.mjs
import assert from 'node:assert/strict';
import { motionFor } from '../../js/components/motions.js';
const motion = motionFor('pound-float');
const flatten = (o, prefix = '') => Object.entries(o).flatMap(([k,v]) =>
  typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]);
assert.equal(motion.cycle, 1.56);
let impacts = 0, touching = false, contacts = 0;
const peaks = [Infinity, Infinity, Infinity];
for (let i = 0; i < 20000; i++) {
  const p = i / 20000, s = motion.sample(p);
  for (const [key, value] of flatten(s)) assert(Number.isFinite(value), `${key} at ${p}`);
  assert(s.ball.y <= 249 + 1e-8, 'ball passes through floor');
  assert(s.pose.hipY >= 176 && s.pose.hipY <= 177.8 + 1e-8, 'approved low stance');
  assert(s.pose.arms.L.armGuide.down >= 19, 'elbow collapses toward shoulder');
  peaks[s.beat] = Math.min(peaks[s.beat], s.ball.y);
  if (s.touch > .99 && !touching) impacts++;
  touching = s.touch > .99;
  if (s.pose.arms.L.grip === 1) {
    assert(Math.abs(s.pose.arms.L.ball.y - s.ball.y) < 1e-7, 'held ball drifts from hand');
    assert(Math.abs(Math.hypot(s.pose.arms.L.target.x - s.ball.x,
      s.pose.arms.L.target.y - s.ball.y) - 18.4) < 1e-7, 'finger pads lose contact');
    contacts++;
  }
}
// Sampling begins inside an impact: the wraparound is counted at both ends.
assert.equal(impacts, 4);
assert(contacts > 1000);
assert(Math.abs(peaks[0] - peaks[1]) < .01);
assert(peaks[2] < peaks[0] - 25, 'float must read higher');
for (const t of [0, .4, .8]) {
  const epsilon = 1e-6;
  const samples = [-2, -1, 1, 2].map(d => Object.fromEntries(flatten(motion.sample((t + d * epsilon) / motion.cycle))));
  for (const key of Object.keys(samples[0]).filter(k => !['beat','ball.spin'].includes(k))) {
    assert(Math.abs(samples[1][key] - samples[2][key]) < .01, `position seam: ${key} at ${t}`);
    const left = (samples[1][key] - samples[0][key]) / epsilon;
    const right = (samples[3][key] - samples[2][key]) / epsilon;
    assert(Math.abs(left - right) < 2, `velocity seam: ${key} at ${t}: ${left}, ${right}`);
  }
}
console.log(JSON.stringify({samples:20000, cycle:motion.cycle, peaks, contacts, joins:'position + velocity pass'}));
