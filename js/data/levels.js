// Levels and steps live here. New levels are data entries, not code.
// A level with an empty `steps` list shows as "Coming soon" once unlocked.
// `drill` names the animation/tutorial to use (filled in by later chunks).

export const LEVELS = [
  {
    id: 1,
    title: "One-Hand Dribbling",
    steps: [
      { id: "1-1", hand: "left",  seconds: 15, drill: "one-hand-dribble" },
      { id: "1-2", hand: "right", seconds: 15, drill: "one-hand-dribble" },
      { id: "1-3", hand: "left",  seconds: 20, drill: "one-hand-dribble" },
      { id: "1-4", hand: "right", seconds: 20, drill: "one-hand-dribble" },
      { id: "1-5", hand: "left",  seconds: 30, drill: "one-hand-dribble" },
      { id: "1-6", hand: "right", seconds: 30, drill: "one-hand-dribble" },
    ],
  },
  { id: 2, title: "Level 2", steps: [] },
  { id: 3, title: "Level 3", steps: [] },
  { id: 4, title: "Level 4", steps: [] },
  { id: 5, title: "Level 5", steps: [] },
];

// Placeholder tips per drill, shown under the looping animation.
// Chunk B replaces these with real coaching cues.
export const DRILL_TIPS = {
  "one-hand-dribble": [
    "Eyes up, not on the ball",
    "Push the ball with your fingertips",
    "Keep it below your waist",
  ],
};
