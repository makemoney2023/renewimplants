import type { ClinicPage, ClinicSite, NavItem } from "../types";

export function canonicalPath(path: string) {
  if (!path || path === "/") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

export function createCatalog(site: ClinicSite, pages: ClinicPage[]) {
  const byPath = new Map(pages.map((page) => [page.path, page]));

  function getPage(path: string) {
    return byPath.get(canonicalPath(path));
  }

  function posts() {
    return pages
      .filter((page) => page.kind === "post")
      .sort((a, b) => (b.published || b.modified).localeCompare(a.published || a.modified));
  }

  function teamPages() {
    return pages.filter((page) => page.path.startsWith("/team/"));
  }

  function navigation(): NavItem[] {
    const nav = site.nav.map((item) => ({ ...item, children: [...item.children] }));
    const linked = new Set(nav.flatMap((item) => [item.href, ...item.children.map((child) => child.href)]));

    const serviceItem = nav.find((item) => item.label.toLowerCase().includes("service"));
    if (serviceItem) {
      for (const page of pages) {
        if (page.path.startsWith("/service/") && !linked.has(page.path)) {
          serviceItem.children.push({ label: page.title, href: page.path });
          linked.add(page.path);
        }
      }
    }

    const areas = pages.filter((page) => page.path.startsWith("/dentist-near-") && !linked.has(page.path));
    if (areas.length > 0) {
      nav.push({
        label: "Nearby",
        href: areas[0].path,
        children: areas.slice(1).map((page) => ({ label: page.title, href: page.path })),
      });
    }

    return nav;
  }

  function crumbs(page: ClinicPage) {
    const trail = [{ name: "Home", path: "/" }];
    if (page.path === "/") return trail;
    const parts = page.path.split("/").filter(Boolean);
    let acc = "";
    for (const part of parts) {
      acc += `/${part}/`;
      const match = byPath.get(acc);
      trail.push({ name: match ? match.title : part.replace(/-/g, " "), path: match?.path ?? acc });
    }
    trail[trail.length - 1] = { name: page.title, path: page.path };
    return trail;
  }

  return { site, pages, getPage, posts, teamPages, navigation, crumbs };
}
