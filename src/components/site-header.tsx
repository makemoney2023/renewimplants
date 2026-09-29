import Link from "next/link";
import { Menu, Phone } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { getPrimaryNav } from "@/content/nav";
import { site } from "@/content/site";

export function SiteHeader() {
  const nav = getPrimaryNav();

  return (
    <header className="site-header">
      <BrandMark />
      <nav className="site-nav" aria-label="Primary navigation">
        {nav.map((item) => (
          <div className="nav-item" key={item.href}>
            <Link href={item.href}>{item.label}</Link>
            <div className="nav-panel">
              <div className="nav-panel-card" role="group" aria-label={item.label}>
                {item.children.map((child) => (
                  <Link href={child.href} key={child.href}>
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>
      <div className="site-actions">
        <a className="header-phone" href={site.phone.href}>
          <Phone aria-hidden="true" />
          {site.phone.label}
        </a>
        <Button asChild>
          <Link href={site.primaryCta.href}>Free consultation</Link>
        </Button>
      </div>
      <details className="site-menu">
        <summary aria-label="Open navigation">
          <Menu aria-hidden="true" />
        </summary>
        <nav aria-label="Mobile navigation">
          {nav.map((item) => (
            <div className="menu-group" key={`mobile-${item.href}`}>
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
          <Link href={site.primaryCta.href}>Free consultation</Link>
        </nav>
      </details>
    </header>
  );
}
