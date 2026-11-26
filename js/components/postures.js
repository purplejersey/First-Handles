// Reusable front-view puppet stances. Posture is independent of ball timing
// and hand targets; future drills can select a stance without changing the rig.
export const POSTURES = Object.freeze({
  // Preserves the taller Revised stance from before the lower-stance pass.
  tall: Object.freeze({ hipY: 168.6, knees: 6, hinge: .065, hingeBob: .008, bob: 2.4, headSteady: .8 }),
  // Approved lower, forward-hinged stance for the One-Hand Pounds candidate.
  low: Object.freeze({ hipY: 176, knees: 9, hinge: .16, hingeBob: .006, bob: 1.8, headSteady: .9 }),
});

// react is the drill's body response, from 0 (rest) to 1 (deepest dip).
// Returns only posture fields, so each motion retains its own arm choreography.
export function samplePosture(name, react = 0) {
  const stance = POSTURES[name];
  if (!stance) throw new Error(`Unknown posture: ${name}`);
  const drop = stance.bob * react;
  return {
    hipY: stance.hipY + drop,
    knees: stance.knees + drop * .3,
    lean: -2.5 - 1.1 * react,
    hinge: stance.hinge + stance.hingeBob * react,
    headLift: drop * stance.headSteady,
  };
}
