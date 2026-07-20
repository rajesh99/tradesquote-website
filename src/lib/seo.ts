import config from "@/config/config.json";

export function getCanonicalUrl(pathname: string): string {
  const base = config.site.base_url.replace(/\/$/, "");
  let path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (!config.site.trailing_slash && path.length > 1) {
    path = path.replace(/\/+$/, "");
  }
  return `${base}${path}`;
}

export const canonicalHome = getCanonicalUrl("/");
export const canonicalCalculators = getCanonicalUrl("/calculators");
export const canonicalHvac = getCanonicalUrl("/calculators/hvac");
