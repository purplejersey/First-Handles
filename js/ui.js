// Small DOM helpers shared by the screens.

export function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function go(route) {
  location.hash = route;
}

export function handLabel(hand) {
  return hand === "left" ? "Left hand" : "Right hand";
}

// Screen header with an optional back button.
export function header(title, backRoute) {
  const back = backRoute
    ? `<button class="btn-back" data-go="${backRoute}" aria-label="Back">&larr; Back</button>`
    : "";
  return `<header class="topbar">${back}<h1>${escapeHtml(title)}</h1></header>`;
}

// Any element with data-go="#/route" navigates when tapped.
export function wireNav(root) {
  root.querySelectorAll("[data-go]").forEach((node) => {
    node.addEventListener("click", () => go(node.dataset.go));
  });
}

// The game's wordmark (type only, styled in CSS).
export function logo(size = "") {
  return `<span class="logo ${size}" aria-label="First Handles">${BALL_SVG}<span class="logo__a">First</span><span class="logo__b">Handles</span></span>`;
}

// Basketball icon: orange ball with the real seam layout (horizontal + vertical
// seams and the two curved side seams), soft shading and a highlight.
const BALL_SVG = `<svg class="logo__ball" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="lb-fill" cx="0.36" cy="0.32" r="0.75">
      <stop offset="0" stop-color="#ffa05a"/><stop offset="0.55" stop-color="#e8692a"/><stop offset="1" stop-color="#a63d12"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="46" fill="url(#lb-fill)"/>
  <g fill="none" stroke="#2a130a" stroke-width="4.5" stroke-linecap="round">
    <path d="M4 50 H96"/>
    <path d="M50 4 V96"/>
    <path d="M19 15 C34 32 34 68 19 85"/>
    <path d="M81 15 C66 32 66 68 81 85"/>
  </g>
  <ellipse cx="35" cy="28" rx="13" ry="7" fill="#fff" opacity="0.25" transform="rotate(-30 35 28)"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="#2a130a" stroke-width="4"/>
</svg>`;

// Gear icon for the Settings button.
export const GEAR_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"/></svg>`;
