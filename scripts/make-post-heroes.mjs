/* Generates blog post hero SVGs from a JSON spec file.
 *
 * Usage: node scripts/make-post-heroes.mjs <spec.json>
 *
 * Every hero must be: 1000x500 viewBox, gradient background plus two blurred
 * ellipses, left white text card, right graphic, and the
 * `<rect y="496" height="4" fill="#01AD9F">` accent bar. Plumbing heroes use
 * ORANGE (#EA580C / #FB923C) with the teal bar retained.
 *
 * Hand-writing fifteen of these invites drift in exactly the structural details
 * the verification asserts, so they are generated instead.
 */
import fs from "node:fs";

const OUT = "public/images/posts";

/** Escape for XML text nodes. */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const TONES = {
  green: { bg: "#F0FDF4", stroke: "#16A34A", text: "#15803D" },
  orange: { bg: "#FFF7ED", stroke: "#EA580C", text: "#C2410C" },
  blue: { bg: "#EFF6FF", stroke: "#2563EB", text: "#1D4ED8" },
  red: { bg: "#FEF2F2", stroke: "#DC2626", text: "#B91C1C" },
};

function hero(s) {
  const p = s.prefix;
  const t = (k) => TONES[k] ?? TONES.orange;
  const a = t(s.boxA.tone);
  const b = t(s.boxB.tone);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" fill="none" role="img" aria-labelledby="${p}HeroTitle ${p}HeroDesc">
  <title id="${p}HeroTitle">${esc(s.a11yTitle)}</title>
  <desc id="${p}HeroDesc">${esc(s.a11yDesc)}</desc>

  <defs>
    <linearGradient id="${p}Bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF7ED"/>
      <stop offset="45%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#ECFEFF"/>
    </linearGradient>
    <linearGradient id="${p}Orange" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0.08"/>
    </linearGradient>
    <linearGradient id="${p}Teal" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#01AD9F" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#14B8A6" stop-opacity="0.06"/>
    </linearGradient>
    <linearGradient id="${p}AccentBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#01AD9F"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
    <filter id="${p}Blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="24"/>
    </filter>
  </defs>

  <rect width="1000" height="500" fill="url(#${p}Bg)"/>
  <ellipse cx="800" cy="136" rx="200" ry="160" fill="url(#${p}Orange)" filter="url(#${p}Blur)"/>
  <ellipse cx="652" cy="392" rx="180" ry="140" fill="url(#${p}Teal)" filter="url(#${p}Blur)"/>

  <rect x="48" y="72" width="410" height="356" rx="24" fill="#FFFFFF" fill-opacity="0.42" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.8"/>
  <text x="80" y="158" fill="#152035" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="700" letter-spacing="-0.02em">
    <tspan x="80" dy="0">${esc(s.line1)}</tspan>
    <tspan x="80" dy="40" fill="#EA580C">${esc(s.line2)}</tspan>
  </text>
  <text x="80" y="272" fill="#64748B" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500">${esc(s.subtitle)}</text>
  <rect x="80" y="296" width="56" height="4" rx="2" fill="url(#${p}AccentBar)"/>
  <text x="80" y="344" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500">${esc(s.tagline)}</text>

  <g font-family="system-ui, -apple-system, sans-serif">
    <text x="530" y="118" fill="#94A3B8" font-size="11" font-weight="700">${esc(s.boxA.label)}</text>
    <rect x="530" y="130" width="356" height="46" rx="9" fill="${a.bg}" stroke="${a.stroke}" stroke-width="2"/>
    <text x="550" y="159" fill="${a.text}" font-size="14" font-weight="700">${esc(s.boxA.text)}</text>

    <text x="530" y="208" fill="#94A3B8" font-size="11" font-weight="700">${esc(s.boxB.label)}</text>
    <rect x="530" y="220" width="356" height="46" rx="9" fill="${b.bg}" stroke="${b.stroke}" stroke-width="2"/>
    <text x="550" y="249" fill="${b.text}" font-size="14" font-weight="700">${esc(s.boxB.text)}</text>

    <rect x="530" y="288" width="356" height="74" rx="12" fill="#FFFFFF" fill-opacity="0.95" stroke="#01AD9F" stroke-width="2.6"/>
    <text x="708" y="315" text-anchor="middle" fill="#0F766E" font-size="18" font-weight="800">${esc(s.punch1)}</text>
    <text x="708" y="337" text-anchor="middle" fill="#0F766E" font-size="18" font-weight="800">${esc(s.punch2)}</text>
    <text x="708" y="355" text-anchor="middle" fill="#64748B" font-size="11" font-weight="500">${esc(s.punchSub)}</text>

    <text x="530" y="388" fill="#94A3B8" font-size="11" font-weight="600">${esc(s.footer)}</text>
  </g>

  <rect x="0" y="496" width="1000" height="4" fill="#01AD9F"/>
</svg>
`;
}

const SPECS = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
let n = 0;
for (const s of SPECS) {
  fs.writeFileSync(`${OUT}/${s.slug}-hero.svg`, hero(s), "utf8");
  n++;
}
console.log(`wrote ${n} heroes`);
