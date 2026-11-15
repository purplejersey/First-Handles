// Player card. Placeholder look; the avatar will sit in the card later.

import { escapeHtml } from "../ui.js";

export function playerCard(profile) {
  return `
    <div class="player-card" aria-label="Player card: ${escapeHtml(profile.name)}, number ${escapeHtml(profile.number)}">
      <div class="player-card__avatar" aria-hidden="true">
        <span class="player-card__number">${escapeHtml(profile.number)}</span>
      </div>
      <div class="player-card__name">${escapeHtml(profile.name)}</div>
    </div>`;
}
