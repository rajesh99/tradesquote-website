/* Every bolded numeric anchor in a post's prose must also appear in that post's
   rendered figure SVG text. Catches fmt/toFixed drift and wrong-basis errors —
   it is what caught the estimating post being written on a different base from
   the calculator it funnels to. Run AFTER `npx astro build`. */
import fs from "node:fs";

const NEW = [
  "toilet-keeps-running",
  "how-to-find-a-water-leak",
  "water-hammer-causes-and-fixes",
  "what-size-sump-pump-do-i-need",
  "how-many-gpm-does-a-shower-use",
  "sewer-smell-in-house",
  "sewer-line-replacement-cost",
  "drain-cleaning-cost",
];

/* Section numbers, standards, years and round trade figures legitimately appear
   only in prose. Everything else with a decimal or a comma must be in a figure. */
const PROSE_ONLY = [
  /^(604|607|608|609|709|710|906|909|912|918|1106|1051|1050|1016)(\.\d+)*$/,
  /^(2021|2026)$/,
  /^(1\.5|1\.6|2\.5|0\.5|1\.25|4\.5)$/, /* pipe sizes and fixture sizes */
];

let checked = 0;
const misses = [];

for (const slug of NEW) {
  const html = fs.readFileSync(`dist/blog/${slug}/index.html`, "utf8");
  const mdx = fs.readFileSync(`src/content/posts/${slug}.mdx`, "utf8");

  const figures = html.match(/<figure[\s\S]*?<\/figure>/g) || [];
  const figureText = figures.join(" ").replace(/<[^>]+>/g, " ");

  const body = mdx
    .split(/^---$/m)
    .slice(2)
    .join("---")
    .split("## Frequently asked questions")[0]
    .replace(/^import .*$/gm, "");

  for (const b of body.match(/\*\*[^*]+\*\*/g) || []) {
    for (const raw of b.match(/\$?\d[\d,]*\.?\d*/g) || []) {
      const clean = raw.replace(/^\$/, "").replace(/[.,;:]+$/, "");
      if (PROSE_ONLY.some((re) => re.test(clean))) continue;
      if (!/[.,]/.test(clean)) continue;
      checked++;
      if (!figureText.includes(clean)) {
        misses.push(`${slug}: "${clean}" (from ${b.slice(0, 64)}) not in any figure`);
      }
    }
  }
}

console.log(`prose anchors checked: ${checked}`);
if (misses.length) {
  console.log(`UNMATCHED: ${misses.length}`);
  for (const m of misses) console.log(`  ✗ ${m}`);
  process.exit(1);
}
console.log("UNMATCHED: 0");
