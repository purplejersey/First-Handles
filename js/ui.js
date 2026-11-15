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
