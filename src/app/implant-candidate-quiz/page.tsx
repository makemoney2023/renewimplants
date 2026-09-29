import type { Metadata } from "next";
import { ExtractionTable } from "@/components/blog/mdx-components";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { QuizFlow } from "@/components/quiz/quiz-flow";
import { site } from "@/content/site";
import { QUIZ_PATH } from "@/lib/quiz/constants";
import { buildQuizPageGraph, quizLanding } from "@/lib/quiz/landing";

export const metadata: Metadata = {
  title: `${quizLanding.title} | ${site.name}`,
  description: quizLanding.description,
  alternates: { canonical: QUIZ_PATH },
  openGraph: { title: quizLanding.title, description: quizLanding.description, url: QUIZ_PATH, type: "website" },
};

export default function ImplantCandidateQuizPage() {
  return (
    <main id="main-content" tabIndex={-1} className="content-page quiz-page">
      <section className="content-hero quiz-hero">
        <div className="content-hero-copy">
          <p className="section-label">Free 2-minute quiz</p>
          <h1>Am I a candidate for dental implants?</h1>
          <p>{quizLanding.answer}</p>
        </div>
        <div className="quiz-slot">
          <QuizFlow />
        </div>
      </section>

      <section className="content-body">
        <div className="content-sections">
          <article>
            <h2>What does the quiz ask, and why?</h2>
            <ExtractionTable {...quizLanding.table} />
          </article>
          <FaqList faqs={quizLanding.faqs} heading="Questions about the quiz" />
        </div>
      </section>
      <JsonLd data={buildQuizPageGraph()} />
    </main>
  );
}
