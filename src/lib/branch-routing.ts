/**
 * Branch URLs.
 *
 * The site ships in "path" mode, where branches live at /{slug} — the same
 * shape as nitte.edu.in/nmamit. Flipping BRANCH_ROUTING_MODE to "subdomain"
 * switches every generated link to {slug}.{ROOT_DOMAIN} without touching the
 * route files, because middleware rewrites a branch host back onto /{slug}.
 */
export type BranchRoutingMode = "path" | "subdomain";

export function routingMode(): BranchRoutingMode {
  return process.env.BRANCH_ROUTING_MODE === "subdomain" ? "subdomain" : "path";
}

export function rootDomain() {
  return process.env.ROOT_DOMAIN ?? "";
}

/**
 * Builds a link to a page inside a branch site.
 * `path` is relative to the branch root, e.g. "/admissions".
 */
export function branchHref(slug: string, path = "") {
  const suffix = path && !path.startsWith("/") ? `/${path}` : path;

  if (routingMode() === "subdomain" && rootDomain()) {
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    return `${protocol}://${slug}.${rootDomain()}${suffix || "/"}`;
  }

  return `/${slug}${suffix}`;
}

/** Extracts a branch slug from a Host header, or null for the main site. */
export function slugFromHost(host: string | null): string | null {
  if (!host) return null;

  const hostname = host.split(":")[0].toLowerCase();
  const root = rootDomain().toLowerCase();

  if (!root || hostname === root || hostname === `www.${root}`) return null;
  if (!hostname.endsWith(`.${root}`)) return null;

  const label = hostname.slice(0, -(root.length + 1));
  // Only a single label is a branch; anything deeper is not ours.
  if (!label || label.includes(".") || label === "www") return null;

  return label;
}
