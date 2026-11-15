// First-launch setup, also reused to edit the player card.

import { getProfile, setProfile, resetProgress } from "../progress.js";
import { SWATCHES } from "../data/swatches.js";
import { applyTheme } from "../theme.js";
import { escapeHtml, go, header, wireNav } from "../ui.js";

export function renderSetup(root, { editing }) {
  const existing = getProfile();
  const draft = {
    name: existing?.name || "",
    number: existing?.number ?? "",
    primary: existing?.primary || "purple",
    secondary: existing?.secondary || "gold",
  };

  const swatchRow = (field) => `
    <div class="swatches" role="radiogroup" aria-label="${field === "primary" ? "Main color" : "Accent color"}">
      ${SWATCHES.map((s) => `
        <button type="button" class="swatch" role="radio" data-field="${field}" data-id="${s.id}"
          style="--sw:${s.hex}" aria-label="${s.name}" title="${s.name}"></button>`).join("")}
    </div>`;

  root.innerHTML = `
    ${editing ? header("Edit player card", "#/home") : `<header class="topbar"><h1>Welcome to First Handles!</h1></header>`}
    <form class="setup stack" novalidate>
      ${editing ? "" : `<p class="lead">Let's make your player card.</p>`}
      <label class="field">
        <span>Your name</span>
        <input name="name" type="text" maxlength="16" autocomplete="off" required value="${escapeHtml(draft.name)}">
      </label>
      <label class="field">
        <span>Jersey number</span>
        <input name="number" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" required value="${escapeHtml(draft.number)}">
      </label>
      <fieldset class="field">
        <legend>Main team color</legend>
        ${swatchRow("primary")}
      </fieldset>
      <fieldset class="field">
        <legend>Accent color</legend>
        ${swatchRow("secondary")}
      </fieldset>
      <p class="form-error" role="alert" hidden></p>
      <button type="submit" class="btn btn-big">${editing ? "Save" : "Let's go!"}</button>
      ${editing ? `
        <div class="danger-zone">
          <button type="button" class="btn-link" data-reset>Reset progress</button>
        </div>` : ""}
    </form>`;

  const form = root.querySelector("form");
  const error = root.querySelector(".form-error");
  const numberInput = form.elements.number;

  // Keep the jersey number to digits only.
  numberInput.addEventListener("input", () => {
    numberInput.value = numberInput.value.replace(/\D/g, "").slice(0, 2);
  });

  function refreshSwatches() {
    root.querySelectorAll(".swatch").forEach((btn) => {
      const field = btn.dataset.field;
      const selected = draft[field] === btn.dataset.id;
      const other = field === "primary" ? draft.secondary : draft.primary;
      btn.setAttribute("aria-checked", String(selected));
      // Same color for both would hide the buttons, so it's not allowed.
      btn.disabled = btn.dataset.id === other;
    });
    applyTheme(draft); // live preview
  }

  root.querySelectorAll(".swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      draft[btn.dataset.field] = btn.dataset.id;
      refreshSwatches();
    });
  });
  refreshSwatches();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const number = numberInput.value.trim();
    if (!name) return showError("Type your name first.", form.elements.name);
    if (!number) return showError("Pick a jersey number.", numberInput);
    setProfile({ name, number, primary: draft.primary, secondary: draft.secondary });
    go("#/home");
  });

  function showError(message, input) {
    error.textContent = message;
    error.hidden = false;
    input.focus();
  }

  // Two-tap reset, no pop-up dialog.
  const reset = root.querySelector("[data-reset]");
  if (reset) {
    let armed = false;
    reset.addEventListener("click", () => {
      if (!armed) {
        armed = true;
        reset.textContent = "Tap again to erase all progress";
        reset.classList.add("armed");
        return;
      }
      resetProgress();
      reset.textContent = "Progress erased";
      reset.disabled = true;
    });
  }

  wireNav(root);
}
