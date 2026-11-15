// A level's step list (e.g. 1-1 to 1-6).

import { getLevel, isLevelUnlocked, isStepDone, isStepUnlocked } from "../progress.js";
import { levelList, wireList } from "../components/levelList.js";
import { go, handLabel, header, wireNav } from "../ui.js";

export function renderLevel(root, levelId) {
  const level = getLevel(levelId);
  if (!level || !level.steps.length || !isLevelUnlocked(level)) {
    go("#/levels");
    return;
  }

  const items = level.steps.map((step) => ({
    id: step.id,
    label: step.id,
    sublabel: `${handLabel(step.hand)} · ${step.seconds}s`,
    state: isStepDone(step.id) ? "done" : isStepUnlocked(step.id) ? "open" : "locked",
  }));

  root.innerHTML = `
    ${header(`Level ${level.id}: ${level.title}`, "#/levels")}
    <section class="stack">${levelList(items)}</section>`;

  wireList(root, (stepId) => go(`#/drill/${stepId}`));
  wireNav(root);
}
