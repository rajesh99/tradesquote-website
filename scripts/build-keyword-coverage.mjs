import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const BASE_URL = "http://localhost:4321";
const CSV_PATH = path.join(ROOT, "docs/resources/hvac-formula-calculator-keywords-stats.csv");
const OUTPUT_PATH = path.join(ROOT, "docs/resources/hvac-formula-calculator-keywords-stats.html");
const BLOG_DIR = path.join(ROOT, "src/content/posts");
const CALC_DIR = path.join(ROOT, "src/pages/calculators/hvac");

// ── CSV parsing ──────────────────────────────────────────────────────────────

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  // Skip 3 metadata header rows; row 3 is column headers
  const dataLines = lines.slice(3);
  const keywords = [];

  for (const line of dataLines) {
    const fields = parseCsvLine(line);
    const keyword = fields[0]?.trim();
    if (!keyword) continue;

    const avgSearches = parseInt(fields[2]?.replace(/,/g, "") || "0", 10) || 0;

    keywords.push({
      keyword,
      currency: fields[1] || "",
      avgMonthlySearches: avgSearches,
      threeMonthChange: fields[3] || "",
      yoyChange: fields[4] || "",
      competition: fields[5] || "",
      competitionIndexed: parseInt(fields[6] || "0", 10) || 0,
      bidLow: fields[7] || "",
      bidHigh: fields[8] || "",
    });
  }

  return keywords;
}

// ── Page indexing ────────────────────────────────────────────────────────────

