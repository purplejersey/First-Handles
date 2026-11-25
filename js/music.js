// Background music. One looping track for the whole app for now (Jon's "Jackie Moon",
// trimmed to start 5 s in). Later the drills can get their own track.
//
// - Tries to autoplay as soon as the app opens. Browsers only allow that on sites
//   the player uses often or installed apps; otherwise the music starts on the
//   first tap or key press (no website can force sound before that).
// - A small music button (top-right, every screen) turns it on/off; the choice
//   is saved on the device.
// - restartMusic() starts the track over (called when a drill ends).
// - Pauses while the tab is hidden.

import { isMusicOn, setMusicOn } from "./progress.js";

const SRC = new URL("../assets/audio/menu.mp3", import.meta.url).href;
const VOLUME = 0.45;

let audio = null;
let unlocked = false;   // the player has interacted, so playback is allowed
let button = null;

function track() {
  if (!audio) {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = VOLUME;
  }
  return audio;
}

function play() {
  if (!isMusicOn() || document.hidden) return;
  // Before the first tap this is an autoplay attempt: browsers allow it on sites
  // the player uses often (and on installed apps); otherwise it's refused and the
  // first tap or key press starts the music instead.
  track().play().then(() => { unlocked = true; }).catch(() => {});
}

/** Start the track over from the top (e.g. when a drill ends). */
export function restartMusic() {
  const a = track();
  a.currentTime = 0;
  play();
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
    if (document.hidden) audio?.pause();
    else play();
  });

  button = document.createElement("button");
  button.type = "button";
  button.className = "music-toggle";
  button.addEventListener("click", () => {
    const on = !isMusicOn();
    setMusicOn(on);
    if (on) play(); else audio?.pause();
    renderButton();
  });
  document.body.append(button);
  renderButton();
}
