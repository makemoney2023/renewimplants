import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { ScrollWorld } from "@/components/scroll-world";
import { getRouteContent } from "@/content/routes";
import { HOME_FAQ_QUESTIONS, buildHomeGraph } from "@/lib/site-schema";

export default function Home() {
  const published = getRouteContent("faq")?.faqs ?? [];
  const faqs = HOME_FAQ_QUESTIONS.flatMap((question) => {
    const match = published.find((faq) => faq.question === question);
    return match ? [match] : [];
  });

  return (
    <>
      <ScrollWorld />
      <section className="home-faq">
        <FaqList faqs={faqs} heading="Common questions" />
      </section>
      <JsonLd data={buildHomeGraph(faqs)} />
    </>
  );
}
