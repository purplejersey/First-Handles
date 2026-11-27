// Levels and steps live here. New levels are data entries, not code.
// A level with an empty `steps` list shows as "Coming soon" once unlocked.
// `drill` names the animation/tutorial to use (filled in by later chunks).

export const LEVELS = [
  {
    id: 1,
    title: "One‑Handed – Pounds",
    steps: [
      { id: "1-1", hand: "left",  seconds: 15, drill: "one-hand-dribble" },
      { id: "1-2", hand: "right", seconds: 15, drill: "one-hand-dribble" },
      { id: "1-3", hand: "left",  seconds: 20, drill: "one-hand-dribble" },
      { id: "1-4", hand: "right", seconds: 20, drill: "one-hand-dribble" },
      { id: "1-5", hand: "left",  seconds: 30, drill: "one-hand-dribble" },
      { id: "1-6", hand: "right", seconds: 30, drill: "one-hand-dribble" },
    ],
  },
  {
    id: 2,
    title: "Floats",
    steps: [
      { id: "2-1", hand: "left",  seconds: 15, drill: "float" },
      { id: "2-2", hand: "right", seconds: 15, drill: "float" },
      { id: "2-3", hand: "left",  seconds: 20, drill: "float" },
      { id: "2-4", hand: "right", seconds: 20, drill: "float" },
      { id: "2-5", hand: "left",  seconds: 30, drill: "float" },
      { id: "2-6", hand: "right", seconds: 30, drill: "float" },
    ],
  },
  {
    id: 3,
    title: "Pound + Float",
    steps: [
      { id: "3-1", hand: "left",  seconds: 15, drill: "pound-float" },
      { id: "3-2", hand: "right", seconds: 15, drill: "pound-float" },
      { id: "3-3", hand: "left",  seconds: 20, drill: "pound-float" },
      { id: "3-4", hand: "right", seconds: 20, drill: "pound-float" },
      { id: "3-5", hand: "left",  seconds: 30, drill: "pound-float" },
      { id: "3-6", hand: "right", seconds: 30, drill: "pound-float" },
    ],
  },
  { id: 4, title: "Level 4", steps: [] },
  { id: 5, title: "Level 5", steps: [] },
];

// Animation settings per drill (Chunk C). view: "mirror" shows the dribbling
// hand on the same screen side as his hand (copy what you see); "true" shows
// the avatar facing him, so his left hand appears on the screen's right.
export const DRILLS = {
  "one-hand-dribble": { view: "mirror" },
  float: { view: "mirror" },
  "pound-float": { view: "mirror" },
};

// Coaching content per drill (Chunk B, from Coach Dags + standard coaching cues).
// key:   3 short cues always shown under the animation.
// pro:   extra tips for the Pro tips panel (built later). type: "do" | "dont" | "levelup".
// stars: honor-system bonus challenges, picked on the "Nice work!" review. 1 star =
//        finish the time (always unlocks the next step). Stars stack: 3 stars means
//        the 2-star challenge too. Best per step is saved and never goes down.
export const DRILL_TIPS = {
  "pound-float": {
    key: [
      "Pound, pound, float: keep the beat",
      "Hand stays on top for the float",
      "Stay low the whole time",
    ],
    stars: {
      2: "Eyes up the whole time",
      3: "Eyes up + stay low the whole time",
    },
  },
  float: {
    key: [
      "Stay low as the ball rises",
      "Let your hand rise with the ball",
      "Keep your hand above it, then push it back down",
    ],
    stars: {
      2: "Eyes up the whole time",
      3: "Eyes up + stayed low as the ball rose",
    },
  },
  "one-hand-dribble": {
    key: [
      "Sit in your stance: knees bent, back straight",
      "Push it, don't slap it: use your fingertips",
      "Pound it low by your hip, sneak a peek up",
    ],
    pro: [
      { type: "do", text: "Bounce the ball just outside your foot, on the same side as your dribbling hand" },
      { type: "do", text: "Spread your fingers wide on the ball" },
      { type: "do", text: "Keep your elbow bent and loose. Your arm works like a spring" },
      { type: "do", text: "Count your dribbles out loud to keep a steady beat" },
      { type: "do", text: "Lost it? Get back in your stance and go again. Messing up is part of it" },
      { type: "dont", text: "Don't dribble with your palm. Use your fingertips and finger pads" },
      { type: "dont", text: "Don't stand up tall. Stay low the whole time" },
      { type: "dont", text: "Don't stare at the ball the whole time" },
      { type: "levelup", text: "Try looking up the whole time" },
    ],
    stars: {
      2: "Eyes up the whole time",
      3: "Eyes up + stay low the whole time",
    },
  },
};
