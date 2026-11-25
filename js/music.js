// Background music: two looping tracks by Jon (Suno, "johnnycito").
//   menu:  "Jackie Moon", trimmed to start 5 s in. Every screen except a running drill.
//   drill: "Nostalgia", trimmed to start 10 s in. From Start (3-2-1) until time's up.
//
// - Tries to autoplay as soon as the app opens. Browsers only allow that on sites
//   the player uses often or installed apps; otherwise the music starts on the
//   first tap or key press (no website can force sound before that).
// - A small music button (top-right, every screen) turns it on/off; the choice
//   is saved on the device.
// - setTrack(name, { restart }) switches tracks; restartMusic() = menu from the top
//   (called when a drill ends).
// - Pauses while the tab is hidden.

import { isMusicOn, setMusicOn } from "./progress.js";

const SRC = {
  menu: new URL("../assets/audio/menu.mp3", import.meta.url).href,
  drill: new URL("../assets/audio/drill.mp3", import.meta.url).href,
};
const VOLUME = { menu: 0.45, drill: 0.5 };

const tracks = {};
let current = "menu";
let unlocked = false;   // the player has interacted, so playback is allowed
let button = null;

function track(name = current) {
  if (!tracks[name]) {
    const a = new Audio(SRC[name]);
    a.loop = true;
    a.preload = name === "menu" ? "auto" : "metadata";
    a.volume = VOLUME[name];
    tracks[name] = a;
  }
  return tracks[name];
}

function play() {
  if (!isMusicOn() || document.hidden) return;
  // Before the first tap this is an autoplay attempt: browsers allow it on sites
  // the player uses often (and on installed apps); otherwise it's refused and the
  // first tap or key press starts the music instead.
  track().play().then(() => { unlocked = true; }).catch(() => {});
}

function pauseAll() {
  Object.values(tracks).forEach((a) => a.pause());
}

/** Switch to a track ("menu" | "drill"). restart: start it from the top. */
export function setTrack(name, { restart = false } = {}) {
  if (name !== current) {
    pauseAll();
    current = name;
  }
  if (restart) track().currentTime = 0;
  play();
}

/** The menu track from the top (called when a drill ends). */
export function restartMusic() {
  setTrack("menu", { restart: true });
}

/** Warm up the drill track so it starts instantly on Start. */
export function preloadDrillMusic() {
  track("drill").preload = "auto";
}

const ICON_ON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17.5a2.5 2.5 0 1 1-2.5-2.5c.53 0 1.02.16 1.5.43V5.5l11-2.5v11.5a2.5 2.5 0 1 1-2.5-2.5c.53 0 1.02.16 1.5.43V7.1l-9 2.05Z" fill="currentColor"/></svg>`;
const ICON_OFF = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17.5a2.5 2.5 0 1 1-2.5-2.5c.53 0 1.02.16 1.5.43V5.5l11-2.5v11.5a2.5 2.5 0 1 1-2.5-2.5c.53 0 1.02.16 1.5.43V7.1l-9 2.05Z" fill="currentColor" opacity="0.45"/><path d="M3.5 3.5l17 17" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;

function renderButton() {
  if (!button) return;
  const on = isMusicOn();
  button.setAttribute("aria-pressed", String(on));
  button.setAttribute("aria-label", on ? "Music on. Tap to turn it off" : "Music off. Tap to turn it on");
  button.title = on ? "Music: on" : "Music: off";
  button.innerHTML = on ? ICON_ON : ICON_OFF;
}

/** Call once at startup. */
export function initMusic() {
  const unlock = () => {
    unlocked = true;
    play();
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);

  play();                                            // try to autoplay right away

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseAll();
    else play();
  });

  button = document.createElement("button");
  button.type = "button";
  button.className = "music-toggle";
  button.addEventListener("click", () => {
    const on = !isMusicOn();
    setMusicOn(on);
    if (on) play(); else pauseAll();
    renderButton();
  });
  document.body.append(button);
  renderButton();
}
