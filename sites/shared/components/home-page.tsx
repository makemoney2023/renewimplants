import Link from "next/link";
import { catalog, site } from "@/content/load";
import { mediaUrl } from "@shell/lib/media";
import type { ClinicPage } from "@shell/types";
import { Blocks, h1Class, Hours, videoMode } from "./blocks";
import { QuizCta } from "./quiz/quiz-cta";

export function HomePage({ page }: { page: ClinicPage }) {
  const contact = catalog.navigation().find((item) => /contact/i.test(item.label));
  const interview = page.video && videoMode(page.video) === "interview";

  return (
    <main id="main-content" tabIndex={-1}>
      {interview ? (
        <section className="home-split">
          <div className="home-split-copy">
            <p className="section-label">{site.address.locality}</p>
            <h1 className={h1Class(page.h1)}>{page.h1}</h1>
            {page.description ? <p>{page.description}</p> : null}
            <div className="hero-actions">
              <a className="button button-primary" href={site.phone.href}>
                Call {site.phone.label}
              </a>
              {contact ? (
                <Link className="button button-on-dark" href={contact.href}>
                  {contact.label}
                </Link>
              ) : null}
            </div>
          </div>
          <div className="home-split-player">
            <video
              controls
              preload="metadata"
              poster={page.hero ? mediaUrl(page.hero) : undefined}
              src={mediaUrl(page.video)}
            />
          </div>
        </section>
      ) : (
        <section className="home-hero">
          {page.video ? (
            <div className="home-hero-media">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={page.hero ? mediaUrl(page.hero) : undefined}
                src={mediaUrl(page.video)}
              />
            </div>
          ) : page.hero ? (
            <div className="home-hero-media">
              <img src={mediaUrl(page.hero)} alt="" />
            </div>
          ) : null}
          <div className="home-hero-scrim" />
          <div className="home-hero-copy">
            <p className="section-label">{site.address.locality}</p>
            <h1 className={h1Class(page.h1)}>{page.h1}</h1>
            {page.description ? <p>{page.description}</p> : null}
            <div className="hero-actions">
              <a className="button button-primary" href={site.phone.href}>
                Call {site.phone.label}
              </a>
              {contact ? (
                <Link className="button button-on-dark" href={contact.href}>
                  {contact.label}
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      )}
      <div className="home-section">
        <QuizCta
          source="home"
          medium="page"
          campaign="home"
          intro="Not sure if implants are worth exploring? Nine questions, then a personalized next step."
        />
        <article className="prose">
          <Blocks site={site} page={page} blocks={page.blocks} />
        </article>
        <aside className="page-aside" style={{ marginTop: "2rem" }}>
          <div className="aside-card">
            <h2>Hours</h2>
            <Hours rows={site.hours} />
          </div>
        </aside>
      </div>
    </main>
  );
}
