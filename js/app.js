// Router: turns the URL hash into a screen.
// #/setup  #/edit  #/home  #/levels  #/level/1  #/drill/1-1  #/done/1-1

import { getProfile } from "./progress.js";
import { applyTheme } from "./theme.js";
import { renderSetup } from "./screens/setup.js";
import { renderHome } from "./screens/home.js";
import { renderLevels } from "./screens/levels.js";
import { renderLevel } from "./screens/level.js";
import { renderDrill } from "./screens/drill.js";
import { renderNiceWork } from "./screens/nicework.js";
import { initMusic } from "./music.js";
import { showTitleScreen } from "./components/titleScreen.js";

const app = document.getElementById("app");
let cleanup = null;

function route() {
  if (cleanup) { cleanup(); cleanup = null; }
  document.getElementById("overlay-root").innerHTML = "";

  const profile = getProfile();
  applyTheme(profile);

  const [name, arg] = location.hash.replace(/^#\/?/, "").split("/");

  if (!profile && name !== "setup") {
    location.replace("#/setup");
    return;
  }

  const screens = {
    setup: () => renderSetup(app, { editing: false }),
    edit: () => renderSetup(app, { editing: true }),
    home: () => renderHome(app),
    levels: () => renderLevels(app),
    level: () => renderLevel(app, arg),
    drill: () => renderDrill(app, arg),
    done: () => renderNiceWork(app, arg),
  };

  const render = screens[name];
  if (!render) {
    location.replace(profile ? "#/home" : "#/setup");
    return;
  }
  cleanup = render() || null;
  app.classList.remove("screen-in"); void app.offsetWidth; app.classList.add("screen-in");
  window.scrollTo(0, 0);
  const heading = app.querySelector("h1, h2");
  if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
}

// A browser can reopen a saved map URL. Start a new page load at the
// player card, while keeping map navigation and direct drill links usable.
if (getProfile() && /^#\/?(?:levels|level\/[^/]+)\/?$/.test(location.hash)) {
  history.replaceState(history.state, "", "#/home");
}
window.addEventListener("hashchange", route);
route();
showTitleScreen();
initMusic();
