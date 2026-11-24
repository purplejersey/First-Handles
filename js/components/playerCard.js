// Player card: his illustrated portrait in the team colors, with his number
// drawn live on the jersey and his name underneath. The same colors and number
// carry into the drill animation.
//
// playerCard(profile) returns the markup; mountPlayerCard(root) paints the
// jersey in the current team colors (async the first time, then cached).

import { escapeHtml } from "../ui.js";
import { recolorImage, teamColors } from "./recolor.js";
import { jerseyNumberSVG } from "./jerseyNumber.js";

const ASSET = (name) => new URL(`../../assets/avatar/${name}.webp`, import.meta.url).href;
// From the portrait prep script: the art's fabric tones, and the number's box on
// the jersey's front panel (in the portrait's 1024 x 1536 source pixels).
const PORTRAIT_REF = { jersey: 33.95, trim: 207.77 };
const NUMBER_BOX = { cx: 533, cy: 534, height: 128, maxWidth: 138 };
let cardIds = 0;

// The number is printed on the fabric: clipped to the jersey's front panel (never
// over the trim or his arm) and multiplied by the fabric's own folds.
function numberLayer(number, id) {
  const glyphs = jerseyNumberSVG(number, NUMBER_BOX);
  return `
    <defs>
      <mask id="fh-chest-${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536">
        <image href="${ASSET("portrait_chest")}" width="1024" height="1536" preserveAspectRatio="none"/>
      </mask>
      <mask id="fh-num-${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536">
        <g class="player-card__num-shape" style="--jersey-trim:#fff" filter="none">${glyphs}</g>
      </mask>
    </defs>
    <g mask="url(#fh-chest-${id})">
      <g class="player-card__num-art">${glyphs}</g>
      <image href="${ASSET("portrait_shade")}" width="1024" height="1536" preserveAspectRatio="none"
        mask="url(#fh-num-${id})" style="mix-blend-mode:multiply"/>
    </g>`;
}

export function playerCard(profile) {
  const name = profile?.name ? escapeHtml(profile.name) : "";
  const number = escapeHtml(String(profile?.number ?? "").slice(0, 2));
  return `
    <div class="player-card" aria-label="Player card: ${name || "player"}${number ? `, number ${number}` : ""}">
      <div class="player-card__avatar" aria-hidden="true">
        <img class="player-card__portrait" src="${ASSET("portrait")}" alt="" draggable="false">
        <svg class="player-card__number" viewBox="0 0 1024 1536" preserveAspectRatio="xMidYMid meet"
          data-id="${++cardIds}" focusable="false">${numberLayer(number, cardIds)}</svg>
      </div>
      <div class="player-card__name">${name}</div>
    </div>`;
}

/** Paint the portrait's jersey and trim in the current team colors. */
export function mountPlayerCard(root, colors = teamColors()) {
  const img = root.querySelector(".player-card__portrait");
  if (!img) return Promise.resolve();
  const want = `${colors.jersey}|${colors.trim}`;
  img.dataset.want = want;
  return recolorImage(ASSET("portrait"), ASSET("portrait_mask"), colors.jersey, colors.trim, PORTRAIT_REF)
    .then((url) => { if (img.dataset.want === want) img.src = url; })   // ignore stale results
    .catch(() => {});
}

/** Update the live preview (number + name) without rebuilding the card. */
export function updatePlayerCard(root, profile) {
  const num = root.querySelector(".player-card__number");
  const name = root.querySelector(".player-card__name");
  const digits = String(profile?.number ?? "").slice(0, 2);
  if (num) num.innerHTML = numberLayer(digits, num.dataset.id);
  if (name) name.textContent = profile?.name || "";
}
