export type Testimonial = { name: string; location: string; quote: string };

export const testimonials: Testimonial[] = [
  {
    name: "Jacques Robinson",
    location: "Orléans, ON",
    quote: "Extremely happy with Denturist Tomasz Szarski and his staff , He is truly a very skilled professional . Him and his staff are the best at taking care of you and addressing your concerns .",
  },
  {
    name: "Douglas Thom",
    location: "Orléans, ON",
    quote: "I am very much impressed with the level of service I have recently received at Orleans Denture Clinic. I received my new set of dentures and I am extremely happy with all aspects of the process.",
  },
  {
    name: "Tracey Davey",
    location: "Orléans, ON",
    quote: "I got my dentures from here and the denturist and his staff are amazing. Anytime I have a problem they take me right away and his prices are affordable. I recommend this place for anyone who need dentures.",
  },
  {
    name: "Lorraine Menard",
    location: "Orléans, ON",
    quote: "I wouldn't dare go anywhere else! I never had any problems with my partial plate. Highly recommend it to everyone.",
  },
  {
    name: "Guy Lemieux",
    location: "Orléans, ON",
    quote: "Wonderful experience, professional, friendly, caring, accommodating. My denture is perfect.",
  },
  {
    name: "Dianne Cote",
    location: "Orléans, ON",
    quote: "Always 100% satisfied. Very professional and friendly staff. My adjustment was free.....Thank you.",
  },
  {
    name: "Guillermo Michaca",
    location: "Orléans, ON",
    quote: "Great place, they make you feel very comfortable. Great staff, and very professional.",
  },
  {
    name: "Curtis Raymond",
    location: "Orléans, ON",
    quote: "I cannot recommend this team highly enough! From the first consultation to the final fitting, the level of professionalism was world-class. They took the time to explain every step of the process and ensured my new dentures fit perfectly. The craftsmanship is incredible—they look and feel completely natural. If you want the best in the business, look no further!",
  },
  {
    name: "Larry Katz",
    location: "Orléans, ON",
    quote: "Excellent technical service and thoughtful and warm treatment from all, including denturist Tom Szarski, and the administrative and technical staff at the clinic. I lost a tooth in my old denture and had a new complete denture put in. I highly recommend this clinic.",
  },
  {
    name: "Sonya Young",
    location: "Orléans, ON",
    quote: "Tom is very thorough and very good at what he does! The staff and Tom make u feel like it’s home! Very friendly!!!My teeth r beautiful and very well put together!!! I’ve had lots of compliments!!!",
  },
  {
    name: "Howard Delnick",
    location: "Orléans, ON",
    quote: "In today's fast paced world it is increasingly difficult to find a business which truly caters to the needs of their clients. Orleans Denture Clinic is one of those rare jewels. Tom Szarski DD and his skilled, dedicated team provide a level of professional, friendly, timely service which is a step above anything I have previously encountered. I have been a patient for several years, and every visit reinforces my belief that Orleans Denture Clinic is the right choice. I highly recommend the services of this enterprise...Tom and his team will treat you right...like family.",
  },
  {
    name: "Sawab Nekiar",
    location: "Orléans, ON",
    quote: "I have been a client (more like a friend) of this clinic for a while now. The folks who work in the clinic, from receptionists to clinical assistants to everyone else, these people are very nice and professionals. My hat is off to the professionalism, courtesy and dedication to work and results of the head of the clinic, Tom, who undoubtedly knows more about dentures than anyone else I have met in Ottawa. My sincere thanks to Tom and everyone else.",
  },
];

export function getTestimonials(names?: readonly string[]) {
  if (!names || names.length === 0) return testimonials;
  return names.flatMap((name) => {
    const match = testimonials.find((quote) => quote.name === name);
    return match ? [match] : [];
  });
}
