/* Post + calculator structure verification. Run AFTER `npx astro build`.
 *
 * Edit NEW and DIRS for the wave being checked. Written for wave 6 (the leak
 * calculator + the 15 tier-2 posts) and kept because the assertions are
 * wave-agnostic: frontmatter shape, hero structure, exactly 3 figures, links
 * resolving (blog against dist, calculators against src/pages since they are
 * SSR), an inbound link from a pre-existing post, and the diagram rules —
 * including the `<` in the template half that silently breaks the build. */
import fs from "node:fs";
import path from "node:path";

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

const DIRS = [
  "toilet-running", "find-leak", "water-hammer", "sump-pump",
  "shower-flow", "sewer-smell", "sewer-cost", "drain-cleaning-cost",
];

const POSTS = "src/content/posts";
const BASELINE_JSONLD = fs.existsSync("dist/blog/wet-venting-explained/index.html")
  ? (fs.readFileSync("dist/blog/wet-venting-explained/index.html", "utf8").match(/application\/ld\+json/g) || []).length
  : 0;

let pass = 0;
const fails = [];
const check = (ok, msg) => (ok ? pass++ : fails.push(msg));

/* ---------- posts ---------- */
for (const slug of NEW) {
  const mdxPath = path.join(POSTS, `${slug}.mdx`);
  check(fs.existsSync(mdxPath), `${slug}: mdx missing`);
  if (!fs.existsSync(mdxPath)) continue;
  const mdx = fs.readFileSync(mdxPath, "utf8");
  const fm = mdx.split("---")[1] ?? "";

  check(/^meta_title: ".*2026.*\| TradesQuote"$/m.test(fm), `${slug}: meta_title`);
  check(fm.includes(`image: /images/posts/${slug}-hero.svg`), `${slug}: hero path`);
  check(/^categories: \["plumbing"\]$/m.test(fm), `${slug}: category`);
  check(/^draft: false$/m.test(fm), `${slug}: draft`);
  check(!/\b20\d\d\b/.test(slug), `${slug}: year in slug`);

  const tags = fm.match(/^tags: \[(.*)\]$/m);
  const tagCount = tags ? tags[1].split(/","/).length : 0;
  check(tagCount === 5, `${slug}: ${tagCount} tags, want 5`);

  const faqs = (mdx.match(/^### /gm) || []).length;
  check(faqs >= 8, `${slug}: ${faqs} FAQs, want >=8`);
  check(/\*\*Sources & standards:\*\*/.test(mdx), `${slug}: no sources line`);
  check(!/## Related Posts/i.test(mdx), `${slug}: Related Posts list`);
  check(!mdx.includes(`](/blog/${slug})`), `${slug}: self-link`);

  const hero = `public/images/posts/${slug}-hero.svg`;
  check(fs.existsSync(hero), `${slug}: hero missing`);
  if (fs.existsSync(hero)) {
    const h = fs.readFileSync(hero, "utf8");
    check(h.includes('viewBox="0 0 1000 500"'), `${slug}: hero viewBox`);
    check(h.includes('<rect x="0" y="496" width="1000" height="4" fill="#01AD9F"/>'), `${slug}: hero teal bar`);
    check(h.includes("#EA580C"), `${slug}: hero orange`);
  }

  const dist = `dist/blog/${slug}/index.html`;
  check(fs.existsSync(dist), `${slug}: not prerendered`);
  if (fs.existsSync(dist)) {
    const html = fs.readFileSync(dist, "utf8");
    const figs = (html.match(/<figure/g) || []).length;
    check(figs === 3, `${slug}: ${figs} figures, want 3`);
    check(html.includes(`${slug}-hero.svg`), `${slug}: hero not referenced`);
    const j = (html.match(/application\/ld\+json/g) || []).length;
    check(j === BASELINE_JSONLD, `${slug}: JSON-LD ${j} vs baseline ${BASELINE_JSONLD}`);
    check(html.includes(`canonical" href="https://www.tradesquote.ai/blog/${slug}/`), `${slug}: canonical`);
  }
}

/* ---------- links ---------- */
const allPosts = fs.readdirSync(POSTS).filter((f) => f.endsWith(".mdx"));
let linkCount = 0;
const seen = new Set();
for (const slug of NEW) {
  const mdx = fs.readFileSync(path.join(POSTS, `${slug}.mdx`), "utf8");
  for (const m of mdx.matchAll(/\]\((\/[^)]+)\)/g)) seen.add(`${slug} ${m[1]}`);
}
for (const entry of seen) {
  const [from, href] = entry.split(" ");
  linkCount++;
  if (href.startsWith("/blog/")) {
    const t = href.replace(/^\/blog\//, "").replace(/\/$/, "");
    check(fs.existsSync(`dist/blog/${t}/index.html`), `${from}: dead blog link ${href}`);
  } else if (href.startsWith("/calculators/")) {
    const p = `src/pages${href}`;
    check(fs.existsSync(`${p}.astro`) || fs.existsSync(`${p}/index.astro`), `${from}: dead calculator link ${href}`);
  }
}

/* ---------- inbound from a PRE-EXISTING post ---------- */
for (const slug of NEW) {
  let inbound = 0;
  for (const f of allPosts) {
    const b = f.replace(/\.mdx$/, "");
    if (b === slug || NEW.includes(b)) continue;
    if (fs.readFileSync(path.join(POSTS, f), "utf8").includes(`](/blog/${slug})`)) inbound++;
  }
  check(inbound >= 1, `${slug}: no inbound link from a pre-existing post`);
}

/* ---------- diagrams ---------- */
let diagrams = 0;
for (const d of DIRS) {
  const dir = `src/components/blog/${d}`;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".astro"));
  check(files.length === 3, `${d}: ${files.length} diagrams, want 3`);
  for (const f of files) {
    diagrams++;
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    check(src.includes('from "../infographicTokens"'), `${d}/${f}: no tokens import`);
    check(src.includes('from "@/lib/plumbing"'), `${d}/${f}: no lib import`);
    check(!/\.toFixed\(/.test(src), `${d}/${f}: uses toFixed`);
    check(src.includes('viewBox="0 0 720 '), `${d}/${f}: viewBox not 720 wide`);
    /* `<` in the template half is parsed as a tag opener by the Astro compiler */
    const body = src.split(/^---$/m).slice(2).join("---");
    check(!/[^-]<[ =]|<=/.test(body), `${d}/${f}: bare < in template half`);
  }
}

/* ---------- the leak calculator ---------- */
const CALC = "plumbing-leak-water-waste-calculator";
check(fs.existsSync(`src/pages/calculators/plumbing/${CALC}/index.astro`), "leak calc: page missing");
check(fs.existsSync(`src/scripts/calculators/${CALC}.ts`), "leak calc: script missing");

const registry = fs.readFileSync("src/config/plumbingCalculators.ts", "utf8");
check(registry.includes(`slug: "${CALC}"`), "leak calc: not in plumbingCalculators");
/* Normalise line endings — this repo is checked out CRLF on Windows, so a
   literal \n in the needle never matches the file as read. */
const registryLF = registry.replace(/\r\n/g, "\n");
check(
  registryLF.includes(`"${CALC}",\n      "plumbing-unit-converter"`),
  "leak calc: not in a group",
);
check((registry.match(new RegExp(`slug: "${CALC}"`, "g")) || []).length === 2, "leak calc: not in the guide table");

const cats = fs.readFileSync("src/config/calculatorCategories.ts", "utf8");
check(/leak and water-waste cost/.test(cats), "leak calc: category description not updated");

const hub = fs.readFileSync("src/pages/calculators/plumbing/index.astro", "utf8");
check(!/Next up:[\s\S]{0,120}leak and water-waste\s*\n?\s*calculator/.test(hub), "hub: coming-soon still promises the leak calculator");

console.log(`diagrams checked: ${diagrams}`);
console.log(`internal links checked: ${linkCount}`);
console.log(`\nPASSED: ${pass}`);
if (fails.length) {
  console.log(`FAILED: ${fails.length}`);
  for (const f of fails) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log("FAILED: 0");
