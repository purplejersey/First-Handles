// Preset team colors. `ink` is the text color that stays readable on top.
// The full custom picker arrives with the customization module.

export const SWATCHES = [
  { id: "purple", name: "Purple",       hex: "#4B2E83", ink: "#FFFFFF" },
  { id: "gold",   name: "Gold",         hex: "#FDB927", ink: "#111111" },
  { id: "neon",   name: "Neon Yellow",  hex: "#D9FF1F", ink: "#111111" },
  { id: "royal",  name: "Royal Blue",   hex: "#1D4ED8", ink: "#FFFFFF" },
  { id: "navy",   name: "Navy",         hex: "#1E2A4A", ink: "#FFFFFF" },
  { id: "sky",    name: "Sky Blue",     hex: "#7CB8F2", ink: "#111111" },
  { id: "red",    name: "Red",          hex: "#C8102E", ink: "#FFFFFF" },
  { id: "maroon", name: "Maroon",       hex: "#7A1E2C", ink: "#FFFFFF" },
  { id: "orange", name: "Orange",       hex: "#F97316", ink: "#111111" },
  { id: "green",  name: "Forest Green", hex: "#1B5E20", ink: "#FFFFFF" },
  { id: "teal",   name: "Teal",         hex: "#0F766E", ink: "#FFFFFF" },
  { id: "black",  name: "Black",        hex: "#141414", ink: "#FFFFFF" },
  { id: "white",  name: "White",        hex: "#F4F4F4", ink: "#111111" },
];

export function swatchById(id) {
  return SWATCHES.find((s) => s.id === id) || SWATCHES[0];
}
