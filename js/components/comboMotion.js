// Chain same-hand bounces at maximum floor compression, where their ball
// position, scale and velocity agree. Blend only the free arm/body recovery;
// never crossfade a catch or detach the fingers from a held ball.
const wrap = p => ((p % 1) + 1) % 1;
const smooth = t => t * t * t * (t * (t * 6 - 15) + 10);
function blend(a, b, t) {
  if (typeof a === 'number') return a + (b - a) * t;
  return Object.fromEntries(Object.keys(a).map(k => [k, blend(a[k], b[k], t)]));
}

export function createComboMotion(steps) {
  const cycle = steps.reduce((sum, step) => sum + step.motion.cycle, 0);
  const starts = steps.map((_, i) => steps.slice(0, i).reduce((sum, s) => sum + s.motion.cycle, 0));
  const window = .055; // seconds either side of impact; safely outside contact
  function sampleStep(i, seconds) {
    const { motion, anchor } = steps[i];
    const sample = motion.sample(wrap(anchor + seconds / motion.cycle));
    const arm = sample.pose.arms.L;
    // Use the approved Float elbow guide throughout the combo so the solver
    // doesn't switch rigs when the hand begins to climb.
    const lift = Math.max(0, Math.min(1, (218 - arm.ball.y) / 62));
    const eased = lift * lift * (3 - 2 * lift);
    arm.armGuide ??= { out: 7.5, down: 26 - 7 * eased, handAngle: arm.hand + 9 + 27 * eased };
    return sample;
  }
  return {
    ...steps[0].motion, cycle, blendArm: true, bouncesPerCycle: steps.length,
    // Start the drill just before the first push, with the ball in hand.
    restPhase: (1 - steps[0].anchor) * steps[0].motion.cycle / cycle,
    beats: steps.map((s, i) => ({ label: s.label, start: starts[i] / cycle })),
    sample(p) {
      const time = wrap(p) * cycle;
      let i = starts.findLastIndex(start => time >= start);
      const local = time - starts[i], duration = steps[i].motion.cycle;
      const s = sampleStep(i, local);
      let before, after, offset;
      if (local < window) {
        before = (i + steps.length - 1) % steps.length; after = i; offset = local;
      } else if (duration - local < window) {
        before = i; after = (i + 1) % steps.length; offset = local - duration;
      }
      if (before !== undefined && steps[before].motion !== steps[after].motion) {
        s.pose = blend(sampleStep(before, steps[before].motion.cycle + offset).pose,
          sampleStep(after, offset).pose, smooth((offset + window) / (2 * window)));
      }
      s.ball.spin = i + local / duration;
      s.beat = i;
      return s;
    },
  };
}
