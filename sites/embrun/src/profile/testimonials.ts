export type Testimonial = { name: string; location: string; quote: string };

export const testimonials: Testimonial[] = [];

export function getTestimonials(names?: readonly string[]) {
  if (!names || names.length === 0) return testimonials;
  return names.flatMap((name) => {
    const match = testimonials.find((quote) => quote.name === name);
    return match ? [match] : [];
  });
}
