import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FaqList } from "@/components/faq-list";
import { RouteActions } from "@/components/route-actions";
import { TestimonialList } from "@/components/testimonial-list";
import { getPrimaryNav } from "@/content/nav";
import type { RouteContent } from "@/content/routes";
import { site } from "@/content/site";

export function DocumentPage({ page }: { page: RouteContent }) {
  return (
    <main className="content-page">
      <section className="content-hero">
        <div className="content-hero-copy">
          <p className="section-label">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
        <div className="content-hero-photo">
          <Image
            src={page.image}
            alt=""
            fill
            priority
            sizes="(max-width: 800px) 100vw, 48vw"
          />
        </div>
      </section>

      <section className="content-body">
        <div className="content-sections">
          {page.slug === "sitemap" ? <SitemapIndex /> : null}
          {page.hours ? (
            <article>
              <h2>Hours</h2>
              <dl className="office-hours">
                {page.hours.map((entry) => (
                  <div key={entry.day}>
                    <dt>{entry.day}</dt>
                    <dd>{entry.time}</dd>
                  </div>
                ))}
              </dl>
              {page.mapHref ? (
                <p>
                  <a className="text-link" href={page.mapHref} rel="noreferrer">
                    {site.address}
                  </a>
                </p>
              ) : null}
            </article>
          ) : null}
          {page.sections.map((section) => (
            <article key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </article>
          ))}
          {page.quotes?.length ? <TestimonialList quotes={page.quotes} /> : null}
          {page.faqs?.length ? (
            <FaqList
              faqs={page.faqs}
              heading={page.slug === "faq" ? "Every question we get asked" : undefined}
            />
          ) : null}
        </div>
        <RouteActions links={page.links} />
      </section>

      <footer className="content-footer">
        <Link href="/">
          <ArrowLeft aria-hidden="true" />
          Back to home
        </Link>
        <p>{site.address}</p>
      </footer>
    </main>
  );
}

function SitemapIndex() {
  const nav = getPrimaryNav();

  return (
    <article>
      <h2>All pages</h2>
      <div className="sitemap-grid">
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
          <Link href="/">Home</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="/terms">Terms of use</Link>
        </div>
      </div>
    </article>
  );
}
