// PLACEHOLDER celebration pop-up, built to be swapped out later
// (animated, progressive, bigger for bigger milestones).
// kind: "step" | "level"   ->  returns a Promise that resolves when closed.

export function showCelebration({ kind, title }) {
  return new Promise((resolve) => {
    const root = document.getElementById("overlay-root");
    const pop = document.createElement("div");
    pop.className = `celebrate celebrate--${kind}`;
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-modal", "true");
    pop.setAttribute("aria-label", title);
    pop.innerHTML = `
      <div class="celebrate__band">
        <div class="celebrate__art" aria-hidden="true">${kind === "level" ? "&#127942;" : "&#11088;"}</div>
        <h2 class="celebrate__title">${title}</h2>
        <button class="btn btn-big">${kind === "level" ? "Let's go!" : "Yes!"}</button>
      </div>`;
    root.appendChild(pop);
    const btn = pop.querySelector("button");
    btn.focus();

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      pop.remove();
      resolve();
    };
    btn.addEventListener("click", close);
    pop.addEventListener("click", (e) => { if (e.target === pop) close(); });
    pop.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    // Small step pop-ups tidy themselves away; level ones wait for a tap.
    if (kind === "step") setTimeout(close, 1600);
  });
}
