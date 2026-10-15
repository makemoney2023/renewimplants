import type { Metadata } from "next";
import { QuizPage } from "@shell/components/quiz/quiz-page";
import { QUIZ_PATH } from "@shell/quiz/paths";
import { site } from "@/content/load";

const title = `Am I a Candidate for Dental Implants? | ${site.name}`;
const description = `Answer nine quick questions about your teeth, comfort, and timing to see which implant options people in your situation explore in ${site.address.locality}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: QUIZ_PATH },
  openGraph: { title, description, url: QUIZ_PATH, type: "website" },
};

export default function ImplantCandidateQuizPage() {
  return <QuizPage />;
}
