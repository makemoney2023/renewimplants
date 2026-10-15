import Link from "next/link";
import { catalog, site } from "@/content/load";
import { mediaUrl } from "@shell/lib/media";

export function SiteFooter() {
  const nav = catalog.navigation();
  const legal = catalog.pages.filter((page) => page.kind === "legal");

  return (
    <footer>
      <Link className="brand" href="/">
        <img src={mediaUrl(site.logo)} alt="" />
      </Link>
      <nav className="footer-nav" aria-label="Footer">
        {nav.map((item) => (
          <div key={`${item.label}-${item.href}`}>
            <Link href={item.href}>{item.label}</Link>
            {item.children.map((child) => (
              <Link href={child.href} key={child.href}>
                {child.label}
              </Link>
            ))}
          </div>
        ))}
        {legal.length > 0 ? (
          <div>
            {legal.map((page) => (
              <Link href={page.path} key={page.path}>
                {page.title}
              </Link>
            ))}
          </div>
        ) : null}
      </nav>
      <div className="footer-nap">
        <p>
          <a href={site.mapHref}>{site.address.label}</a>
        </p>
        <p>
          <a href={site.phone.href}>{site.phone.label}</a>
          {site.fax ? ` · Fax ${site.fax}` : ""} · <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <p>{site.hours.map((entry) => `${entry.day}: ${entry.time}`).join(" · ")}</p>
        {site.sameAs.length > 0 ? (
          <p>
            {site.sameAs.map((href) => (
              <a key={href} href={href} rel="noreferrer">
                {href.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
              </a>
            ))}
          </p>
        ) : null}
      </div>
      <p>
        © {new Date().getFullYear()} {site.legalName}
      </p>
    </footer>
  );
}
