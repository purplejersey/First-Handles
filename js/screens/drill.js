// Drill flow: tutorial loops with tips -> Start -> 3-2-1 -> timer runs next
// to the looping animation -> timer ends -> Done. "Lost it" (any time, even
// right at the end) pauses until he taps "I'm ready", then restarts in full.

import { DRILLS, DRILL_TIPS } from "../data/levels.js";
import { completeStep, findStep, getProfile, isDevMode, isStepUnlocked } from "../progress.js";
import { drillAnimation, mountDrillAnimation } from "../components/drillAnimation.js";
import { setPendingResult } from "./nicework.js";
import { escapeHtml, go, handLabel, header, wireNav } from "../ui.js";

export function renderDrill(root, stepId) {
  const found = findStep(stepId);
  if (!found || !isStepUnlocked(stepId)) {
    go("#/levels");
    return;
  }
  const { level, step } = found;
  const tips = DRILL_TIPS[step.drill]?.key || [];

  root.innerHTML = `
    ${header(`${step.id} · ${handLabel(step.hand)}`, `#/level/${level.id}`)}
    <section class="drill" data-phase="intro">
      <div class="drill__stage">${drillAnimation({ drill: step.drill, hand: step.hand, view: DRILLS[step.drill]?.view || "mirror", number: getProfile()?.number ?? "" })}${isDevMode() ? `<button class="dev-skip" data-act="skip" title="Developer mode: jump to time's up">Skip &#9197;</button>` : ""}</div>
      <div class="drill__panel">
        <ul class="tips">${tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
        <div class="timer" aria-live="off">
          <span class="timer__label">Dribble for</span>
          <span class="timer__value">${step.seconds}</span>
          <span class="timer__unit">seconds</span>
        </div>
        <div class="drill__actions">
          <button class="btn btn-huge" data-act="start">Start</button>
          <button class="btn btn-huge" data-act="ready">I'm ready</button>
          <button class="btn btn-huge btn-done" data-act="done">Done</button>
          <button class="btn btn-huge btn-lost" data-act="lost">Lost it</button>
        </div>
      </div>
      <div class="countdown" aria-live="assertive"></div>
    </section>`;

  const section = root.querySelector(".drill");
  const value = root.querySelector(".timer__value");
  const label = root.querySelector(".timer__label");
  const unit = root.querySelector(".timer__unit");
  const countdown = root.querySelector(".countdown");
  let timers = [];
  let wakeLock = null;
  const anim = mountDrillAnimation(root.querySelector(".drill__stage"));
  anim.setPhase("intro");

  // The animation follows the drill phase (loops, or freezes in the stance).
  const setPhase = (phase) => { section.dataset.phase = phase; anim.setPhase(phase); };
  const clearTimers = () => { timers.forEach(clearInterval); timers = []; };

  function startCountdown() {
    clearTimers();
    setPhase("countdown");
    value.textContent = step.seconds;
    label.textContent = "Get ready";
    keepAwake();
    let n = 3;
    countdown.textContent = n;
    timers.push(setInterval(() => {
      n -= 1;
      if (n > 0) {
        countdown.textContent = n;
      } else {
        countdown.textContent = "";
        startTimer();
      }
    }, 1000));
  }

  function startTimer() {
    clearTimers();
    setPhase("running");
    label.textContent = "Go!";
    const end = performance.now() + step.seconds * 1000;
    timers.push(setInterval(() => {
      const left = Math.max(0, Math.ceil((end - performance.now()) / 1000));
      value.textContent = left;
      if (left <= 0) finish();
    }, 100));
  }

  function finish() {
    clearTimers();
    setPhase("finished");
    label.textContent = "Time!";
    value.textContent = "0";
    unit.textContent = "Kept it the whole time? Tap Done";
    releaseAwake();
    root.querySelector('[data-act="done"]').focus();
  }

  async function keepAwake() {
    try { wakeLock = await navigator.wakeLock?.request("screen"); } catch { wakeLock = null; }
  }
  function releaseAwake() {
    try { wakeLock?.release(); } catch { /* ignore */ }
    wakeLock = null;
  }

  // Lost it: stop and wait until he says he's ready (timer restarts in full).
  function pause() {
    clearTimers();
    countdown.textContent = "";
    setPhase("paused");
    label.textContent = "No problem!";
    value.textContent = step.seconds;
    unit.textContent = "Get the ball, then tap I'm ready";
    releaseAwake();
    root.querySelector('[data-act="ready"]').focus();
  }

  root.querySelector('[data-act="start"]').addEventListener("click", startCountdown);
  root.querySelector('[data-act="lost"]').addEventListener("click", pause);
  root.querySelector('[data-act="ready"]').addEventListener("click", () => {
    unit.textContent = "seconds";
    startCountdown();
  });
  root.querySelector('[data-act="done"]').addEventListener("click", () => {
    // Saved right here, the moment Done is tapped.
    setPendingResult(completeStep(step.id));
    go(`#/done/${step.id}`);
  });

  // Developer mode only: jump straight to "time's up" (he still taps Done).
  root.querySelector('[data-act="skip"]')?.addEventListener("click", () => {
    countdown.textContent = "";
    unit.textContent = "seconds";
    finish();
  });

  wireNav(root);

  return () => { clearTimers(); releaseAwake(); anim.destroy(); };
}
