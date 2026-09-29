import type { Metadata } from "next";
import Link from "next/link";
import { QuizCallLink } from "@/components/quiz/quiz-call-link";
import { RouteActions } from "@/components/route-actions";
import { site } from "@/content/site";
import { modifierContent, parseResultQuery, resultContent } from "@/lib/quiz/result";

export const metadata: Metadata = {
  title: `Your implant quiz results | ${site.name}`,
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ path?: string | string[]; m?: string | string[] }> };

export default async function QuizThankYouPage({ searchParams }: PageProps) {
  const { path, modifiers } = parseResultQuery(await searchParams);
  const copy = path ? resultContent[path] : null;

  return (
    <main id="main-content" tabIndex={-1} className="content-page quiz-thank-you">
      <section className="content-body">
        <div className="content-sections">
          <article>
            <p className="section-label">Thanks — we&apos;ve got your answers</p>
            <h1>{copy ? copy.title : "Your results are on their way"}</h1>
            {copy ? (
              <>
                <p>{copy.summary}</p>
                <p>{copy.detail}</p>
              </>
            ) : null}
            <p>
              A member of our team will reach out soon. Prefer to talk now? We&apos;re happy to answer questions
              by phone.
            </p>
            <div className="quiz-thank-you-actions">
              <QuizCallLink resultPath={path} />
            </div>
          </article>

          {modifiers.map((modifier) => {
            const note = modifierContent[modifier];
            return (
              <article key={modifier}>
                <h2>{note.title}</h2>
                <p>{note.body}</p>
                {note.link ? (
                  <p>
                    <Link className="text-link" href={note.link.href}>
                      {note.link.label}
                    </Link>
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
        <RouteActions links={copy ? copy.links : [{ label: site.primaryCta.label, href: site.primaryCta.href }]} />
      </section>
    </main>
  );
}
