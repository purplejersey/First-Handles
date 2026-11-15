// Welcome / Home: greeting, player card, one big button.

import { getProfile } from "../progress.js";
import { playerCard } from "../components/playerCard.js";
import { escapeHtml, wireNav } from "../ui.js";

export function renderHome(root) {
  const profile = getProfile();
  root.innerHTML = `
    <section class="home stack center">
      <h1 class="greeting">Hey ${escapeHtml(profile.name)}!</h1>
      ${playerCard(profile)}
      <button class="btn-link" data-go="#/edit">Edit player card</button>
      <button class="btn btn-huge" data-go="#/levels">Start Training</button>
    </section>`;
  wireNav(root);
}
