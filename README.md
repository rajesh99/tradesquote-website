# TradesQuote Website

Marketing site and blog for [TradesQuote](https://www.tradesquote.ai) — AI-powered, line-item estimates for trades.

## Stack

- [Astro](https://astro.build) (SSR, `output: "server"`) deployed on Cloudflare via `@astrojs/cloudflare`
- Tailwind CSS v4
- MDX blog posts in `src/content/posts/` (rendered under `/blog/`)
- React islands for interactive components (search, calculators)

## Structure

- `src/pages/` — routes: landing page, blog, HVAC calculators, integrations, contact
- `src/content/posts/` — blog posts (MDX with frontmatter: title, description, date, categories, tags, image)
- `src/components/` — site header/footer and page components
- `src/layouts/` — base layout and blog components
- `src/config/config.json` — site title, base URL, metadata, contact info

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview the production build locally |
