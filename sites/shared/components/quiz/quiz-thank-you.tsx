import Link from "next/link";
import { site } from "@/content/load";
import { h1Class } from "../blocks";
import { clinicQuizHref, modifierContent, parseResultQuery, resultContent } from "../../quiz/result";
import { QuizCallLink } from "./quiz-call-link";

export function QuizThankYou({
  searchParams,
}: {
  searchParams: { path?: string | string[]; m?: string | string[] };
}) {
  const { path, modifiers } = parseResultQuery(searchParams);
  const copy = path ? resultContent[path] : null;
  const links = (copy?.links ?? [])
    .map((link) => {
      const href = clinicQuizHref(site.id, link.href);
      return href ? { label: link.label, href } : null;
    })
    .filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <main id="main-content" tabIndex={-1} className="content-page quiz-thank-you">
      <section className="content-body">
        <article className="prose">
          <p className="section-label">Thanks — we&apos;ve got your answers</p>
          <h1 className={h1Class(copy ? copy.title : "Your results are on their way")}>
            {copy ? copy.title : "Your results are on their way"}
          </h1>
          {copy ? (
            <>
              <p>{copy.summary}</p>
              <p>{copy.detail}</p>
            </>
          ) : null}
          <p>
            A member of the {site.name} team will reach out soon. Prefer to talk now? Call {site.phone.label} or
            visit us at {site.address.label}.
          </p>
          <div className="quiz-thank-you-actions">
            <QuizCallLink resultPath={path} />
          </div>
          {links.length > 0 ? (
            <ul>
              {links.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
        {modifiers.map((modifier) => {
          const note = modifierContent[modifier];
          const href = note.link ? clinicQuizHref(site.id, note.link.href) : null;
          return (
            <article className="prose" key={modifier}>
              <h2>{note.title}</h2>
              <p>{note.body}</p>
              {note.link && href ? (
                <p>
                  <Link href={href}>{note.link.label}</Link>
                </p>
              ) : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}
