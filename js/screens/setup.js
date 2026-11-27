// First-launch setup, also reused to edit the player card.

import { getProfile, setProfile, resetProgress, isDevMode, setDevMode } from "../progress.js";
import { SWATCHES } from "../data/swatches.js";
import { applyTheme } from "../theme.js";
import { playerCard, mountPlayerCard, updatePlayerCard } from "../components/playerCard.js";
import { escapeHtml, go, header, wireNav } from "../ui.js";

const RESET_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z"/></svg>`;

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
    ${editing ? header("Player Studio", "#/home") : `<header class="topbar"><h1>Create your player</h1></header>`}
    <form class="setup studio" novalidate>
      ${editing ? "" : `<p class="lead">Your player wears these colors on the court.</p>`}
      <div class="setup-preview">${playerCard(draft)}</div>
      <div class="setup-controls">
        <section class="panel">
          <h2 class="panel__title">Player</h2>
          <div class="field-row">
            <label class="field field--grow">
              <span>Name</span>
              <input name="name" type="text" maxlength="16" autocomplete="off" required value="${escapeHtml(draft.name)}">
            </label>
            <label class="field field--num">
              <span>Number</span>
              <input name="number" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" required value="${escapeHtml(draft.number)}">
            </label>
          </div>
        </section>
        <section class="panel">
          <h2 class="panel__title">Team colors</h2>
          <fieldset class="field">
            <legend>Jersey</legend>
            ${swatchRow("primary")}
          </fieldset>
          <fieldset class="field">
            <legend>Accent</legend>
            ${swatchRow("secondary")}
          </fieldset>
        </section>
        <p class="form-error" role="alert" hidden></p>
        <button type="submit" class="btn btn-big setup-save">${editing ? "Save player" : "Enter the court"}</button>
        ${editing ? `
          <section class="panel panel--quiet">
            <h2 class="panel__title">More</h2>
            <div class="setting-row">
              <div class="setting-row__text">
                <span class="setting-row__label">Developer mode</span>
                <span class="setting-row__hint">Open any playable level or drill and skip drill timers</span>
              </div>
              <button type="button" class="switch" role="switch" data-dev aria-checked="${isDevMode()}" aria-label="Developer mode">
                <span class="switch__knob"></span>
              </button>
            </div>
            <div class="setting-row">
              <div class="setting-row__text">
                <span class="setting-row__label">Reset progress</span>
                <span class="setting-row__hint" data-reset-hint>Erases all steps and stars. Player card stays.</span>
              </div>
              <button type="button" class="btn-danger" data-reset>${RESET_ICON}<span>Reset</span></button>
            </div>
          </section>` : ""}
      </div>
    </form>`;

  const form = root.querySelector("form");
  const error = root.querySelector(".form-error");
  const numberInput = form.elements.number;

  // Keep the jersey number to digits only.
  numberInput.addEventListener("input", () => {
    numberInput.value = numberInput.value.replace(/\D/g, "").slice(0, 2);
    draft.number = numberInput.value;
    updatePlayerCard(root, draft);                   // live preview
  });
  form.elements.name.addEventListener("input", () => {
    draft.name = form.elements.name.value.trim();
    updatePlayerCard(root, draft);
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
    mountPlayerCard(root);                           // card jersey in the new colors
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
      const label = reset.querySelector("span");
      const hint = root.querySelector("[data-reset-hint]");
      if (!armed) {
        armed = true;
        label.textContent = "Tap to confirm";
        hint.textContent = "Tap again to erase all progress.";
        reset.classList.add("armed");
        return;
      }
      resetProgress();
      label.textContent = "Erased";
      hint.textContent = "Progress erased.";
      reset.classList.remove("armed");
      reset.disabled = true;
    });
  }

  // Developer mode: adds a Skip button on drills for testing progression.
  const dev = root.querySelector("[data-dev]");
  if (dev) {
    dev.addEventListener("click", () => {
      const on = !isDevMode();
      setDevMode(on);
      dev.setAttribute("aria-checked", String(on));
    });
  }

  wireNav(root);
}
