export type Testimonial = {
  name: string;
  location: string;
  quote: string;
};

const ottawa = "Ottawa, ON";

export const testimonials: Testimonial[] = [
  {
    name: "Ernie Minichilli",
    location: ottawa,
    quote:
      "I was incredibly impressed with Tom and his entire team. From start to finish, I felt extremely well taken care of. Everyone was welcoming, helpful, and friendly. The pricing was very fair, and there were no surprises. I highly recommend Renew to anyone looking for exceptional care.",
  },
  {
    name: "Ken Miller",
    location: ottawa,
    quote:
      "Talk about life changing! Tom and his team changed my life. I can eat anything I want, no more pain, and never see that look in people's eyes when they see your teeth. Thank you for a truly life changing experience!",
  },
  {
    name: "Bob Cousins",
    location: ottawa,
    quote:
      "I met Tom and his staff 14 years ago. He took me on with a very difficult case but never blinked an eye. He kept me informed and made sure my quality of life was maintained throughout the process. Today, thanks to Tom and his staff, I have that perfect healthy smile.",
  },
  {
    name: "Tim Appleby",
    location: ottawa,
    quote:
      "I could not be happier with my experience with Renew! Tom and his staff are very knowledgeable and an absolute pleasure to deal with. They even went above and beyond for me during an emergency after-hours issue. If you are considering implants, I highly recommend Tom and his team.",
  },
  {
    name: "Chantal G.",
    location: ottawa,
    quote:
      "I got to know Tom from bringing my mother to his office. When that time came for me, I knew who I wanted to deal with. In 2016, Tom made my lower denture on implants, and I've been extremely satisfied ever since. Next to great work, what I appreciate most is the service. Tom is friendly, welcoming, and genuinely cares. I feel like family.",
  },
  {
    name: "Nick B.",
    location: ottawa,
    quote:
      "The level of care and commitment I've received from Renew is beyond anything I have ever received from any other denture clinic. Tom has revived my smile and confidence. I honestly feel like family! I 100% recommend Renew.",
  },
  {
    name: "Stephen E.",
    location: ottawa,
    quote:
      "Tom Szarski and his staff were excellent. I'm so happy I had this procedure done. I should have done this years ago.",
  },
  {
    name: "Eric B.",
    location: ottawa,
    quote:
      "Tom recommended a new procedure to install a removable bar overdenture at his new Renew Implant Centre. I am extremely satisfied with the result. I highly recommend Tom Szarski and his friendly, professional and efficient team at his new state of the art clinic.",
  },
  {
    name: "Bruce L.",
    location: ottawa,
    quote:
      "The consultation was so easy and seamless. They scanned me with a new high tech machine and the fit turned out perfectly.",
  },
  {
    name: "G Z.",
    location: ottawa,
    quote:
      "New implants, new teeth for a new smile. A plan very well executed by the Tom/Alex team that left another happy customer.",
  },
];

export function getTestimonials(names?: string[]) {
  if (!names) return testimonials;
  return names
    .map((name) => testimonials.find((quote) => quote.name === name))
    .filter((quote): quote is Testimonial => quote !== undefined);
}
