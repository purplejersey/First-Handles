// Levels screen, generated from the data file.

import { LEVELS } from "../data/levels.js";
import { isLevelUnlocked, isLevelComplete } from "../progress.js";
import { levelList, wireList } from "../components/levelList.js";
import { showToast } from "../components/toast.js";
import { go, header, wireNav } from "../ui.js";

export function renderLevels(root) {
  const items = LEVELS.map((level) => {
    const unlocked = isLevelUnlocked(level);
    const hasContent = level.steps.length > 0;
    return {
      id: String(level.id),
      label: `Level ${level.id}`,
      sublabel: unlocked ? (hasContent ? level.title : "Coming soon") : "",
      state: !unlocked ? "locked" : isLevelComplete(level) ? "done" : "open",
    };
  });

  root.innerHTML = `
    ${header("Levels", "#/home")}
    <section class="stack">${levelList(items)}</section>`;

  wireList(root, (id) => {
    const level = LEVELS.find((l) => String(l.id) === id);
    if (!level.steps.length) return showToast("Coming soon!");
    go(`#/level/${id}`);
  });
  wireNav(root);
}
