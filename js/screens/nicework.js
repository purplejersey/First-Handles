// "Nice work!" screen after every step. Stays until he picks:
// Next step / Retry / Back. Completion was already saved on Done.

import { findStep, getProfile, isStepDone } from "../progress.js";
import { showCelebration } from "../components/celebration.js";
import { escapeHtml, go, wireNav } from "../ui.js";

let pending = null;
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
      <div class="badge" aria-hidden="true">&#10003;</div>
      <h1>Nice work, ${escapeHtml(profile.name)}!</h1>
      <p class="lead">Step ${escapeHtml(step.id)} complete.</p>
      <div class="stack actions">
        ${next ? `<button class="btn btn-huge" data-go="#/drill/${next.id}">Next step</button>` : ""}
        <button class="btn btn-big btn-quiet" data-go="#/drill/${step.id}">Retry</button>
        <button class="btn btn-big btn-quiet" data-go="${isLast ? "#/levels" : `#/level/${level.id}`}">Back</button>
      </div>
    </section>`;
  wireNav(root);

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
