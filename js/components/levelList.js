// Swappable layout for the Levels screen. Today: a simple scrolling list.
// A game-style path map can replace this file without touching the data.
// items: [{ id, label, sublabel, meta?, progress? (0..1), state: "open"|"done"|"locked" }]

import { escapeHtml } from "../ui.js";

const ICON = { open: "&#9654;", done: "&#10003;", locked: "&#128274;" };

export function levelList(items) {
  return `
    <ol class="tile-list">
      ${items.map((item) => `
        <li>
          <button class="tile tile--${item.state}" data-id="${escapeHtml(item.id)}"
            ${item.state === "locked" ? 'aria-disabled="true"' : ""}>
            <span class="tile__label">${escapeHtml(item.label)}</span>
            ${item.sublabel ? `<span class="tile__sub">${escapeHtml(item.sublabel)}</span>` : ""}
            ${item.meta ? `<span class="tile__meta">${escapeHtml(item.meta)}</span>` : ""}
            ${item.progress != null ? `<span class="tile__bar" aria-hidden="true"><i style="width:${Math.round(item.progress * 100)}%"></i></span>` : ""}
            <span class="tile__icon" aria-label="${item.state}">${ICON[item.state]}</span>
          </button>
        </li>`).join("")}
    </ol>`;
}

// Calls onSelect(id) for open/done tiles; locked tiles give a little shake.
export function wireList(root, onSelect) {
  root.querySelectorAll(".tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      if (tile.classList.contains("tile--locked")) {
        tile.classList.remove("shake");
        void tile.offsetWidth;
        tile.classList.add("shake");
        return;
      }
      onSelect(tile.dataset.id);
    });
  });
}
