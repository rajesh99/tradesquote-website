/** Shared design tokens for blog infographic SVG diagrams. */
export const C = {
  primary: "#01AD9F",
  primaryLight: "#E8F8F6",
  dark: "#152035",
  muted: "#747577",
  border: "#D5D5D5",
  panelBg: "#FAFAFA",
  white: "#ffffff",
  blue: "#2563EB",
  blueLight: "#EFF6FF",
  orange: "#EA580C",
  orangeLight: "#FFF7ED",
  red: "#DC2626",
  redLight: "#FEF2F2",
  green: "#16A34A",
  greenLight: "#F0FDF4",
} as const;

export const FONT = "system-ui, sans-serif";

/** Returns SVG marker defs with unique IDs to avoid collisions on the same page. */
export function markerDefs(prefix: string) {
  return `
    <marker id="${prefix}-arrow-primary" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="${C.primary}" />
    </marker>
    <marker id="${prefix}-arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="${C.blue}" />
    </marker>
    <marker id="${prefix}-arrow-orange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="${C.orange}" />
    </marker>
    <marker id="${prefix}-arrow-muted" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="${C.border}" />
    </marker>
  `;
}
