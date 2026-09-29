import type { Testimonial } from "@/content/testimonials";

export function TestimonialList({
  quotes,
  heading = "Don't take our word for it",
}: {
  quotes: Testimonial[];
  heading?: string;
}) {
  if (quotes.length === 0) return null;

  return (
    <article className="testimonial-list">
      <h2>{heading}</h2>
      <div className="testimonial-grid">
        {quotes.map((quote) => (
          <figure key={`${quote.name}-${quote.quote.slice(0, 24)}`}>
            <blockquote>{quote.quote}</blockquote>
            <figcaption>
              <strong>{quote.name}</strong>
              <span>{quote.location}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </article>
  );
}
