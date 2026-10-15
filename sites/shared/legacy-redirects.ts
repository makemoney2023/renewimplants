export type LegacyRedirect = {
  source: string;
  destination: string;
};

type FetchHandler = {
  fetch: (request: Request, env?: unknown, ctx?: unknown) => Promise<Response> | Response;
};

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname || "/";
}

/** Old scraped paths, with or without a trailing slash, map to the new page. */
export function legacyRedirectTarget(pathname: string, redirects: LegacyRedirect[]) {
  const bySource = new Map(redirects.map((item) => [item.source, item.destination]));
  const candidates = [pathname];
  if (pathname.length > 1 && pathname.endsWith("/")) candidates.push(pathname.slice(0, -1));
  else if (pathname !== "/") candidates.push(`${pathname}/`);

  for (const candidate of candidates) {
    const destination = bySource.get(candidate);
    if (!destination) continue;
    const destinationPath = destination.startsWith("http")
      ? new URL(destination).pathname
      : (destination.split("?")[0] ?? destination);
    if (normalizePath(destinationPath) === normalizePath(pathname)) continue;
    return destination;
  }
  return null;
}

/**
 * vinext's App Router only emits 307/308 for next.config redirects, and it
 * removes trailing slashes before those rules run. This wrapper answers the
 * old URL itself with one 301.
 */
export function withLegacyRedirects(handler: FetchHandler, redirects: LegacyRedirect[]) {
  return {
    async fetch(request: Request, env?: unknown, ctx?: unknown) {
      if (request.method === "GET" || request.method === "HEAD") {
        const url = new URL(request.url);
        const destination = legacyRedirectTarget(url.pathname, redirects);
        if (destination) {
          const location = destination.startsWith("http")
            ? destination
            : `${destination}${destination.includes("?") ? "" : url.search}`;
          return new Response(null, {
            status: 301,
            headers: { Location: location },
          });
        }
      }
      return handler.fetch(request, env, ctx);
    },
  };
}
