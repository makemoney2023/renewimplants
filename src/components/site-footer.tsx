import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { getPrimaryNav } from "@/content/nav";
import { footerNote, legalLinks, site } from "@/content/site";

export function SiteFooter() {
  const nav = getPrimaryNav();

  return (
    <footer className="site-footer">
      <BrandMark className="brand-footer" />
      <nav className="footer-nav" aria-label="Footer">
        {nav.map((item) => (
          <div key={item.href}>
            <Link href={item.href}>{item.label}</Link>
            {item.children.map((child) => (
              <Link href={child.href} key={child.href}>
                {child.label}
              </Link>
            ))}
          </div>
        ))}
        <div>
          {legalLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="footer-nap">
        <p>
          <a href={site.mapHref} rel="noreferrer">
            {site.address}
          </a>
        </p>
        <p>
          <a href={site.phone.href}>{site.phone.label}</a> ·{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <p>
          {site.hours.map((entry) => `${entry.day}: ${entry.time}`).join(" · ")}
        </p>
      </div>
      <p>{footerNote}</p>
      <p>
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}
