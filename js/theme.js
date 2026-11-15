// Team colors become CSS variables. The avatar's jersey and ball will read
// the same variables later, ready for the customization module.

import { swatchById } from "./data/swatches.js";

const DEFAULT = { primary: "purple", secondary: "gold" };

export function applyTheme(profile) {
  const primary = swatchById(profile?.primary || DEFAULT.primary);
  const secondary = swatchById(profile?.secondary || DEFAULT.secondary);
  const root = document.documentElement.style;
  root.setProperty("--primary", primary.hex);
  root.setProperty("--primary-ink", primary.ink);
  root.setProperty("--secondary", secondary.hex);
  root.setProperty("--secondary-ink", secondary.ink);
  root.setProperty("--jersey", primary.hex);
  root.setProperty("--jersey-trim", secondary.hex);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", primary.hex);
}
