// "Nice work!" screen after every step. Stays until he picks:
// Next step / Retry / Back. Completion was already saved on Done.
// Post-drill review: he taps the stars he earned (honor system). Saved on tap;
// the best per step is kept and never goes down.

import { findStep, getProfile, getStars, isStepDone, setStars } from "../progress.js";
import { DRILL_TIPS } from "../data/levels.js";
import { showCelebration } from "../components/celebration.js";
import { escapeHtml, go, wireNav } from "../ui.js";

let pending = null;

export function starString(n) {
  return "\u2605".repeat(n) + "\u2606".repeat(3 - n);
}
export function setPendingResult(result) { pending = result; }

export function renderNiceWork(root, stepId) {
  const found = findStep(stepId);
  if (!found || !isStepDone(stepId)) {
    go("#/levels");
    return;
  }
  const { level, step, index } = found;
  const next = level.steps[index + 1];
  const isLast = !next;
  const profile = getProfile();

  root.innerHTML = `
    <section class="nicework stack center">
      <div class="bcast" aria-hidden="false">
        <div class="bcast__band">
          <span class="bcast__kicker">Step ${escapeHtml(step.id)} complete</span>
          <h1 class="bcast__title">Nice work!</h1>
        </div>
        <div class="bcast__tag"><b>#${escapeHtml(profile.number ?? "")}</b> ${escapeHtml(profile.name)}</div>
      </div>
      <div class="nicework__body">
      ${reviewHtml(step)}
      <div class="stack actions">
        ${next ? `<button class="btn btn-huge" data-go="#/drill/${next.id}">Next step</button>` : ""}
        <div class="actions__row">
          <button class="btn btn-big btn-quiet" data-go="#/drill/${step.id}">Retry</button>
          <button class="btn btn-big btn-quiet" data-go="${isLast ? "#/levels" : `#/level/${level.id}`}">Back</button>
        </div>
      </div>
      </div>
    </section>`;
  wireNav(root);
  wireReview(root, step);

  // Celebrate only right after Done (not on a page reload).
  if (pending && pending.stepId === stepId) {
    const result = pending;
    pending = null;
    if (result.levelJustCompleted) {
      showCelebration({ kind: "level", title: `Level ${level.id} Complete!` });
    } else {
      showCelebration({ kind: "step", title: "Step complete!" });
    }
  }
}

// ---------- post-drill review ----------
function reviewHtml(step) {
  const challenges = DRILL_TIPS[step.drill]?.stars || {};
  const options = [
    { n: 1, text: "Finished the time" },
    { n: 2, text: challenges[2] },
    { n: 3, text: challenges[3] },
  ].filter((o) => o.text);
  return `
    <div class="review">
      <h2 class="review__title">How did it go?</h2>
      <p class="review__hint">Tap the stars you earned</p>
      <div class="review__options" role="radiogroup" aria-label="Stars earned">
        ${options.map((o) => `
          <button class="star-opt" role="radio" aria-checked="${o.n === 1}" data-stars="${o.n}">
            <span class="star-opt__stars" aria-hidden="true">${starString(o.n)}</span>
            <span class="star-opt__text">${escapeHtml(o.text)}</span>
          </button>`).join("")}
      </div>
      <p class="review__best" aria-live="polite"></p>
    </div>`;
}

function wireReview(root, step) {
  const best = root.querySelector(".review__best");
  const showBest = () => { best.textContent = `Your best: ${starString(getStars(step.id))}`; };
  root.querySelectorAll(".star-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      root.querySelectorAll(".star-opt").forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
      setStars(step.id, btn.dataset.stars);
      showBest();
    });
  });
  showBest();
}
