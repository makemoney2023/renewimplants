import type { RouteFaq } from "@/content/routes";

export function FaqList({
  faqs,
  heading = "Questions, answered",
}: {
  faqs: RouteFaq[];
  heading?: string;
}) {
  if (faqs.length === 0) return null;

  return (
    <article className="faq-list">
      <h2>{heading}</h2>
      <div>
        {faqs.map((faq) => (
          <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </article>
  );
}
