import Link from "next/link";
import { Menu, Phone } from "lucide-react";
import { catalog, site } from "@/content/load";
import { mediaUrl } from "@shell/lib/media";

export function SiteHeader() {
  const nav = catalog.navigation();
  const contact = nav.find((item) => /contact/i.test(item.label));

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <img src={mediaUrl(site.logo)} alt={site.name} />
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {nav.map((item) => (
          <div className="nav-item" key={`${item.label}-${item.href}`}>
            <Link href={item.href}>{item.label}</Link>
            {item.children.length > 0 ? (
              <div className="nav-panel">
                <div className="nav-panel-card" role="group" aria-label={item.label}>
                  {item.children.map((child) => (
                    <Link href={child.href} key={child.href}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </nav>
      <div className="site-actions">
        <a className="header-phone" href={site.phone.href}>
          <Phone aria-hidden="true" />
          {site.phone.label}
        </a>
        {contact ? (
          <Link className="button button-primary" href={contact.href}>
            {contact.label}
          </Link>
        ) : null}
      </div>
      <details className="site-menu">
        <summary aria-label="Open navigation">
          <Menu aria-hidden="true" />
        </summary>
        <nav aria-label="Mobile navigation">
          {nav.map((item) => (
            <div className="menu-group" key={`mobile-${item.label}`}>
              <Link className="menu-parent" href={item.href}>
                {item.label}
              </Link>
              {item.children.map((child) => (
                <Link href={child.href} key={`mobile-${child.href}`}>
                  {child.label}
                </Link>
              ))}
            </div>
          ))}
          <a href={site.phone.href}>Call {site.phone.label}</a>
        </nav>
      </details>
    </header>
  );
}
