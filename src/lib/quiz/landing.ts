import type { RouteFaq } from "@/content/routes";
import { absoluteUrl, buildBreadcrumbNode, buildFaqNode, schemaIds } from "../site-schema";
import { QUIZ_NAME, QUIZ_PATH } from "./constants";

export const quizLanding = {
  title: "Am I a Candidate for Dental Implants? Free 2-Minute Quiz",
  description:
    "Answer nine quick questions about your teeth, comfort, and timing to see which implant options people in your situation explore in Orléans and Ottawa.",
  answer:
    "Most adults who are missing teeth, wearing dentures, or living with failed dental work can be assessed for implants. Bone levels, gum health, and medical history decide the final answer — and only an exam with a 3D scan can confirm it. This quiz shows which path people in a similar situation usually explore, so your free consultation starts with the right questions.",
  table: {
    caption: "What the quiz asks and why it matters",
    columns: ["Question", "Why we ask"],
    rows: [
      ["Your teeth today", "Sets the likely path: individual implants, a full arch, or a denture alternative."],
      ["Upper, lower, or both", "Each jaw has different bone and anatomy to plan around."],
      ["What bothers you most", "Tells the team what a good result looks like for you."],
      ["How long it's been", "Bone changes after tooth loss, so timing shapes the plan."],
      ["Health factors (optional)", "Smoking, diabetes, and blood thinners are planned for, not automatic deal-breakers."],
      ["Comfort with dental visits", "Flags when sedation options should be part of the conversation."],
      ["How you'd like to pay", "Lets the team check CDCP, insurance, or payment plan options ahead of time."],
      ["Your timeline", "Helps schedule a consultation that fits when you want to start."],
      ["Where you live", "Lets us plan visits so travel stays to a minimum."],
    ],
  },
  faqs: [
    {
      question: "Is the implant candidate quiz a diagnosis?",
      answer:
        "No. The quiz points to the options people in a similar situation usually explore. Only an exam and a 3D scan of your jawbone at a consultation can confirm whether implants suit you.",
    },
    {
      question: "How long does the quiz take?",
      answer:
        "About two minutes. There are nine multiple-choice questions, and the health question is optional.",
    },
    {
      question: "What happens after I send my results?",
      answer:
        "A member of our team follows up by your preferred method — call, text, or email — to answer questions and offer a free consultation that includes a 3D scan.",
    },
    {
      question: "What do you do with my answers?",
      answer:
        "We use your answers and contact details only to follow up about your consultation. We never sell them. Marketing emails or texts are sent only if you tick the consent box.",
    },
    {
      question: "Can I still get implants after years of wearing dentures?",
      answer:
        "Often, yes. Years of denture wear doesn't automatically rule implants out. Your bone is checked on a 3D scan, and angled implants are one way to work with the bone you have.",
    },
  ] satisfies RouteFaq[],
};

export function buildQuizPageGraph() {
  const pageUrl = absoluteUrl(QUIZ_PATH);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: QUIZ_NAME,
        description: quizLanding.description,
        inLanguage: "en-CA",
        isPartOf: { "@id": schemaIds.website },
        about: { "@id": schemaIds.practice },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      },
      buildBreadcrumbNode(pageUrl, [{ name: QUIZ_NAME, path: QUIZ_PATH }]),
      buildFaqNode(pageUrl, quizLanding.faqs),
    ],
  };
}
