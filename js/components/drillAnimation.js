// PLACEHOLDER drill animation. Chunk C swaps this file for the real avatar
// engine; keep the same function signature: drillAnimation({ drill, hand }).
// Front view, mirrored: his left hand shows on the left of the screen.

export function drillAnimation({ drill, hand }) {
  return `
    <div class="anim anim--${hand}" role="img"
      aria-label="Placeholder animation: ${hand} hand ${drill.replace(/-/g, " ")}">
      <div class="anim__player" aria-hidden="true">
        <div class="anim__head"></div>
        <div class="anim__body"></div>
      </div>
      <div class="anim__ball" aria-hidden="true"></div>
      <div class="anim__floor" aria-hidden="true"></div>
      <span class="anim__tag">Animation coming soon</span>
    </div>`;
}
