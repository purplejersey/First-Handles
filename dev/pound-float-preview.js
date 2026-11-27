import { drillAnimation, mountDrillAnimation } from "../js/components/drillAnimation.js";
import { motionFor } from "../js/components/motions.js";

const stage = document.querySelector("#stage");
const hand = document.querySelector("#hand");
const slow = document.querySelector("#slow");
const play = document.querySelector("#play");
const slider = document.querySelector("#phase");
const motion = motionFor("pound-float");
const cycle = motion.cycle;
const beats = [...document.querySelectorAll('.beats span')];
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let controller;
let playing = !reduced.matches;
let speed = 1;
let turns = 0;
let last;
let frame;

function draw() {
  const phase = turns % 1;
  controller._renderAt(phase, Math.floor(turns));
  slider.value = phase;
  const beat = motion.sample(phase).beat;
  beats.forEach((el, i) => el.classList.toggle('active', i === beat));
}

function mount() {
  controller?.destroy();
  stage.innerHTML = drillAnimation({ drill: "pound-float", hand: hand.value, number: "23", closeFrame: true });
  controller = mountDrillAnimation(stage);
  controller.setPhase("paused");
  draw();
}

function tick(now) {
  if (last !== undefined) turns += Math.min(now - last, 100) * speed / (1000 * cycle);
  last = now;
  draw();
  frame = requestAnimationFrame(tick);
}

function setPlaying(next) {
  playing = next;
  cancelAnimationFrame(frame);
  last = undefined;
  play.textContent = playing ? "Pause" : "Play";
  if (playing && !document.hidden) frame = requestAnimationFrame(tick);
}

hand.addEventListener("change", mount);
slow.addEventListener("click", () => {
  speed = speed === 1 ? 0.5 : 1;
  slow.setAttribute("aria-pressed", String(speed === 0.5));
});
play.addEventListener("click", () => setPlaying(!playing));
slider.addEventListener("input", () => {
  setPlaying(false);
  turns = Number(slider.value);
  draw();
});
for (const [id, direction] of [['previous', -1], ['next', 1]]) {
  document.querySelector(`#${id}`).addEventListener('click', () => {
    setPlaying(false);
    turns += direction / (60 * cycle);
    if (turns < 0) turns += 1;
    draw();
  });
}
document.addEventListener("visibilitychange", () => setPlaying(playing));
reduced.addEventListener("change", () => setPlaying(!reduced.matches));
mount();
setPlaying(playing);