function extractMdxTitle(content) {
  const match = content.match(/^---[\s\S]*?^title:\s*["']?(.+?)["']?\s*$/m);
  return match ? match[1].replace(/^["']|["']$/g, "") : null;
}

function isDraftMdx(content) {
  return /^draft:\s*true\s*$/m.test(content);
}

function extractAstroTitle(content) {
  const match = content.match(/const\s+title\s*=\s*["'](.+?)["']/);
  return match ? match[1] : null;
}

function loadBlogPages() {
  const pages = [];
  if (!fs.existsSync(BLOG_DIR)) return pages;

  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!file.endsWith(".mdx")) continue;
    const slug = file.replace(/\.mdx$/, "");
    const content = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    if (isDraftMdx(content)) continue;

    const title = extractMdxTitle(content) || slug;
    pages.push({
      slug,
      title,
      type: "blog",
      url: `${BASE_URL}/blog/${slug}`,
      searchableText: content.toLowerCase(),
      rawText: content,
    });
  }

  return pages;
}

function loadCalculatorPages() {
  const pages = [];
  if (!fs.existsSync(CALC_DIR)) return pages;

  for (const entry of fs.readdirSync(CALC_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const astroPath = path.join(CALC_DIR, entry.name, "index.astro");
    if (!fs.existsSync(astroPath)) continue;

    const content = fs.readFileSync(astroPath, "utf8");
    const title = extractAstroTitle(content) || entry.name;

    pages.push({
      slug: entry.name,
      title,
      type: "calculator",
      url: `${BASE_URL}/calculators/hvac/${entry.name}`,
      searchableText: content.toLowerCase(),
      rawText: content,
    });
  }

  return pages;
}

// ── Matching ─────────────────────────────────────────────────────────────────

function stripFrontmatter(content) {
  if (content.startsWith("---")) {
    const end = content.indexOf("---", 3);
    if (end !== -1) return content.slice(end + 3);
  }
  return content;
}

function extractSnippet(rawText, keyword, radius = 60) {
  const body = stripFrontmatter(rawText);
  const lower = body.toLowerCase();
  const kwLower = keyword.toLowerCase();
  const idx = lower.indexOf(kwLower);
  if (idx === -1) {
    // Fallback: search full raw text if keyword only appears in frontmatter/meta
    const fullLower = rawText.toLowerCase();
    const fullIdx = fullLower.indexOf(kwLower);
    if (fullIdx === -1) return "";
    return cleanSnippet(rawText, fullIdx, kwLower.length, radius);
  }
  return cleanSnippet(body, idx, kwLower.length, radius);
}

function cleanSnippet(text, idx, kwLen, radius) {
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + kwLen + radius);
  let snippet = text.slice(start, end);

  snippet = snippet
    .replace(/import\s+[\s\S]*?from\s+["'][^"']+["'];?/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/[#*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return prefix + snippet + suffix;
}

function matchKeywordsToPages(keywords, pages) {
  const keywordResults = keywords.map((kw) => {
    const kwLower = kw.keyword.toLowerCase();
    const matches = [];

    for (const page of pages) {
      if (page.searchableText.includes(kwLower)) {
        matches.push({
          slug: page.slug,
          title: page.title,
          type: page.type,
          url: page.url,
          snippet: extractSnippet(page.rawText, kw.keyword),
        });
      }
    }

    return {
      ...kw,
      pageCount: matches.length,
      pages: matches,
    };
  });

  const pageResults = pages.map((page) => {
    const matchedKeywords = keywordResults
      .filter((kw) => kw.pages.some((p) => p.slug === page.slug && p.type === page.type))
      .map((kw) => kw.keyword);

    return {
      slug: page.slug,
      title: page.title,
      type: page.type,
      url: page.url,
      keywordCount: matchedKeywords.length,
      keywords: matchedKeywords,
    };
  });

  pageResults.sort((a, b) => b.keywordCount - a.keywordCount);

  return { keywords: keywordResults, pages: pageResults };
}

// ── HTML generation ──────────────────────────────────────────────────────────

function buildHtml(data) {
  const json = JSON.stringify(data);
  const generatedAt = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HVAC Keyword Coverage Dashboard | TradesQuote</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>
    .row-expand { display: none; }
    tr.expanded .row-expand { display: table-row; }
    tr.expanded .chevron { transform: rotate(90deg); }
    .chip { cursor: pointer; }
    .chip:hover { opacity: 0.85; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen">

  <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-slate-900">HVAC Keyword Coverage</h1>
          <p class="text-sm text-slate-500 mt-0.5">CSV keywords matched against blog posts &amp; calculator pages</p>
        </div>
        <p class="text-xs text-slate-400">Generated ${generatedAt.slice(0, 16).replace("T", " ")} UTC · <code class="bg-slate-100 px-1 rounded">npm run keyword-stats</code></p>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <!-- KPI cards -->
    <div id="kpi-row" class="grid grid-cols-2 lg:grid-cols-4 gap-4"></div>

    <!-- Toolbar -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm sticky top-[73px] z-20 space-y-3">
      <div class="flex flex-col sm:flex-row gap-3">
        <input id="search" type="search" placeholder="Search keywords…"
          class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
        <div class="flex gap-2">
          <button data-view="keywords" class="view-btn px-4 py-2 rounded-lg text-sm font-medium bg-sky-600 text-white">Keywords</button>
          <button data-view="pages" class="view-btn px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200">By Page</button>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 text-sm">
        <select id="filter-coverage" class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
          <option value="all">All coverage</option>
          <option value="covered">Covered</option>
          <option value="uncovered">Uncovered</option>
        </select>
        <select id="filter-volume" class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
          <option value="all">All volume</option>
          <option value="500">500+ /mo</option>
          <option value="5000">5000+ /mo</option>
        </select>
        <select id="filter-competition" class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
          <option value="all">All competition</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select id="sort-by" class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
          <option value="volume">Sort: Volume ↓</option>
          <option value="keyword">Sort: A–Z</option>
          <option value="pages">Sort: Page count ↓</option>
        </select>
        <span id="result-count" class="ml-auto self-center text-slate-500 text-sm"></span>
      </div>
    </div>

    <!-- Keywords view -->
    <div id="view-keywords" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-slate-600 w-8"></th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Keyword</th>
              <th class="text-right px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Avg searches</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Competition</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">YoY</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Pages</th>
            </tr>
          </thead>
          <tbody id="keywords-tbody"></tbody>
        </table>
      </div>
      <p id="keywords-empty" class="hidden text-center py-12 text-slate-500">No keywords match your filters.</p>
      <div id="keywords-pagination" class="hidden border-t border-slate-200 px-4 py-3 flex items-center justify-between text-sm text-slate-600">
        <span id="page-info"></span>
        <div class="flex gap-2">
          <button id="page-prev" class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40">Prev</button>
          <button id="page-next" class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>

    <!-- By Page view -->
    <div id="view-pages" class="hidden space-y-3"></div>

    <p class="text-xs text-slate-400 text-center pb-8">
      Regenerate with <code class="bg-slate-100 px-1 rounded">npm run keyword-stats</code> after adding posts or updating the CSV.
      Links point to <code class="bg-slate-100 px-1 rounded">${BASE_URL}</code> — start <code class="bg-slate-100 px-1 rounded">npm run dev</code> first.
    </p>
  </main>

  <script type="application/json" id="coverage-data">${json}</script>
  <script type="module">
    import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@7.3.0/dist/fuse.mjs";

    const PAGE_SIZE = 50;
    let DATA;
    try {
      DATA = JSON.parse(document.getElementById("coverage-data").textContent);
    } catch (err) {
      document.body.innerHTML = '<div class="max-w-lg mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-xl text-red-800"><h1 class="font-bold text-lg">Failed to load data</h1><p class="mt-2 text-sm">' + err.message + '</p></div>';
      throw err;
    }

    const { keywords: ALL_KEYWORDS, pages: ALL_PAGES, stats } = DATA;

    let currentView = "keywords";
    let expandedRow = null;
    let highlightKeyword = null;
    let currentPage = 0;

    const fuse = new Fuse(ALL_KEYWORDS, {
      keys: ["keyword"],
      threshold: 0.35,
      minMatchCharLength: 2,
    });

    const els = {
      search: document.getElementById("search"),
      filterCoverage: document.getElementById("filter-coverage"),
      filterVolume: document.getElementById("filter-volume"),
      filterCompetition: document.getElementById("filter-competition"),
      sortBy: document.getElementById("sort-by"),
      resultCount: document.getElementById("result-count"),
      kpiRow: document.getElementById("kpi-row"),
      keywordsTbody: document.getElementById("keywords-tbody"),
      keywordsEmpty: document.getElementById("keywords-empty"),
      keywordsPagination: document.getElementById("keywords-pagination"),
      pageInfo: document.getElementById("page-info"),
      pagePrev: document.getElementById("page-prev"),
      pageNext: document.getElementById("page-next"),
      viewKeywords: document.getElementById("view-keywords"),
      viewPages: document.getElementById("view-pages"),
      viewBtns: document.querySelectorAll(".view-btn"),
    };

    function formatVolume(n) {
      if (n >= 5000) return n.toLocaleString();
      return n.toLocaleString();
    }

    function competitionBadge(level) {
      const colors = {
        Low: "bg-emerald-100 text-emerald-800",
        Medium: "bg-amber-100 text-amber-800",
        High: "bg-red-100 text-red-800",
        Unknown: "bg-slate-100 text-slate-600",
      };
      const cls = colors[level] || colors.Unknown;
      return \`<span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium \${cls}">\${level || "—"}</span>\`;
    }

    function pageLink(page) {
      const cls = page.type === "blog"
        ? "text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
        : "text-sky-700 bg-sky-50 hover:bg-sky-100";
      const label = page.type === "blog" ? "Blog" : "Calc";
      return \`<a href="\${page.url}" target="_blank" rel="noopener"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium \${cls}">\${label}: \${esc(page.title.length > 40 ? page.title.slice(0, 40) + "…" : page.title)}</a>\`;
    }

    function esc(s) {
      return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }

    function renderKpis() {
      els.kpiRow.innerHTML = [
        { label: "Total keywords", value: stats.total, color: "text-slate-900" },
        { label: "Covered", value: stats.covered, color: "text-emerald-600" },
        { label: "Uncovered", value: stats.uncovered, color: "text-red-600" },
        { label: "High-volume gaps", value: stats.highVolumeGaps, color: "text-amber-600", sub: "5000+/mo, 0 pages" },
      ].map((k) => \`
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">\${k.label}</p>
          <p class="text-2xl font-bold \${k.color} mt-1">\${k.value.toLocaleString()}</p>
          \${k.sub ? \`<p class="text-xs text-slate-400 mt-0.5">\${k.sub}</p>\` : ""}
        </div>
      \`).join("");
    }

    function getFilteredKeywords() {
      const q = els.search.value.trim();
      let list = q.length >= 2 ? fuse.search(q).map((r) => r.item) : [...ALL_KEYWORDS];

      const coverage = els.filterCoverage.value;
      if (coverage === "covered") list = list.filter((k) => k.pageCount > 0);
      if (coverage === "uncovered") list = list.filter((k) => k.pageCount === 0);

      const vol = els.filterVolume.value;
      if (vol === "500") list = list.filter((k) => k.avgMonthlySearches >= 500);
      if (vol === "5000") list = list.filter((k) => k.avgMonthlySearches >= 5000);

      const comp = els.filterCompetition.value;
      if (comp !== "all") list = list.filter((k) => k.competition === comp);

      if (highlightKeyword) {
        list = list.filter((k) => k.keyword === highlightKeyword);
      }

      const sort = els.sortBy.value;
      if (sort === "volume") list.sort((a, b) => b.avgMonthlySearches - a.avgMonthlySearches);
      else if (sort === "keyword") list.sort((a, b) => a.keyword.localeCompare(b.keyword));
      else if (sort === "pages") list.sort((a, b) => b.pageCount - a.pageCount);

      return list;
    }

    function renderKeywords() {
      const list = getFilteredKeywords();
      const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
      if (currentPage >= totalPages) currentPage = totalPages - 1;
      if (currentPage < 0) currentPage = 0;

      const start = currentPage * PAGE_SIZE;
      const pageList = list.slice(start, start + PAGE_SIZE);

      els.resultCount.textContent = \`\${list.length} keyword\${list.length !== 1 ? "s" : ""}\`;

      if (list.length === 0) {
        els.keywordsTbody.innerHTML = "";
        els.keywordsEmpty.classList.remove("hidden");
        els.keywordsPagination.classList.add("hidden");
        return;
      }
      els.keywordsEmpty.classList.add("hidden");

      if (list.length > PAGE_SIZE) {
        els.keywordsPagination.classList.remove("hidden");
        els.pageInfo.textContent = \`Page \${currentPage + 1} of \${totalPages} (\${start + 1}–\${Math.min(start + PAGE_SIZE, list.length)} of \${list.length})\`;
        els.pagePrev.disabled = currentPage === 0;
        els.pageNext.disabled = currentPage >= totalPages - 1;
      } else {
        els.keywordsPagination.classList.add("hidden");
      }

      els.keywordsTbody.innerHTML = pageList.map((kw) => {
        const border = kw.pageCount > 0 ? "border-l-4 border-l-emerald-400" : "border-l-4 border-l-red-300";
        const expanded = expandedRow === kw.keyword ? "expanded" : "";
        const pagesHtml = kw.pages.length
          ? kw.pages.map((p) => pageLink(p)).join(" ")
          : '<span class="text-slate-400 text-xs">No matches</span>';

        const snippetsHtml = kw.pages.map((p) => \`
          <div class="mb-2">
            \${pageLink(p)}
            <p class="text-xs text-slate-500 mt-1 pl-2 border-l-2 border-slate-200">\${esc(p.snippet)}</p>
          </div>
        \`).join("");

        return \`
          <tr class="\${border} \${expanded} hover:bg-slate-50 cursor-pointer keyword-row" data-keyword="\${encodeURIComponent(kw.keyword)}">
            <td class="px-4 py-3 text-slate-400"><span class="chevron inline-block transition-transform">▶</span></td>
            <td class="px-4 py-3 font-medium">\${esc(kw.keyword)}</td>
            <td class="px-4 py-3 text-right tabular-nums">\${formatVolume(kw.avgMonthlySearches)}</td>
            <td class="px-4 py-3">\${competitionBadge(kw.competition)}</td>
            <td class="px-4 py-3 text-slate-600">\${esc(kw.yoyChange || "—")}</td>
            <td class="px-4 py-3">
              <span class="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full mr-2">\${kw.pageCount}</span>
              <span class="flex flex-wrap gap-1 mt-1">\${pagesHtml}</span>
            </td>
          </tr>
          <tr class="row-expand \${expanded}">
            <td colspan="6" class="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p class="text-xs font-semibold text-slate-500 uppercase mb-2">Match context</p>
              \${snippetsHtml || '<p class="text-sm text-slate-400">No page matches for this keyword.</p>'}
            </td>
          </tr>
        \`;
      }).join("");

      els.keywordsTbody.querySelectorAll(".keyword-row").forEach((row) => {
        row.addEventListener("click", () => {
          const kw = decodeURIComponent(row.dataset.keyword);
          expandedRow = expandedRow === kw ? null : kw;
          renderKeywords();
        });
      });
    }

    function renderPages() {
      els.resultCount.textContent = \`\${ALL_PAGES.length} page\${ALL_PAGES.length !== 1 ? "s" : ""}\`;
      els.viewPages.innerHTML = ALL_PAGES.map((page) => {
        const typeCls = page.type === "blog" ? "bg-indigo-100 text-indigo-800" : "bg-sky-100 text-sky-800";
        const chips = page.keywords.map((kw) =>
          \`<button class="chip inline-block px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" data-kw="\${esc(kw)}">\${esc(kw)}</button>\`
        ).join(" ");

        return \`
          <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div class="flex flex-wrap items-start gap-2 justify-between">
              <div>
                <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium \${typeCls}">\${page.type}</span>
                <h3 class="font-semibold text-slate-900 mt-1">\${esc(page.title)}</h3>
                <a href="\${page.url}" target="_blank" rel="noopener" class="text-sm text-sky-600 hover:underline">\${esc(page.url)}</a>
              </div>
              <span class="text-sm font-semibold text-slate-500">\${page.keywordCount} keyword\${page.keywordCount !== 1 ? "s" : ""}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-3">\${chips || '<span class="text-xs text-slate-400">No keyword matches</span>'}</div>
          </div>
        \`;
      }).join("");

      els.viewPages.querySelectorAll(".chip").forEach((chip) => {
        chip.addEventListener("click", (e) => {
          e.stopPropagation();
          highlightKeyword = chip.dataset.kw;
          els.search.value = chip.dataset.kw;
          setView("keywords");
          render();
        });
      });
    }

    function setView(view) {
      currentView = view;
      els.viewBtns.forEach((btn) => {
        const active = btn.dataset.view === view;
        btn.className = active
          ? "view-btn px-4 py-2 rounded-lg text-sm font-medium bg-sky-600 text-white"
          : "view-btn px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200";
      });
      els.viewKeywords.classList.toggle("hidden", view !== "keywords");
      els.viewPages.classList.toggle("hidden", view !== "pages");
    }

    function render() {
      if (currentView === "keywords") renderKeywords();
      else renderPages();
    }

    els.viewBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        highlightKeyword = null;
        setView(btn.dataset.view);
        render();
      });
    });

    function resetPage() {
      currentPage = 0;
      expandedRow = null;
    }

    [els.search, els.filterCoverage, els.filterVolume, els.filterCompetition, els.sortBy].forEach((el) => {
      el.addEventListener("input", () => {
        if (el === els.search) highlightKeyword = null;
        resetPage();
        render();
      });
      el.addEventListener("change", () => {
        if (el === els.search) highlightKeyword = null;
        resetPage();
        render();
      });
    });

    els.pagePrev.addEventListener("click", () => {
      currentPage--;
      expandedRow = null;
      renderKeywords();
    });
    els.pageNext.addEventListener("click", () => {
      currentPage++;
      expandedRow = null;
      renderKeywords();
    });

    renderKpis();
    setView("keywords");
    render();
  </script>
</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log("Reading CSV…");
  const csvContent = fs.readFileSync(CSV_PATH, "utf8");
  const keywords = parseCsv(csvContent);
  console.log(`  ${keywords.length} keywords`);

  console.log("Indexing pages…");
  const blogPages = loadBlogPages();
  const calcPages = loadCalculatorPages();
  const allPages = [...blogPages, ...calcPages];
  console.log(`  ${blogPages.length} blog posts, ${calcPages.length} calculators`);

  console.log("Matching keywords…");
  const { keywords: keywordResults, pages: pageResults } = matchKeywordsToPages(keywords, allPages);

  const covered = keywordResults.filter((k) => k.pageCount > 0).length;
  const stats = {
    total: keywordResults.length,
    covered,
    uncovered: keywordResults.length - covered,
    highVolumeGaps: keywordResults.filter((k) => k.avgMonthlySearches >= 5000 && k.pageCount === 0).length,
    blogCount: blogPages.length,
    calcCount: calcPages.length,
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
  };

  const data = {
    stats,
    keywords: keywordResults,
    pages: pageResults,
  };

  console.log(`  ${covered} covered, ${stats.uncovered} uncovered, ${stats.highVolumeGaps} high-volume gaps`);

  console.log("Writing HTML…");
  fs.writeFileSync(OUTPUT_PATH, buildHtml(data), "utf8");
  console.log(`Done → ${OUTPUT_PATH}`);
}

main();
