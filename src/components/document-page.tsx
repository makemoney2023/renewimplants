import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClusterArticles } from "@/components/blog/cluster-articles";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqList } from "@/components/faq-list";
import { RouteActions } from "@/components/route-actions";
import { TestimonialList } from "@/components/testimonial-list";
import { getPrimaryNav } from "@/content/nav";
import type { RouteContent } from "@/content/routes";
import { site, sitemapExtras } from "@/content/site";
import { routeCrumbs } from "@/lib/site-schema";

export function DocumentPage({ page, children }: { page: RouteContent; children?: ReactNode }) {
  return (
    <main id="main-content" tabIndex={-1} className="content-page">
      <section className="content-hero">
        <div className="content-hero-copy">
          <Breadcrumbs crumbs={routeCrumbs(page)} />
          <p className="section-label">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
        <div className="content-hero-photo">
          <Image
            src={page.image}
            alt={page.title}
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
          {children}
          {page.photos?.length ? (
            <div className="gallery-grid">
              {page.photos.map((photo) => (
                <figure key={photo.src}>
                  <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 50vw, 16rem" />
                </figure>
              ))}
            </div>
          ) : null}
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

      <ClusterArticles slug={page.slug} />

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
          {sitemapExtras.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
