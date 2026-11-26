// Game-style title screen ("Tap to play") shown once each time the app opens.
// Its tap also starts the music (browsers need a tap before sound can play).

import { playMusic } from "../music.js";
import { logo } from "../ui.js";

const SEEN = "firstHandles.titleSeen";

export function showTitleScreen() {
  try { if (sessionStorage.getItem(SEEN)) return; } catch { /* storage blocked: show it */ }
  const el = document.createElement("div");
  el.className = "title-screen";
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.setAttribute("aria-label", "First Handles. Tap to play");
  el.innerHTML = `
    <div class="title-screen__court" aria-hidden="true"></div>
    <div class="title-screen__inner">
      ${logo("logo--xl")}
      <p class="title-screen__tag">Dribble training</p>
      <p class="title-screen__tap">Tap to play</p>
    </div>`;
  document.body.append(el);
  el.focus();
  const close = () => {
    if (el.classList.contains("is-leaving")) return;
    el.classList.add("is-leaving");
    playMusic();
    try { sessionStorage.setItem(SEEN, "1"); } catch { /* ignore */ }
    setTimeout(() => el.remove(), 380);
  };
  el.addEventListener("click", close);
  el.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      close();
    }
  });
}
