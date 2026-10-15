import { catalog, site } from "@/content/load";
import { JsonLd } from "../json-ld";
import { absoluteUrl } from "../../lib/origin";
import { QUIZ_PATH } from "../../quiz/paths";
import { QuizFlow } from "./quiz-flow";

const faqs = [
  {
    question: "Is the implant candidate quiz a diagnosis?",
    answer:
      "No. The quiz points to the options people in a similar situation usually explore. Only an exam can confirm whether implants suit you.",
  },
  {
    question: "How long does the quiz take?",
    answer: "About two minutes. There are nine multiple-choice questions, and the health question is optional.",
  },
  {
    question: "What happens after I send my results?",
    answer: `A member of the ${site.name} team follows up by your preferred method — call, text, or email — to answer questions and offer a consultation.`,
  },
  {
    question: "What do you do with my answers?",
    answer:
      "We use your answers and contact details only to follow up about your consultation. We never sell them. Marketing emails or texts are sent only if you tick the consent box.",
  },
  {
    question: "Can I still get implants after years of wearing dentures?",
    answer:
      "Often, yes. Years of denture wear doesn't automatically rule implants out. Your denturist reviews your mouth and health history at a consultation.",
  },
];

const rows = [
  ["Your teeth today", "Sets the likely path: individual implants, a full arch, or a denture alternative."],
  ["Upper, lower, or both", "Each jaw has different bone and anatomy to plan around."],
  ["What bothers you most", "Tells the team what a good result looks like for you."],
  ["How long it's been", "Bone changes after tooth loss, so timing shapes the plan."],
  ["Health factors (optional)", "Smoking, diabetes, and blood thinners are planned for, not automatic deal-breakers."],
  ["Comfort with dental visits", "Flags when comfort and sedation should be part of the conversation."],
  ["How you'd like to pay", "Lets the team check CDCP, insurance, or payment options ahead of time."],
  ["Your timeline", "Helps schedule a consultation that fits when you want to start."],
  ["Where you live", "Lets us plan visits so travel stays to a minimum."],
];

export function QuizPage() {
  const pageUrl = absoluteUrl(QUIZ_PATH);
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: "Implant Candidate Quiz",
        description: `Nine questions about implant options at ${site.name}.`,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#practice` },
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <main id="main-content" tabIndex={-1} className="content-page quiz-page">
      <section className="content-hero quiz-hero">
        <div className="content-hero-copy">
          <p className="section-label">Free 2-minute quiz</p>
          <h1 className="h1-long">Am I a candidate for dental implants?</h1>
          <p>
            Most adults who are missing teeth, wearing dentures, or living with failed dental work can be assessed
            for implants. This quiz shows which path people in a similar situation usually explore, so a consultation
            at {site.shortName} in {site.address.locality} starts with the right questions.
          </p>
        </div>
        <div className="quiz-slot">
          <QuizFlow
            privacyPath={catalog.pages.find((page) => page.kind === "legal" && page.path.includes("privacy"))?.path}
          />
        </div>
      </section>
      <section className="content-body">
        <div className="content-sections">
          <article className="prose">
            <h2>What does the quiz ask, and why?</h2>
            <div className="extraction-table">
              <table>
                <caption>What the quiz asks and why it matters</caption>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Why we ask</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row[0]}>
                      <td>{row[0]}</td>
                      <td>{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2>Questions about the quiz</h2>
            <div className="faq-list">
              {faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </article>
        </div>
      </section>
      <JsonLd data={graph} />
    </main>
  );
}
