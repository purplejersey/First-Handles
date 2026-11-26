// Drill flow: tutorial loops with tips -> Start -> 3-2-1 -> timer runs next
// to the looping animation -> timer ends -> Done. "Lost it" (any time, even
// right at the end) pauses until he taps "I'm ready", then restarts in full.

import { restartMusic, setTrack, preloadDrillMusic } from "../music.js";
import { DRILLS, DRILL_TIPS } from "../data/levels.js";
import { completeStep, findStep, getProfile, isDevMode, isMusicOn, isStepUnlocked } from "../progress.js";
import { drillAnimation, mountDrillAnimation } from "../components/drillAnimation.js";
import { setPendingResult } from "./nicework.js";
import { escapeHtml, go, handLabel, header, wireNav } from "../ui.js";

function createCountdownSound() {
  let context;
  return {
    prepare() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass || !isMusicOn()) return;
      try {
        context ??= new AudioContextClass();
        context.resume().catch(() => {});
      } catch {
        // Keep the visual countdown available if Web Audio is disabled.
      }
    },
    tick(number) {
      if (!context || !isMusicOn() || document.hidden) return;
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = [0, 880, 700, 560][number];
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(0.22, now + 0.009);
      envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      oscillator.connect(envelope);
      envelope.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.19);
    },
    destroy() {
      context?.close().catch(() => {});
    }
  };
}

export function renderDrill(root, stepId) {
  const found = findStep(stepId);
  if (!found || !isStepUnlocked(stepId)) {
    go("#/levels");
    return;
  }
  const { level, step } = found;
  const tips = DRILL_TIPS[step.drill]?.key || [];

  root.innerHTML = `
    ${header(`${step.id} · ${level.title.split("–").at(-1).trim()} · ${handLabel(step.hand)}`, `#/level/${level.id}`, "topbar--drill")}
    <section class="drill" data-phase="intro">
      <div class="drill__stage">${drillAnimation({ drill: step.drill, hand: step.hand, view: DRILLS[step.drill]?.view || "mirror", number: getProfile()?.number ?? "", closeFrame: true })}
        <div class="court-hud"><span>Copy with your ${handLabel(step.hand).toLowerCase()}</span>
          <button type="button" class="court-speed" data-act="slow" aria-pressed="false" aria-label="Half-speed demonstration">½×</button>
        </div>${isDevMode() ? `<button class="dev-skip" data-act="skip" title="Developer mode: jump to time's up">Skip &#9197;</button>` : ""}
        <div class="countdown" aria-live="assertive"></div>
      </div>
      <div class="drill__panel">
        <div class="timer" aria-live="off">
          <span class="timer__label"></span>
          <span class="timer__value">${step.seconds}</span>
        </div>
        <div class="drill__actions">
          <p id="practice-duration" class="practice-duration">${step.seconds}-second set</p>
          <button class="btn btn-huge practice-start" data-act="start" aria-describedby="practice-duration">Start drill</button>
          <button class="btn btn-huge" data-act="ready">I'm ready</button>
          <button class="btn btn-huge btn-done" data-act="done">Done</button>
          <button class="btn btn-huge btn-lost" data-act="lost">Lost it</button>
        </div>
        ${tips.length ? `<details class="practice-tips">
          <summary>Dribble tips</summary>
          <ul class="tips">${tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul>
        </details>` : ""}
      </div>
    </section>`;

  const section = root.querySelector(".drill");
  const value = root.querySelector(".timer__value");
  const label = root.querySelector(".timer__label");
  const countdown = root.querySelector(".countdown");
  let timers = [];
  let wakeLock = null;
  const anim = mountDrillAnimation(root.querySelector(".drill__stage"));
  const countdownSound = createCountdownSound();
  anim.setPhase("intro");
  const slow = root.querySelector('[data-act="slow"]');
  slow.addEventListener("click", () => {
    const enabled = slow.getAttribute("aria-pressed") === "false";
    slow.setAttribute("aria-pressed", String(enabled));
    anim.setSpeed(enabled ? 0.5 : 1);
  });

  // The animation follows the drill phase (loops, or freezes in the stance).
  const setPhase = (phase) => { section.dataset.phase = phase; anim.setPhase(phase); };
  const clearTimers = () => { timers.forEach(clearInterval); timers = []; };

  function startCountdown() {
    clearTimers();
    setTrack(null);
    countdownSound.prepare();
    setPhase("countdown");
    value.textContent = step.seconds;
    label.textContent = "Get ready";
    keepAwake();
    let n = 3;
    const show = (text) => {
      countdown.textContent = text;
      if (typeof text === "number") countdownSound.tick(text);
    };
    show(n);
    timers.push(setInterval(() => {
      n -= 1;
      if (n > 0) {
        show(n);
      } else {
        show("GO!");
        setTimeout(() => { if (countdown.textContent === "GO!") countdown.textContent = ""; }, 650);
        startTimer();
      }
    }, 1000));
  }

  function startTimer() {
    clearTimers();
    setPhase("running");
    label.textContent = "Time left";
    const end = performance.now() + step.seconds * 1000;
    setTrack("drill", { restart: true });
    timers.push(setInterval(() => {
      const left = Math.max(0, Math.ceil((end - performance.now()) / 1000));
      value.textContent = left;
      if (left <= 0) finish();
    }, 100));
  }

  function finish() {
    clearTimers();
    setPhase("finished");
    restartMusic();                                  // menu track from the top each time a drill ends
    label.textContent = "Time’s up";
    value.textContent = "0";
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
    setTrack(null);
    countdown.textContent = "";
    setPhase("paused");
    label.textContent = "Reset your stance";
    value.textContent = step.seconds;
    releaseAwake();
    root.querySelector('[data-act="ready"]').focus();
  }

  preloadDrillMusic();
  root.querySelector('[data-act="start"]').addEventListener("click", () => {
    slow.setAttribute("aria-pressed", "false");
    anim.setSpeed(1);
    startCountdown();
  });
  root.querySelector('[data-act="lost"]').addEventListener("click", pause);
  root.querySelector('[data-act="ready"]').addEventListener("click", startCountdown);
  root.querySelector('[data-act="done"]').addEventListener("click", () => {
    // Saved right here, the moment Done is tapped.
    setPendingResult(completeStep(step.id));
    go(`#/done/${step.id}`);
  });

  // Developer mode only: jump straight to "time's up" (he still taps Done).
  root.querySelector('[data-act="skip"]')?.addEventListener("click", () => {
    countdown.textContent = "";
    finish();
  });

  wireNav(root);

  return () => { clearTimers(); releaseAwake(); anim.destroy(); countdownSound.destroy(); setTrack("menu"); };
}
