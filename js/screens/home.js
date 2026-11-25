// Welcome / Home: greeting, player card, one big button.

import { getProfile, getTotals } from "../progress.js";
import { playerCard, mountPlayerCard } from "../components/playerCard.js";
import { escapeHtml, logo, wireNav, GEAR_SVG } from "../ui.js";

export function renderHome(root) {
  const profile = getProfile();
  root.innerHTML = `
    <section class="home">
      <div class="home__brand">${logo()}</div>
      <h1 class="greeting"><small>What's up,</small> ${escapeHtml(profile.name)}!</h1>
      ${playerCard(profile, getTotals())}
      <button class="btn-settings" data-go="#/edit">${GEAR_SVG}<span>Settings</span></button>
      <button class="btn btn-huge btn-cta" data-go="#/levels">Let's ball</button>
    </section>`;
  mountPlayerCard(root);
  wireNav(root);
}
