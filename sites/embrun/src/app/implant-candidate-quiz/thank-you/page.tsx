import type { Metadata } from "next";
import { QuizThankYou } from "@shell/components/quiz/quiz-thank-you";
import { QUIZ_THANK_YOU_PATH } from "@shell/quiz/paths";
import { site } from "@/content/load";

export const metadata: Metadata = {
  title: `Your implant quiz results | ${site.name}`,
  robots: { index: false, follow: false },
  alternates: { canonical: QUIZ_THANK_YOU_PATH },
};

type PageProps = { searchParams: Promise<{ path?: string | string[]; m?: string | string[] }> };

export default async function QuizThankYouPage({ searchParams }: PageProps) {
  return <QuizThankYou searchParams={await searchParams} />;
}
