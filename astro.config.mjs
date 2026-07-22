import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, sharpImageService } from "astro/config";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import config from "./src/config/config.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  site: config.site.base_url,
  base: config.site.base_path ? config.site.base_path : "/",
  image: { service: sharpImageService() },
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: "react-dom-server-edge",
        config(_, { command }) {
          if (command === "build") {
            return {
              resolve: { alias: { "react-dom/server": "react-dom/server.edge" } },
            };
          }
        },
      },
    ],
    resolve: {
      alias: {
        "@": `${__dirname}/src`,
      },
    },
  },
  integrations: [react(), sitemap(), mdx()],
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    shikiConfig: { theme: "one-dark-pro", wrap: true },
  },
});