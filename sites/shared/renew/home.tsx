import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { ScrollWorld } from "@/components/scroll-world";
import { getRouteContent } from "@/content/routes";
import { site } from "@/content/site";
import { HOME_FAQ_QUESTIONS, buildHomeGraph } from "@/lib/site-schema";
import { postCards } from "@clinic/profile/blog";

export const metadata = {
  title: site.name,
  description: site.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  const published = getRouteContent("faq")?.faqs ?? [];
  const faqs = HOME_FAQ_QUESTIONS.flatMap((question) => {
    const match = published.find((faq) => faq.question === question);
    return match ? [match] : [];
  });

  return (
    <>
      <ScrollWorld posts={postCards.slice(0, 3)} />
      <section className="home-faq">
        <FaqList faqs={faqs} heading="Common questions" />
      </section>
      <JsonLd data={buildHomeGraph(faqs)} />
    </>
  );
}
