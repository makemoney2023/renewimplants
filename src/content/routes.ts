import { media, site, type ScrollDevice } from "./site";
import { getTestimonials, type Testimonial } from "./testimonials";

export type PageGrammar = "experience" | "document";

export type RouteLink = {
  label: string;
  href: string;
};

export type RouteSection = {
  heading: string;
  body: string;
};

export type RouteAct = {
  device: ScrollDevice;
  heading: string;
  body: string;
  image: string;
};

export type RoutePhoto = {
  src: string;
  alt: string;
};

export type RouteFaq = {
  question: string;
  answer: string;
};

export type OfficeHour = {
  day: string;
  time: string;
};

export type RouteContent = {
  slug: string;
  grammar: PageGrammar;
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  device?: ScrollDevice;
  acts?: RouteAct[];
  photos?: RoutePhoto[];
  quotes?: Testimonial[];
  faqs?: RouteFaq[];
  hours?: OfficeHour[];
  mapHref?: string;
  sections: RouteSection[];
  links: RouteLink[];
};

const consult = { label: site.primaryCta.label, href: site.primaryCta.href };
const pricing = { label: "See pricing and financing", href: "/pricing" };
const call = { label: `Call ${site.phone.label}`, href: site.phone.href };
const email = { label: "Email the clinic", href: `mailto:${site.email}` };

const oneRoof =
  "At Renew, your surgeon, your denturist, and your lab all work together under one roof. Dr. Alex places the implants. Tom designs and fits your teeth. Our onsite lab fabricates everything right here with a PM7 milling machine, Asiga digital printers, and 3Shape scanners.";

const coverageAnswer =
  "Yes. We accept the Canadian Dental Care Plan (CDCP), all major insurance providers, and offer direct billing. We also have in-house financing options to help make treatment accessible.";

const routes: RouteContent[] = [
  {
    slug: "contact-us",
    grammar: "document",
    eyebrow: "Orléans, Ottawa",
    title: "Let's start with a conversation",
    intro:
      "Book your free, no-obligation consultation. We'll listen, answer your questions, and help you figure out what's next — at your pace.",
    image: media.heroConsult,
    hours: [...site.hours],
    mapHref: site.mapHref,
    sections: [
      {
        heading: "We'll call you back",
        body: "One of our team members will reach out — usually within the same business day — to chat briefly about what's going on and schedule your free consultation.",
      },
      {
        heading: "Your free consultation",
        body: "When you come in, we'll sit down, listen to your concerns, and do a quick assessment using 3D scanning. You'll leave with a clear treatment plan and an all-inclusive price — no obligation.",
      },
      {
        heading: "You decide",
        body: "Take the plan home, think it over, and move forward when you're ready. There's no pressure, no expiry date, and no sales follow-ups. We're here whenever you are.",
      },
      {
        heading: "Before you book",
        body: "All referrals accepted. CDCP and all major insurance providers accepted, with direct billing available. Home visits are available for patients who need them, and free consultations and treatment plans are included. Need urgent help? Call us directly at 613-841-6111 and we'll do our best to see you as soon as possible.",
      },
    ],
    faqs: [
      {
        question: "Is the consultation really free?",
        answer:
          "Yes — completely free with no strings attached. We'll assess your situation, explain your options, and give you a clear, all-inclusive price. No obligation to proceed.",
      },
      {
        question: "What should I bring to my consultation?",
        answer:
          "Just yourself. If you have any dental records, X-rays, or insurance information, feel free to bring them along — but they're not required. We have everything we need right here to do a thorough assessment.",
      },
      {
        question: "How long does the consultation take?",
        answer: "Typically about 30 to 45 minutes. We'll never rush you.",
      },
      {
        question: "Do you take walk-ins?",
        answer:
          "We primarily work by appointment to make sure you get the time and attention you deserve. That said, if you're having an emergency, call us directly and we'll do our best to fit you in.",
      },
      {
        question: "Do you see patients from outside Orléans?",
        answer:
          "Absolutely. We see patients from across the Ottawa region — including Rockland, Cumberland, Embrun, Gatineau, Kanata, and beyond.",
      },
    ],
    links: [call, email, { label: "Get directions", href: site.mapHref }],
  },
  {
    slug: "pricing",
    grammar: "document",
    eyebrow: "Pricing and financing",
    title: "Straight answers. Fair pricing. No surprises.",
    intro:
      "We believe you deserve to know exactly what your treatment will cost — before anything begins. No hidden fees. No surprise bills. Just one clear price.",
    image: media.snapOn,
    quotes: getTestimonials(["Ernie Minichilli", "Eric B."]),
    sections: [
      {
        heading: "Why we don't list prices on this page",
        body: "Every patient's case is different. The condition of your teeth, the amount of bone you have, the type of restoration you need — all of these affect the final cost. What we can promise is this: when you come in for your free consultation, you'll leave with a complete, all-inclusive price. No guessing. No surprise bills after the fact.",
      },
      {
        heading: "Everything is included — no add-ons, no extras",
        body: "One number covers the free initial consultation, 3D scans and digital imaging, sedation when applicable, lab work designed and milled in our onsite lab, temporary teeth if needed, and your follow-ups. Because our lab handles everything in-house, we're often able to offer pricing that's more competitive than clinics that outsource their work.",
      },
      {
        heading: "We work with your coverage — so you don't have to",
        body: "We accept the Canadian Dental Care Plan (CDCP) and all major dental insurance providers in Canada. Our staff handles the paperwork and submits claims directly on your behalf. Wherever possible we bill your insurer directly, so your out-of-pocket costs are clear from day one.",
      },
      {
        heading: "Financing that works for you — not against you",
        body: "Cost shouldn't be the thing standing between you and a smile you can trust. We offer in-house payment plans designed to make treatment accessible — without the stress of third-party lenders or credit checks. If you're ready for treatment, we'll find a way to make it work.",
      },
    ],
    faqs: [
      {
        question: "How much do All-on-4 dental implants cost?",
        answer:
          "The cost varies depending on your specific case — the number of implants needed, the type of restoration, and whether sedation is required. During your free consultation, you'll receive a complete, all-inclusive price with no hidden fees.",
      },
      {
        question: "Do you accept the Canadian Dental Care Plan (CDCP)?",
        answer:
          "Yes, we do. Our office team is experienced with CDCP claims and will help ensure your coverage is applied correctly. We also accept all major insurance providers and offer direct billing.",
      },
      {
        question: "Do you offer financing or payment plans?",
        answer:
          "Yes. We offer in-house financing options to help make treatment accessible. Our team will work with you to find a payment plan that fits your budget — no third-party lenders and no stress.",
      },
      {
        question: "Is the consultation free?",
        answer:
          "Yes — your first consultation is completely free, with no obligation. We'll assess your situation, explain your options, and give you a clear price. You're free to take that information home and decide on your own timeline.",
      },
      {
        question: "Why don't you list prices online?",
        answer:
          "Because every patient's needs are different, and we don't believe in giving you a number that might not apply to your case. We'd rather sit down with you, understand your situation, and give you one honest, all-inclusive price — face to face.",
      },
    ],
    links: [
      { label: "Get your custom quote", href: "/contact-us" },
      { label: "See what to expect", href: "/what-to-expect" },
    ],
  },
  {
    slug: "meet-your-dentist",
    grammar: "experience",
    eyebrow: "The people behind your smile",
    title: "Meet Tom Szarski, DD",
    intro:
      "At Renew, you're not a file number. You're a person — and you'll be treated like family from the moment you walk in.",
    image: media.tom,
    device: "split",
    acts: [
      {
        device: "split",
        heading: "Twenty years of renewing smiles — four generations in dentistry",
        body: "Tom is an award-winning Denturist who owns and operates Renew Implant Centre and Orléans Denture Clinic in Ottawa's east end. He graduated from George Brown College in 2003 at the top of his class, receiving the A.J. McGuire Award, and has sat on the Denturist Association of Ontario Board of Directors since 2017.",
        image: media.tom,
      },
      {
        device: "kinetic",
        heading: "It's not just what he does — it's how he does it",
        body: "He listens first. He tells you the truth — if something can be saved, he'll say so; if it can't, he'll explain why. And he treats you like family. Ask any long-time patient and they'll tell you Renew doesn't feel like a clinic.",
        image: media.team,
      },
      {
        device: "iris",
        heading: "Dr. Alex places the implants — right here, in the same building",
        body: "While Tom designs and fits your teeth, Dr. Alex handles the surgical side. Together they form the Tom/Alex team patients rave about in their reviews. No referral chain, no miscommunication between offices, no waiting weeks for someone to look at your case.",
        image: media.clinic,
      },
    ],
    quotes: getTestimonials(["Chantal G.", "Ernie Minichilli", "Bob Cousins", "Tim Appleby"]),
    sections: [
      {
        heading: "Your teeth are designed and crafted in our onsite lab",
        body: "Renew's sister clinic, Orléans Denture Clinic, operates a full onsite lab staffed by Registered Dental Technicians. The equipment includes a PM7 milling machine, Asiga Professional Series digital printers, and 3Shape scanners — all running a fully digital workflow. No outsourcing. No waiting weeks for an outside lab.",
      },
    ],
    faqs: [
      {
        question: "Is Tom a dentist or a denturist?",
        answer:
          "Tom is a licensed Denturist (DD) — a dental professional who specializes in designing, fabricating, and fitting dentures, implant-supported prosthetics, and oral appliances. He's not a dentist (DDS), but he works alongside Dr. Alex, an implant surgeon, so every aspect of your care is covered under one roof.",
      },
      {
        question: "Who places the implants?",
        answer:
          "Dr. Alex, an experienced implant surgeon, performs all implant placement at Renew. Tom handles the prosthetic side — designing and fitting your new teeth. They work together on every case.",
      },
      {
        question: "How long has Tom been practicing?",
        answer:
          "Over 20 years. Tom graduated at the top of his class from George Brown College in 2003 and has been practicing in Ottawa ever since. He's a fourth-generation dental professional.",
      },
      {
        question: "Does the team speak French?",
        answer:
          "Yes. The team at Renew provides bilingual service in English and French.",
      },
    ],
    links: [consult, { label: "See why patients choose us", href: "/why-choose-us" }],
  },
  {
    slug: "why-choose-us",
    grammar: "experience",
    eyebrow: "Why Renew",
    title: "One clinic. One team. Everything under one roof.",
    intro:
      "No referrals. No runaround. No waiting months between appointments. At Renew, your entire implant journey happens here — with a team that already knows your name.",
    image: media.clinic,
    device: "kinetic",
    acts: [
      {
        device: "kinetic",
        heading: "This isn't just another dental office",
        body: "Most patients who walk through our doors have already been to other clinics. They've been bounced between specialists, waited months for answers, and spent thousands on work that didn't last. Renew was built to be different — and you'll feel it the moment you walk in.",
        image: media.clinic,
      },
      {
        device: "panorama",
        heading: "Your implants are made right here — not in a lab across town",
        body: "Our onsite lab is run by Registered Dental Technicians using the PM7 milling machine, Asiga digital printers, and 3Shape scanners. Every restoration is designed, milled, and finished in-house — faster turnaround, better quality control, and a fit that's right the first time.",
        image: media.allOn4,
      },
      {
        device: "iris",
        heading: "A team that feels like family",
        body: "Our patients don't feel like patients — they feel like they belong. From the front desk to the treatment room, everyone at Renew treats you the way they'd want their own family treated.",
        image: media.team,
      },
    ],
    photos: [
      { src: media.clinic, alt: "The Renew treatment room" },
      { src: media.allOn4, alt: "A full-arch implant model" },
      { src: media.team, alt: "Tom with a patient" },
      { src: media.heroConsult, alt: "A consultation in progress" },
    ],
    quotes: getTestimonials(["Ernie Minichilli", "Tim Appleby", "Nick B."]),
    sections: [
      {
        heading: "Straight answers in plain English",
        body: "No jargon. No confusing treatment codes. We explain exactly what's going on, what your options are, and what everything costs — before anything begins. You'll never be surprised by a bill.",
      },
      {
        heading: "Your pace, not ours",
        body: "We don't pressure anyone into treatment. You'll get a clear plan and an honest recommendation — and then you decide when you're ready. No sales pitch. No countdown timers.",
      },
      {
        heading: "How Renew compares to a typical implant experience",
        body: "Lab work: outsourced elsewhere, a full onsite lab here. Offices: two or three locations elsewhere, one clinic start to finish here. Wait for teeth: weeks to months elsewhere, often same day here. Consultation: charged or limited elsewhere, free and no-pressure here. Follow-up care: referred out elsewhere, the same team here. Pricing: surprise bills elsewhere, all-inclusive and transparent here. Insurance: CDCP accepted, direct billing, and in-house financing here.",
      },
    ],
    faqs: [
      {
        question: "What makes Renew different from other implant clinics?",
        answer:
          "Everything happens under one roof — your consultation, surgery, lab work, and follow-ups are all done here by the same team. Our full onsite lab means faster results and better quality control, and our transparent pricing means no surprise bills.",
      },
      {
        question: "Do you accept insurance and the CDCP?",
        answer: coverageAnswer,
      },
      {
        question: "How experienced is the team?",
        answer:
          "Tom Szarski has over 20 years of experience restoring smiles in Ottawa, and his family has been in dentistry for four generations. He works alongside Dr. Alex, an experienced implant surgeon.",
      },
      {
        question: "What if I'm nervous about dental work?",
        answer:
          "You're not alone — many of our patients felt the same way before coming in. We offer sedation dentistry so you can sleep through the entire procedure, and our team is trained to support anxious patients every step of the way.",
      },
    ],
    links: [consult, { label: "See what to expect", href: "/what-to-expect" }],
  },
  {
    slug: "what-to-expect",
    grammar: "experience",
    eyebrow: "Your first visit",
    title: "No surprises. No jargon. Just a plan you can trust.",
    intro:
      "Here's exactly what happens when you visit Renew Implant Centre — from the moment you walk in to the moment you walk out smiling.",
    image: media.heroConsult,
    device: "parallax",
    acts: [
      {
        device: "parallax",
        heading: "If you've never done this before, that's perfectly fine",
        body: "Walking into a new clinic can feel overwhelming — especially if past experiences haven't been great. That's why we want you to know exactly what's going to happen before you get here. No fine print. No moment where someone hands you a bill you didn't expect.",
        image: media.heroConsult,
      },
      {
        device: "kinetic",
        heading: "You're welcomed in",
        body: "Our reception team greets you by name. The clinic is clean, modern, and recently renovated — with a comfortable waiting area and complimentary coffee and refreshments for you and anyone who comes with you.",
        image: media.clinic,
      },
      {
        device: "split",
        heading: "A real conversation, then a thorough assessment",
        body: "Tom sits down with you and listens. Then we take 3D scans and digital images of your teeth and jaw. Tom and Dr. Alex review everything together and explain what they see — in plain English, not clinical jargon.",
        image: media.team,
      },
    ],
    quotes: getTestimonials(["Tim Appleby", "Bruce L.", "Ernie Minichilli", "Eric B."]),
    sections: [
      {
        heading: "Your plan and price",
        body: "We walk you through the recommended treatment, the timeline, and one clear, all-inclusive price. You take the plan home, think about it, and decide at your own pace. There's no pressure to commit on the spot.",
      },
      {
        heading: "Before your procedure",
        body: "Once you've decided to move forward, we schedule your treatment day. If you've chosen sedation, we'll give you instructions on preparation — what to eat, when to arrive, and who to bring as your ride home.",
      },
      {
        heading: "Treatment day",
        body: "Dr. Alex places the implants, and Tom's team in the onsite lab designs and fits your new teeth — often in the same visit. You'll leave the clinic with teeth in your mouth. For most patients, this is the moment they say \"I should have done this years ago.\"",
      },
      {
        heading: "Recovery and follow-up",
        body: "Most patients manage recovery with over-the-counter medication and are back to soft foods within a day or two. Within a few months, once your implants have fully integrated, your permanent bridge is placed — and from there, it's just regular checkups.",
      },
      {
        heading: "What changes after your procedure",
        body: "You eat what you want — steak, corn on the cob, apples. You stop thinking about your teeth. And you show up differently. Patients tell us it's more than just teeth: it's confidence, energy, and showing up for things they'd been avoiding.",
      },
      {
        heading: "A quick checklist for your consultation",
        body: "Any X-rays or treatment plans from previous dentists. A list of medications you're currently taking. Your insurance card or CDCP information. A list of questions — seriously, write them down. A friend or family member, if you'd like the support. Don't worry if you don't have everything; we'll fill in the gaps together.",
      },
    ],
    faqs: [
      {
        question: "Is the consultation really free?",
        answer:
          "Yes, completely. There's no charge, no hidden assessment fee, and no obligation to move forward. We want you to have all the information you need to make the right decision — at your pace.",
      },
      {
        question: "How long does the first visit take?",
        answer:
          "Plan for about 45 minutes to an hour. That gives us time to listen, scan, assess, and walk you through your options without rushing.",
      },
      {
        question: "Do you accept insurance and the CDCP?",
        answer: coverageAnswer,
      },
      {
        question: "What if I haven't seen a dentist in years?",
        answer:
          "You're in good company. Many of our patients haven't been to a dental office in years — sometimes decades. We never judge, we never lecture, and we never make you feel bad about where your teeth are right now.",
      },
      {
        question: "Can I bring someone with me?",
        answer:
          "Absolutely. Many patients bring a spouse, a friend, or an adult child for moral support. They're welcome to sit in on the consultation and hear everything alongside you.",
      },
    ],
    links: [consult, pricing],
  },
  {
    slug: "patient-stories",
    grammar: "experience",
    eyebrow: "Patient stories and reviews",
    title: "Every smile has a story. Here are a few of ours.",
    intro:
      "These are real patients who were once right where you are — frustrated, anxious, and unsure. Today, they're smiling again. Every review is a verified Google review from a real Renew patient.",
    image: media.team,
    device: "kinetic",
    acts: [
      {
        device: "kinetic",
        heading: "Don't take our word for it — hear it from them",
        body: "Bob came to Renew with a complex case that other clinics weren't confident handling. Fourteen years later, he's still a loyal patient. Chantal first came as a caregiver for her mother, then trusted Tom with her own implants. Ken's story is one we hear often — years of pain and embarrassment, resolved in a single visit.",
        image: media.team,
      },
      {
        device: "iris",
        heading: "Your story could be next",
        body: "Every smile on this page started with one decision — to pick up the phone. Book your free consultation and find out what's possible.",
        image: media.tom,
      },
    ],
    quotes: getTestimonials(),
    sections: [],
    faqs: [
      {
        question: "Are these real reviews?",
        answer:
          "Yes — every review on this page is a verified Google review from a real Renew patient. We believe in earning trust through results, not marketing.",
      },
      {
        question: "What do patients say most often?",
        answer:
          "By far, it's \"I should have done this years ago.\" Most patients spend years dealing with pain, embarrassment, or denture frustration before finally getting implants — and they all wish they'd made the call sooner.",
      },
      {
        question: "How do I know if implants are right for me?",
        answer:
          "The best way to find out is with a free consultation. We'll do a quick assessment, talk through your options, and give you a clear, honest answer — no pressure and no obligation.",
      },
      {
        question: "What if I'm nervous?",
        answer:
          "Many of the patients featured here were nervous before their first visit. We offer sedation dentistry and a judgment-free environment designed to put even the most anxious patients at ease.",
      },
    ],
    links: [consult, { label: "See before and after cases", href: "/before-after" }],
  },
  {
    slug: "before-after",
    grammar: "experience",
    eyebrow: "Before and after",
    title: "Real patients. Real results. Real smiles.",
    intro:
      "Every case in this gallery belongs to someone who was once right where you are now — unsure, frustrated, and ready for a change. Each was completed by Tom and his team in our Orléans clinic.",
    image: media.allOn4,
    device: "kinetic",
    acts: [
      {
        device: "kinetic",
        heading: "What a new smile actually looks like",
        body: "From broken, painful teeth to confident, natural-looking smiles — every patient's journey started the same way yours can: with a free consultation.",
        image: media.allOn4,
      },
      {
        device: "split",
        heading: "Custom-designed to match you",
        body: "Every restoration is designed in our onsite lab using 3D scanning and digital milling to match your facial structure and desired appearance. The result looks, feels, and functions like natural teeth.",
        image: media.snapOn,
      },
      {
        device: "iris",
        heading: "Your transformation starts with a conversation",
        body: "Book a free, no-obligation consultation. We'll show you what's possible — with real examples, clear pricing, and zero pressure.",
        image: media.fullArch,
      },
    ],
    quotes: getTestimonials(["Ken Miller", "Nick B.", "Stephen E."]),
    sections: [
      {
        heading: "All-on-4 full arch restoration",
        body: "Full upper arch restored with All-on-4 implants. Treatment completed in one day.",
      },
      {
        heading: "Full arch dental implants",
        body: "Complete upper and lower restoration using full arch implants.",
      },
      {
        heading: "Snap-on denture alternative",
        body: "Implant-retained snap-on denture replacing failing removable dentures.",
      },
      {
        heading: "All-on-4 lower arch",
        body: "Lower arch restored with All-on-4 implants. The patient went from loose dentures to fixed, permanent teeth.",
      },
    ],
    faqs: [
      {
        question: "Are these results typical?",
        answer:
          "Every patient's case is unique, but these cases represent the kind of transformations we achieve regularly at Renew. During your free consultation, we'll assess your specific situation and show you what's realistically possible for you.",
      },
      {
        question: "How long does treatment take?",
        answer:
          "Many of our treatments — including All-on-4 — can be completed in a single day. You can walk in with broken or missing teeth and leave with a full, natural-looking smile.",
      },
      {
        question: "Will my new teeth look natural?",
        answer:
          "Absolutely. Every restoration is custom-designed in our onsite lab using 3D scanning and digital milling to match your facial structure and desired appearance.",
      },
    ],
    links: [consult, { label: "Read patient stories", href: "/patient-stories" }],
  },
  {
    slug: "dental-anxiety",
    grammar: "experience",
    eyebrow: "Scared of the dentist?",
    title: "It's okay to be scared. You won't be judged.",
    intro:
      "Whether it's been 2 years or 20 since your last visit, we've heard it all. No lectures. No guilt. Just a team that meets you exactly where you are.",
    image: media.heroConsult,
    device: "split",
    acts: [
      {
        device: "split",
        heading: "Most of our patients felt exactly the way you do right now",
        body: "Maybe it was a bad experience years ago. Maybe a dentist made you feel embarrassed about your teeth. Whatever brought you here — we don't care how long it's been or how your teeth got this way. We care about helping you move forward, at your pace, without a single lecture.",
        image: media.heroConsult,
      },
      {
        device: "kinetic",
        heading: "You don't have to be awake for any of it",
        body: "If the thought of being awake during treatment makes you anxious, you don't have to be. Sedation is administered by our experienced team in a safe, monitored environment. You'll drift off before the procedure begins and wake up when it's over — often with your new smile already in place.",
        image: media.sedation,
      },
      {
        device: "iris",
        heading: "The hardest part is making the call. We'll handle the rest.",
        body: "Start with a free, no-pressure conversation. No exam. No commitment. Just honest answers from a team that understands what you're going through.",
        image: media.clinic,
      },
    ],
    quotes: getTestimonials(["Stephen E.", "Tim Appleby", "Bob Cousins"]),
    sections: [
      {
        heading: "No judgment. No lectures. Ever.",
        body: "You'll never hear \"why did you wait so long?\" from anyone on our team. We understand that life gets in the way, fear is real, and the last thing you need is guilt.",
      },
      {
        heading: "You set the pace",
        body: "Your first visit is just a conversation. No one touches your mouth unless you say so. We explain everything before we do it, answer every question, and let you decide when — and if — you're ready to move forward.",
      },
      {
        heading: "Your first visit — no surprises, no pressure",
        body: "We just talk. If you want to look around the clinic first, that's fine too — there's coffee in the waiting room. When you're comfortable, we take a quick look using 3D scanning — no painful impressions. Then you take the information home, think it over, and decide.",
      },
    ],
    faqs: [
      {
        question: "What if I haven't been to the dentist in years?",
        answer:
          "That's completely fine — and more common than you'd think. Many of our patients haven't been in five, ten, even twenty years. No one here will judge you or make you feel bad about it.",
      },
      {
        question: "Will it hurt?",
        answer:
          "With sedation dentistry, most patients don't feel a thing. You'll sleep through the procedure and wake up when it's over. Even without sedation, we use advanced techniques to keep discomfort to an absolute minimum.",
      },
      {
        question: "Can I bring someone with me?",
        answer:
          "Absolutely. You're welcome to bring a friend, family member, or anyone who helps you feel comfortable. Our waiting room is warm and welcoming for everyone.",
      },
      {
        question: "What if my teeth are really bad?",
        answer:
          "That's exactly what we specialize in. Whether you need a few implants or a full arch restoration, our team handles complex cases every day.",
      },
      {
        question: "How much will it cost?",
        answer:
          "We provide all-inclusive pricing with no surprise bills. Your free consultation includes a full cost breakdown. We also accept CDCP, insurance, and offer in-house financing.",
      },
    ],
    links: [
      { label: "Book a no-pressure consultation", href: "/contact-us" },
      { label: "Learn about sedation", href: "/services/sedation-dentistry" },
    ],
  },
  {
    slug: "faq",
    grammar: "document",
    eyebrow: "Frequently asked questions",
    title: "Got questions? We've got answers.",
    intro:
      "Everything you want to know about dental implants, our process, and what it's like to be a patient at Renew — all in plain English.",
    image: media.allOn4,
    sections: [],
    faqs: [
      {
        question: "What are All-on-4 dental implants?",
        answer:
          "All-on-4 uses four strategically placed implants to anchor a full set of fixed teeth to your jaw. Unlike removable dentures, these teeth stay in — they look, feel, and work like your own. It's one of our most popular treatments and can often be completed in a single day.",
      },
      {
        question: "What's the difference between All-on-4 and full arch implants?",
        answer:
          "All-on-4 is a specific technique that uses four implants to support a full arch of teeth. Full arch dental implants is a broader term that covers any method of replacing all teeth in the upper jaw, lower jaw, or both — including All-on-4 and other implant configurations.",
      },
      {
        question: "What are snap-on dentures?",
        answer:
          "Snap-on dentures (also called overdentures) are removable dentures that clip onto implants for a secure fit. They're a great option for patients who want more stability than traditional dentures but aren't ready for a fully fixed solution.",
      },
      {
        question: "How long do dental implants last?",
        answer:
          "The implants themselves can last a lifetime with proper care. The fixed bridge or restoration on top may need replacing after 10 to 15 years, depending on wear. We walk you through everything — including long-term care — during your free consultation.",
      },
      {
        question: "Do I need bone grafting?",
        answer:
          "In many cases, no. All-on-4 implants are specifically designed to work with the bone you already have — which means no painful grafting procedures and no months of healing. During your consultation, we'll assess your bone density and let you know exactly what's needed.",
      },
      {
        question: "Does the procedure hurt?",
        answer:
          "Most patients are surprised by how comfortable the experience is. We offer sedation dentistry so you can sleep through the entire procedure. Even patients who choose to stay awake report minimal discomfort thanks to modern techniques and local anesthesia.",
      },
      {
        question: "Can I really get new teeth in one day?",
        answer:
          "Many treatments — including All-on-4 — can be completed in a single visit. You can walk in with broken or missing teeth in the morning and leave with a full, functional smile the same day.",
      },
      {
        question: "What is recovery like?",
        answer:
          "Most patients return to their normal routine within a few days. Some mild swelling and tenderness is normal for the first 48 to 72 hours. We provide clear aftercare instructions and are always available if you have questions during recovery.",
      },
      {
        question: "What if my previous dental work failed?",
        answer:
          "That's exactly what we specialize in. Many of our patients come to us after crowns, bridges, or implants done elsewhere didn't work out. We assess what happened, explain your options, and create a plan to get things right — for good.",
      },
      {
        question: "What if I'm scared of the dentist?",
        answer:
          "You're not alone — and you won't be judged for it. Many of our patients felt the same way before their first visit. We offer sedation dentistry, a judgment-free environment, and a team that's trained to work with anxious patients.",
      },
      {
        question: "How much do dental implants cost?",
        answer:
          "The cost depends on your specific needs — the number of implants, the type of restoration, and whether sedation is required. During your free consultation, you'll receive a complete, all-inclusive price with no hidden fees.",
      },
      {
        question: "Do you accept the Canadian Dental Care Plan (CDCP)?",
        answer:
          "Yes. We accept the Canadian Dental Care Plan (CDCP). Our office team will help you navigate the process and make sure your coverage is applied to your treatment.",
      },
      {
        question: "Do you accept insurance?",
        answer:
          "Yes — we accept all major dental insurance providers in Canada and offer direct billing. Our staff handles the paperwork so you don't have to.",
      },
      {
        question: "Do you offer financing?",
        answer:
          "Yes. We offer in-house financing options designed to make treatment accessible. During your consultation, our team will walk you through all available payment options and help find a plan that fits your budget.",
      },
      {
        question: "Who is Tom Szarski?",
        answer:
          "Tom is an award-winning Denturist (DD) with over 20 years of experience. He graduated top of his class from George Brown College, is a fourth-generation dental professional, and has been serving Ottawa patients from Orléans for his entire career. He works alongside Dr. Alex, an experienced implant surgeon.",
      },
      {
        question: "What makes your onsite lab different?",
        answer:
          "Our full onsite dental lab is staffed by Registered Dental Technicians and equipped with PM7 milling machines, Asiga digital printers, and 3Shape scanners. This means your implants are designed, crafted, and fitted right here — nothing is outsourced.",
      },
      {
        question: "Where are you located?",
        answer:
          "We're at 2530 St Joseph Blvd #6, Orléans (east Ottawa). We serve patients from across the Ottawa region, including Rockland, Cumberland, Embrun, Gatineau, Kanata, and more.",
      },
      {
        question: "Do you offer home visits?",
        answer:
          "Yes. We understand that some patients can't easily travel to the clinic. Home visits are available for those who need them — just ask when you book your consultation.",
      },
    ],
    links: [consult, pricing],
  },
  {
    slug: "service-areas",
    grammar: "document",
    eyebrow: "Service areas",
    title: "Dental implant specialists serving Ottawa and eastern Ontario",
    intro:
      "Located in the heart of Orléans, Renew Implant Centre welcomes patients from across the region. Bilingual service available. Free consultations.",
    image: media.clinic,
    mapHref: site.mapHref,
    quotes: getTestimonials(["Bruce L.", "Chantal G."]),
    sections: [
      {
        heading: "Conveniently located in Orléans, east Ottawa",
        body: "We're at 2530 St Joseph Blvd #6 — easy to find, with ample free parking and a modern, recently renovated clinic that patients describe as clean, bright, and welcoming. Everything happens under one roof, so you spend less time on the road and more time enjoying your new smile.",
      },
      {
        heading: "Orléans",
        body: "Our home base. Located right on St. Joseph Blvd, we're the neighbourhood's most trusted implant clinic — with an onsite lab and a team that's been serving Orléans for over 20 years.",
      },
      {
        heading: "Ottawa East",
        body: "Just minutes from downtown Ottawa's east end. Patients from Alta Vista, Gloucester, and Beacon Hill choose Renew for our all-in-one approach and transparent pricing.",
      },
      {
        heading: "Rockland and Clarence-Rockland",
        body: "A short drive east on Highway 174. Rockland patients appreciate that everything — from consultation to final smile — happens in one location with no referrals needed.",
      },
      {
        heading: "Cumberland",
        body: "Our neighbours in Cumberland don't have to travel far for world-class implant care. We're just down the road, with free consultations and a team that treats you like family.",
      },
      {
        heading: "Embrun and Casselman",
        body: "Patients from Embrun, Russell Township, and the eastern Ontario corridor trust Renew for full arch and All-on-4 implants. Our onsite lab means fewer appointments and faster results.",
      },
      {
        heading: "Hawkesbury",
        body: "Hawkesbury residents don't need to travel to Ottawa's west end for quality implant care. Renew is conveniently located in Orléans with easy highway access.",
      },
      {
        heading: "Gatineau",
        body: "We serve francophone and anglophone patients from across the river. Our team offers bilingual service and Tom is known for his warm, patient-first approach — in both languages.",
      },
      {
        heading: "Kanata and Barrhaven",
        body: "Even patients from Ottawa's west end choose Renew. When you're getting dental implants, the quality of care matters more than the commute — and everything happens under one roof.",
      },
      {
        heading: "Service bilingue disponible — bilingual service available",
        body: "Renew Implant Centre is proud to serve both English- and French-speaking patients. Tom and his team provide care in both official languages, ensuring every patient feels comfortable and understood.",
      },
    ],
    faqs: [
      {
        question: "Do I need to live in Orléans to be a patient?",
        answer:
          "Not at all. We welcome patients from across Ottawa, eastern Ontario, and even Gatineau. Many of our patients drive 30 to 60 minutes because they value having everything done in one clinic by one team.",
      },
      {
        question: "Do you offer home visits?",
        answer:
          "Yes. Home visits are available for patients who can't easily travel to the clinic — just let us know when you book your consultation.",
      },
      {
        question: "Is there parking?",
        answer:
          "Yes — we have ample free parking right at the clinic. Our location on St. Joseph Blvd is easy to access from Highway 174 and all major routes through Orléans.",
      },
      {
        question: "Do you offer service in French?",
        answer:
          "Yes. Tom and his team are proud to serve patients in both English and French.",
      },
    ],
    links: [consult, { label: "Get directions", href: site.mapHref }],
  },
  {
    slug: "services/all-on-4-dental-implants",
    grammar: "experience",
    eyebrow: "All-on-4 dental implants",
    title: "Four implants. A full set of teeth. One day.",
    intro:
      "All-on-4 dental implants give you a complete, fixed smile — designed, crafted, and placed right here in Orléans. No denture adhesive. No months of waiting. Just teeth you can trust.",
    image: media.allOn4,
    device: "kinetic",
    acts: [
      {
        device: "kinetic",
        heading: "A full arch of teeth — anchored by just four implants",
        body: "A full set of upper or lower teeth, permanently fixed to four implants placed directly into your jawbone. Unlike removable dentures, these teeth stay in. You brush them like natural teeth and eat whatever you want. The four implants are placed at precise angles to maximize your existing bone, so most patients don't need bone grafting at all.",
        image: media.allOn4,
      },
      {
        device: "split",
        heading: "You might be a candidate if…",
        body: "Your teeth are failing — crown after crown, root canal after root canal. You're tired of dentures — the adhesive, the slipping, the diet restrictions. Or you've been told you need bone grafting. All-on-4 is designed to work with the bone you already have, which means many patients who were told \"no\" somewhere else are great candidates here.",
        image: media.heroConsult,
      },
      {
        device: "iris",
        heading: "Treatment day",
        body: "Dr. Alex places four implants into your jaw, and Tom's team attaches your new set of teeth — all in the same visit. You walk in with failing teeth and walk out with a smile you can trust.",
        image: media.clinic,
      },
    ],
    quotes: getTestimonials(["G Z.", "Ken Miller", "Stephen E."]),
    sections: [
      {
        heading: "The conversation",
        body: "You sit down with Tom and the team for a free, no-pressure consultation. We listen to what you've been through, take 3D scans of your jaw, and talk through your options in plain English. You'll leave with a clear plan and an honest price.",
      },
      {
        heading: "Your custom design",
        body: "Using digital imaging and our onsite lab, we design your new teeth before treatment day. You'll see exactly what your smile will look like and have a say in every detail — shape, shade, and fit.",
      },
      {
        heading: "Your new normal",
        body: "We follow up to make sure everything feels right. Within a few months, your implants fully integrate with your bone and your permanent bridge is placed. From there, it's just regular checkups — like having natural teeth again.",
      },
      {
        heading: "No referrals. No runaround. Everything happens here.",
        body: oneRoof,
      },
    ],
    faqs: [
      {
        question: "How long does the All-on-4 procedure take?",
        answer:
          "Most patients receive their implants and a full set of temporary teeth in a single visit. The entire process — from the first consultation to your permanent bridge — typically takes a few months, but you leave with teeth on day one.",
      },
      {
        question: "Is All-on-4 painful?",
        answer:
          "Most patients are surprised at how comfortable the experience is. We offer sedation dentistry so you can sleep through the procedure if you prefer. After treatment, mild soreness is normal and manageable with over-the-counter medication.",
      },
      {
        question: "How long do All-on-4 implants last?",
        answer:
          "The implants themselves can last a lifetime with proper care. The fixed bridge on top may need replacing after 10 to 15 years, depending on wear.",
      },
      {
        question: "Do you accept insurance and the CDCP?",
        answer: coverageAnswer,
      },
    ],
    links: [consult, pricing, { label: "See before and after cases", href: "/before-after" }],
  },
  {
    slug: "services/full-arch-dental-implants",
    grammar: "experience",
    eyebrow: "Full arch dental implants",
    title: "A complete set of teeth you never have to take out",
    intro:
      "Full arch dental implants replace every tooth — upper, lower, or both — with permanent, fixed teeth that look and feel like your own. One clinic. One team. Start to finish.",
    image: media.fullArch,
    device: "kinetic",
    acts: [
      {
        device: "kinetic",
        heading: "When it's time to replace everything — this is how it's done",
        body: "Instead of relying on removable dentures that slip, click, and limit what you can eat, full arch implants give you a permanent set of fixed teeth anchored directly to your jawbone. You brush them like normal teeth. You eat what you want. You never take them out.",
        image: media.fullArch,
      },
      {
        device: "split",
        heading: "Full arch patients come to us from every situation",
        body: "Multiple failing teeth and bills that keep adding up. Denture frustration — the clicking, the slipping, the diet restrictions. Failed dental work from another clinic. Or simply being ready for a fresh start. Full arch restoration gives you a clean slate.",
        image: media.allOn4,
      },
      {
        device: "iris",
        heading: "Full arch done right requires one team",
        body: "Full arch restoration involves surgery, prosthetic design, lab fabrication, and fitting. At most clinics that means a surgeon, a dentist, and an outside lab on different schedules. At Renew, they're all in the same building — which is how we deliver full arch results in one day.",
        image: media.clinic,
      },
    ],
    quotes: getTestimonials(["Ken Miller", "G Z.", "Bob Cousins", "Nick B."]),
    sections: [
      {
        heading: "Consultation and planning",
        body: "You sit down with Tom and Dr. Alex for a free consultation. We take 3D scans of your jaw, talk about what you've been through, and build a custom treatment plan — complete with a clear timeline and an honest, all-inclusive price.",
      },
      {
        heading: "Treatment day",
        body: "Whether it's one arch or both, your implants are placed and your new teeth are designed and attached — all in the same building, often in the same day. No outside labs. No weeks of waiting.",
      },
      {
        heading: "Life with your new smile",
        body: "After your implants fully integrate with your bone over the next few months, your permanent bridge is placed. From there, it's just regular checkups and brushing — like having natural teeth again.",
      },
    ],
    faqs: [
      {
        question: "What's the difference between full arch implants and dentures?",
        answer:
          "Dentures sit on top of your gums and are held in place by suction or adhesive. Full arch implants are permanently fixed to your jawbone — they don't come out, they don't slip, and they function like natural teeth.",
      },
      {
        question: "Can I do both upper and lower arches?",
        answer:
          "Yes. Many patients choose to restore both arches, either at the same time or in stages. We'll discuss timing and sequencing during your consultation based on your situation and preferences.",
      },
      {
        question: "How long does full arch treatment take?",
        answer:
          "Many full arch cases are completed in a single day — implants placed and teeth attached in one visit. Your permanent bridge is typically placed a few months later once the implants have fully integrated. You're never without teeth during the process.",
      },
    ],
    links: [consult, pricing, { label: "Explore All-on-4", href: "/services/all-on-4-dental-implants" }],
  },
  {
    slug: "services/same-day-dental-implants",
    grammar: "experience",
    eyebrow: "Same day dental implants",
    title: "Walk in with broken teeth. Walk out with a smile.",
    intro:
      "Same day dental implants — new teeth designed, placed, and fitted in a single visit. No months of waiting. No temporary dentures. Just results, today.",
    image: media.clinic,
    device: "split",
    acts: [
      {
        device: "split",
        heading: "Because you've already waited long enough",
        body: "You arrive in the morning with teeth that don't work. By the afternoon, you leave with a full set of fixed, natural-looking teeth — placed by Dr. Alex and designed in our onsite lab by Tom and his team. This isn't a shortcut. It's modern implant dentistry done right.",
        image: media.heroConsult,
      },
      {
        device: "kinetic",
        heading: "Three things that make same day implants a reality",
        body: "3D planning down to the millimetre — your surgery and your new teeth are planned together, in advance. An onsite lab that moves with you — your teeth are fabricated in the same building where they're placed. And a surgeon and denturist working side by side on every case.",
        image: media.clinic,
      },
      {
        device: "iris",
        heading: "Same day only works when everything's in one place",
        body: "Same day implants aren't possible at most clinics because they rely on outside labs, external surgeons, and separate appointments that stretch across weeks. At Renew, the surgeon, the denturist, and the lab all work together under one roof.",
        image: media.fullArch,
      },
    ],
    quotes: getTestimonials(["Stephen E.", "Nick B.", "Eric B."]),
    sections: [
      {
        heading: "Morning: you arrive",
        body: "You walk in knowing today is the day. Your treatment plan is already set. If you've chosen sedation, you'll be comfortably asleep within minutes. If not, local anaesthesia keeps you completely numb and at ease.",
      },
      {
        heading: "Mid-morning: implants are placed",
        body: "Dr. Alex places the implants into your jawbone using the 3D surgical plan. The procedure is precise and efficient — most placements are completed within a couple of hours.",
      },
      {
        heading: "Afternoon: your new teeth are fitted",
        body: "While you're still here, Tom and his team in the onsite lab design and attach your new set of teeth to the implants. You'll see your new smile in the mirror before you leave.",
      },
      {
        heading: "You go home smiling",
        body: "You leave the clinic with a full set of fixed, functional teeth. We send you home with clear aftercare instructions and schedule your follow-up. Most patients are back to eating soft foods within a day or two.",
      },
    ],
    faqs: [
      {
        question: "Will I really leave with teeth the same day?",
        answer:
          "Yes. In most cases, you'll receive your implants and a full set of temporary fixed teeth in a single visit. Your permanent bridge is placed a few months later once the implants have fully integrated. You're never without teeth at any point in the process.",
      },
      {
        question: "Am I a candidate for same day implants?",
        answer:
          "Not sure? That's exactly what the free consultation is for. We'll take a look, talk through your options, and give you a straight answer — no pressure, no sales pitch.",
      },
    ],
    links: [consult, pricing, { label: "Why patients choose Renew", href: "/why-choose-us" }],
  },
  {
    slug: "services/denture-alternative",
    grammar: "experience",
    eyebrow: "Denture alternative",
    title: "You deserve better than a denture that doesn't work",
    intro:
      "Snap-on dentures and implant-retained alternatives give you stability, confidence, and the freedom to eat what you want — without the adhesive, without the slipping, without the frustration.",
    image: media.snapOn,
    device: "split",
    acts: [
      {
        device: "split",
        heading: "Dentures were supposed to give you your life back — but they didn't",
        body: "The adhesive that doesn't hold. The clicking sound that makes you self-conscious. The sore spots that never fully heal. The way your face has started to change shape as your bone shrinks. You're not being dramatic. You're just ready for something that actually works.",
        image: media.snapOn,
      },
      {
        device: "kinetic",
        heading: "Your denture — but stable, secure, and actually comfortable",
        body: "A snap-on denture (also called an overdenture) clips onto small connectors on top of two or four implants. You can remove it for cleaning at night, but during the day it stays locked in place — no movement, no slipping, no embarrassing moments.",
        image: media.team,
      },
      {
        device: "iris",
        heading: "Your denture doesn't have to be your life sentence",
        body: "Book your free consultation and find out how snap-on dentures or implant-supported teeth can change everything. No pressure, no commitment — just honest options from a team that's been doing this for over 20 years.",
        image: media.heroClinic,
      },
    ],
    quotes: getTestimonials(["Eric B.", "Chantal G.", "Nick B."]),
    sections: [
      {
        heading: "Snap-on denture (2 implants)",
        body: "The most affordable implant-supported option. Two implants are placed in your jaw, and your denture clips securely onto them. It's removable for cleaning but stays firmly in place while you eat, talk, and smile.",
      },
      {
        heading: "Snap-on denture (4 implants)",
        body: "Four implants give your snap-on denture even more stability — especially helpful for the lower jaw, where traditional dentures struggle the most. Same removable convenience, just more confidence in every bite.",
      },
      {
        heading: "Fixed implant bridge (All-on-4)",
        body: "The gold standard. Four or more implants support a full set of permanent teeth that never come out. You brush them like natural teeth, eat anything you want, and forget they're even there.",
      },
    ],
    faqs: [
      {
        question: "How much do snap-on dentures cost?",
        answer:
          "Cost depends on how many implants are placed and whether you're doing upper, lower, or both. We give you a clear, all-inclusive price at your free consultation — no hidden fees. We accept CDCP, insurance, and offer in-house payment plans.",
      },
      {
        question: "Can my existing denture be converted?",
        answer:
          "In many cases, yes. If your current denture is in good condition, it may be possible to retrofit it to clip onto implants — saving you the cost of a brand-new prosthetic.",
      },
      {
        question: "How long do snap-on dentures last?",
        answer:
          "The implants themselves can last a lifetime with proper care. The snap-on attachments may need periodic replacement as they wear, and the denture itself may need relining or replacing every several years — with far better stability throughout.",
      },
      {
        question: "Can I upgrade to a fixed bridge later?",
        answer:
          "That's absolutely possible. Many patients start with a snap-on denture and later upgrade to a full fixed bridge as their budget allows. We plan with the long term in mind so your implants can support either option.",
      },
    ],
    links: [consult, pricing, { label: "Learn about Easy Implant", href: "/easy-implant-en" }],
  },
  {
    slug: "services/upper-jaw-implants",
    grammar: "experience",
    eyebrow: "Upper jaw implants",
    title: "Finally — upper teeth that stay put",
    intro:
      "No palate plate. No adhesive. No slipping. Upper jaw implants give you fixed, natural-looking teeth you never have to take out.",
    image: media.heroConsult,
    device: "kinetic",
    acts: [
      {
        device: "kinetic",
        heading: "Upper dentures are the ones people hate most",
        body: "The plate that covers your palate blocks your sense of taste. The adhesive never holds the way it should. And the longer you wait, the more bone you lose. Upper jaw implants break that cycle by replacing the palate plate with fixed teeth anchored directly to your jawbone.",
        image: media.heroConsult,
      },
      {
        device: "split",
        heading: "Upper jaw implants require specific expertise",
        body: "The upper jaw is naturally less dense than the lower and sits beneath the sinus cavity. Our team uses 3D scanning to map your exact anatomy so implants can be placed safely — often without sinus lifts or bone grafts. And eliminating the palate plate means your sense of taste comes back.",
        image: media.allOn4,
      },
    ],
    quotes: getTestimonials(["Chantal G.", "Ken Miller", "Bruce L."]),
    sections: [
      {
        heading: "We'll help you choose the right approach",
        body: "Some patients are candidates for All-on-4. Others may benefit from six or more implants depending on bone density and anatomy. For patients who prefer a removable option, snap-on overdentures can provide a dramatic improvement. Tom and Dr. Alex recommend the approach that gives you the best long-term result — not the most expensive one.",
      },
      {
        heading: "Your upper jaw case — handled start to finish",
        body: oneRoof,
      },
    ],
    faqs: [
      {
        question: "Do I need bone grafting for upper jaw implants?",
        answer:
          "Not always. The All-on-4 technique is specifically designed to maximize existing bone, and our 3D planning helps us find the best implant positions for your anatomy. Many patients who were told they needed grafting elsewhere turn out to be great candidates at Renew without it.",
      },
      {
        question: "Will I be able to taste food again?",
        answer:
          "Yes. Once the palate plate is gone, most patients are amazed at how much flavour they've been missing. It's one of the first things people notice after upper jaw implant treatment.",
      },
      {
        question: "Can upper jaw implants be done in one day?",
        answer:
          "In many cases, yes. Our same day implant process allows us to place implants and attach your new teeth in a single visit. We'll confirm whether same day is possible for your case during your free consultation.",
      },
    ],
    links: [consult, pricing, { label: "Explore All-on-4", href: "/services/all-on-4-dental-implants" }],
  },
  {
    slug: "services/lower-jaw-implants",
    grammar: "experience",
    eyebrow: "Lower jaw implants",
    title: "A lower denture that finally stays put",
    intro:
      "Lower jaw implants give you fixed, stable teeth — no more sliding, no more adhesive, no more avoiding the foods you love.",
    image: media.snapOn,
    device: "split",
    acts: [
      {
        device: "split",
        heading: "If your lower denture moves, you're not alone",
        body: "There's less surface area for a lower denture to grip, no suction like the upper palate, and your tongue constantly pushes against it. The result is a denture that rocks, lifts, and slides — no matter how much adhesive you use.",
        image: media.snapOn,
      },
      {
        device: "kinetic",
        heading: "The lower jaw is actually ideal for implants",
        body: "The lower jaw tends to have denser bone, which means implants integrate quickly and hold firmly. Patients who go from a loose lower denture to implant-supported teeth consistently describe it as the single biggest improvement to their daily comfort and confidence.",
        image: media.fullArch,
      },
    ],
    quotes: getTestimonials(["Chantal G.", "Ken Miller", "Bob Cousins"]),
    sections: [
      {
        heading: "From fixed teeth to snap-on stability — we'll find what fits",
        body: "Depending on your bone, budget, and goals, lower jaw implants range from a full fixed bridge on four implants to a simple two-implant snap-on that dramatically stabilizes your existing denture. Tom and Dr. Alex will evaluate your lower jaw using 3D scans and walk you through every option.",
      },
      {
        heading: "Your lower jaw case — start to finish, right here",
        body: oneRoof,
      },
    ],
    faqs: [
      {
        question: "How many implants do I need for my lower jaw?",
        answer:
          "It depends on the approach. A full fixed bridge typically requires four implants (All-on-4), while a snap-on overdenture can work with as few as two.",
      },
      {
        question: "Can lower jaw implants be done the same day?",
        answer:
          "In most cases, yes. The lower jaw's dense bone is ideal for immediate loading, which means implants and teeth are often placed in the same visit.",
      },
      {
        question: "What's the difference between fixed teeth and a snap-on denture?",
        answer:
          "Fixed teeth are permanently attached to implants — you brush them like natural teeth and never remove them. Snap-on dentures clip onto implants for stability but can be removed for cleaning. Both are massive upgrades from a traditional lower denture.",
      },
    ],
    links: [consult, pricing, { label: "Explore All-on-4", href: "/services/all-on-4-dental-implants" }],
  },
  {
    slug: "services/sedation-dentistry",
    grammar: "experience",
    eyebrow: "Sedation dentistry",
    title: "What if you could sleep through the whole thing?",
    intro:
      "Sedation dentistry lets you relax — or sleep — through your entire procedure. No anxiety, no pain, no memory of the visit. Just results.",
    image: media.sedation,
    device: "kinetic",
    acts: [
      {
        device: "kinetic",
        heading: "Dental anxiety is real — and it's nothing to be ashamed of",
        body: "Dental anxiety affects millions of adults and is one of the most common reasons people delay the care they need. At Renew, we hear it every week — and we never judge. Sedation removes the barrier between you and the care you deserve, so the only thing you have to do is show up.",
        image: media.sedation,
      },
      {
        device: "split",
        heading: "Sedation isn't just for the scared",
        body: "Most of our implant patients — whether they're getting All-on-4, full arch, or same day implants — choose some form of sedation. It makes longer procedures more comfortable and allows us to complete more work in a single visit.",
        image: media.heroConsult,
      },
      {
        device: "iris",
        heading: "You wake up with new teeth",
        body: "When it's over, we'll gently bring you back. You'll be groggy but comfortable. Your ride takes you home, and within a day or two you're back to normal — with a brand new smile and no memory of the procedure.",
        image: media.clinic,
      },
    ],
    quotes: getTestimonials(["Tim Appleby", "Stephen E.", "Ernie Minichilli"]),
    sections: [
      {
        heading: "Oral sedation",
        body: "You take a prescribed medication before your appointment that helps you feel calm, drowsy, and deeply relaxed. You'll be awake but won't feel anxious — and most patients remember very little of the procedure afterward.",
      },
      {
        heading: "IV sedation",
        body: "Administered by a trained sedation professional, IV sedation puts you into a deep state of relaxation. You'll drift in and out of sleep throughout the procedure and likely won't remember any of it. It's ideal for longer treatments like All-on-4 or full arch implants.",
      },
      {
        heading: "General anaesthesia",
        body: "For patients who want to be completely asleep, general anaesthesia is available for more complex cases. It's the deepest level of sedation and is performed with a qualified anaesthesia team.",
      },
      {
        heading: "Here's how it actually goes",
        body: "We give you clear instructions ahead of time — what to eat, when to take your medication, and what to wear. You'll need someone to drive you home. When you arrive, we get you settled and administer the sedation. Within minutes you'll feel calm and relaxed, and Dr. Alex and Tom handle the implants and teeth while you rest.",
      },
    ],
    faqs: [
      {
        question: "Is dental sedation safe?",
        answer:
          "Yes. All sedation at Renew is administered by trained professionals and monitored throughout the procedure. We'll review your medical history during your consultation and recommend the level of sedation that's safest and most appropriate for you.",
      },
      {
        question: "Will I be completely asleep?",
        answer:
          "It depends on the type of sedation. Oral sedation keeps you deeply relaxed but technically awake. IV sedation puts most patients in and out of sleep. General anaesthesia means you're fully asleep.",
      },
      {
        question: "How long does it take to recover from sedation?",
        answer:
          "The effects of oral sedation can linger for several hours after the procedure. IV sedation wears off relatively quickly but you'll still feel groggy. Either way, you'll need someone to drive you home. Plan for a restful afternoon.",
      },
    ],
    links: [consult, { label: "Scared of the dentist?", href: "/dental-anxiety" }],
  },
  {
    slug: "services/failed-dental-work",
    grammar: "experience",
    eyebrow: "Failed dental work",
    title: "It wasn't supposed to end up like this",
    intro:
      "If your dental work failed — implants that didn't take, bridges that broke, crowns that keep falling off — you're not starting over. You're getting it done right this time.",
    image: media.heroConsult,
    device: "split",
    acts: [
      {
        device: "split",
        heading: "You did everything right — the work let you down",
        body: "Maybe the implant didn't integrate with the bone. Maybe the bridge cracked after a few years. Maybe the crowns keep loosening and nobody can explain why. Whatever happened, you're not to blame. And you're not stuck.",
        image: media.heroConsult,
      },
      {
        device: "kinetic",
        heading: "We start with the truth — then we build from there",
        body: "Tom and Dr. Alex will take 3D scans, review your history, and tell you exactly what went wrong and what it'll take to fix it. If we can save existing work, we will. If we can't, we'll explain why and what comes next.",
        image: media.allOn4,
      },
    ],
    quotes: getTestimonials(["Bob Cousins", "Nick B.", "Ernie Minichilli"]),
    sections: [
      {
        heading: "Failed implants",
        body: "Implants that didn't fuse to the bone, were placed incorrectly, or developed infection. These can often be removed, the site can heal, and new implants can be placed properly.",
      },
      {
        heading: "Broken bridges and crowns",
        body: "Poorly designed prosthetics that crack, chip, or fall off. We see bridges built on compromised teeth, crowns that were never a good fit, and lab work that wasn't up to standard.",
      },
      {
        heading: "Ill-fitting dentures",
        body: "Dentures made without proper measurements or that were never adjusted after placement. If your denture rocks, slips, or causes sore spots that won't heal — it wasn't made right.",
      },
      {
        heading: "Incomplete treatment",
        body: "Treatment plans that were started but never finished — temporary teeth that became permanent by default, implants placed without a prosthetic on top, or a plan that fell apart when the clinic closed or the provider left.",
      },
      {
        heading: "Failed work often happens when too many people are involved",
        body: "One of the most common reasons dental work fails is poor coordination between surgeon, lab, and prosthetic. " + oneRoof,
      },
    ],
    faqs: [
      {
        question: "Can a failed implant be replaced?",
        answer:
          "In most cases, yes. A failed implant is removed, the site is given time to heal (or is grafted if needed), and a new implant is placed. The key is understanding why it failed in the first place — which is exactly what we assess during your free consultation.",
      },
      {
        question: "Will I have to start from scratch?",
        answer:
          "Not necessarily. In some cases, we can work with existing implants or structures to save time and money. In other cases, a fresh start with an All-on-4 approach is actually more cost-effective than trying to patch something that was never going to work long term.",
      },
    ],
    links: [consult, { label: "Why patients choose Renew", href: "/why-choose-us" }],
  },
  {
    slug: "blog",
    grammar: "document",
    eyebrow: "Blog",
    title: "Tips, stories, and straight talk about dental implants",
    intro:
      "Expert advice from Tom Szarski and the Renew team — written in plain English, for real people.",
    image: media.team,
    sections: [
      {
        heading: "Why more people are choosing All-on-4 dental implants",
        body: "More Canadians over 50 are choosing All-on-4 — not because of cost, but because of confidence, freedom, and quality of life.",
      },
      {
        heading: "Are dentures holding you back?",
        body: "A plain-English comparison of dentures and dental implants — comfort, stability, jawbone support, and everyday benefits.",
      },
      {
        heading: "Can you really walk out with new teeth in one day?",
        body: "How same-day dental implants work, who may qualify, what to expect during recovery, and whether one-day teeth are right for you.",
      },
      {
        heading: "All-on-4 after years of missing teeth",
        body: "Missing teeth for years does not always mean you cannot get All-on-4 dental implants.",
      },
      {
        heading: "Full arch vs. individual dental implants",
        body: "Individual implants replace single teeth; full arch implants replace an entire row using fewer implant posts.",
      },
    ],
    links: [
      { label: "Why people are choosing All-on-4", href: "/blog/why-people-are-choosing-all-on-4" },
      { label: "Dentures vs. dental implants", href: "/blog/dentures-vs-dental-implants" },
      { label: "New teeth in one day", href: "/blog/same-day-dental-implants-new-teeth-one-day" },
      {
        label: "All-on-4 after years of tooth loss",
        href: "/blog/all-on-4-dental-implants-after-years-of-missing-teeth",
      },
      { label: "Full arch vs. individual implants", href: "/blog/full-arch-vs-individual-dental-implants" },
    ],
  },
  {
    slug: "blog/why-people-are-choosing-all-on-4",
    grammar: "document",
    eyebrow: "From the blog",
    title: "Why more people are choosing All-on-4 dental implants — and it's not about the price",
    intro:
      "Across Canada and the United States, a growing number of adults are choosing All-on-4 dental implants over traditional dentures, bridges, and patchwork fixes. The real reason people are making this choice isn't financial. It's personal.",
    image: media.allOn4,
    sections: [
      {
        heading: "Who's getting All-on-4? The average patient might surprise you",
        body: "The typical All-on-4 patient is over 50 — and that tracks with what we see every day at Renew. But more patients in the 35–50 range are opting for All-on-4 earlier, tired of the revolving door of temporary fixes. What they all share isn't a tax bracket. It's a tipping point.",
      },
      {
        heading: "It's not about cost — it's about being done",
        body: "When we sit down with patients during their free consultation, the conversation almost never starts with money. It starts with exhaustion. Ken M. put it simply after his procedure: the experience was life-changing — he could eat anything he wanted, no more pain, and no longer had to worry about the look in people's eyes.",
      },
      {
        heading: "The real value: confidence, freedom, and function",
        body: "Patients want to eat normally again — All-on-4 restores up to 90% of natural bite force. They want to stop hiding. They want one solution, not an endless cycle. And they want it to last: the titanium implants can last a lifetime, and the fixed bridge typically lasts 10–15 years, compared with dentures that need replacing every 5–8 years.",
      },
      {
        heading: "Why All-on-4 specifically?",
        body: "Fewer implants, same result — four strategically placed implants, two straight and two angled, support an entire arch. Often no bone grafting required. Same-day results in many cases. And a proven track record: developed in the 1990s by Dr. Paulo Maló with Nobel Biocare, All-on-4 has decades of clinical evidence and success rates above 95% at the 10-year mark.",
      },
    ],
    links: [
      { label: "Learn about All-on-4", href: "/services/all-on-4-dental-implants" },
      consult,
    ],
  },
  {
    slug: "blog/dentures-vs-dental-implants",
    grammar: "document",
    eyebrow: "From the blog",
    title: "Are dentures holding you back? Why more people are choosing dental implants",
    intro:
      "Compare dentures and dental implants to understand the differences in comfort, stability, jawbone support, and everyday benefits when replacing missing teeth.",
    image: media.snapOn,
    sections: [
      {
        heading: "Why do some people look for options beyond dentures?",
        body: "Dentures can help replace missing teeth, but they may not feel comfortable for everyone. Some people have trouble chewing certain foods because their dentures can move inside the mouth. Others worry about their dentures shifting while speaking or laughing.",
      },
      {
        heading: "What makes dental implants different from dentures?",
        body: "Dental implants are placed into the jawbone to keep replacement teeth firmly in place. Dentures sit on the gums and can be removed for cleaning; implants are fixed in place. Implants also act like natural tooth roots and help preserve jawbone health.",
      },
      {
        heading: "Are dental implants comfortable?",
        body: "Since implants are securely placed, they are less likely to move while eating or talking. Once the mouth heals, most patients feel that implants look and feel like natural teeth and fit easily into their daily lives.",
      },
      {
        heading: "Are dentures the only choice for missing teeth?",
        body: "No. There are several tooth replacement options available, and the right choice depends on your dental needs, lifestyle, and personal preferences. A dental professional will check oral health, bone support, and personal needs before recommending implants.",
      },
      {
        heading: "Caring for your implants",
        body: "Good oral hygiene and regular dental visits are important after implant treatment. Dental implants can remain in place for a long time when properly cared for. Some mild discomfort or swelling may occur after treatment, but it usually improves as the mouth heals.",
      },
    ],
    links: [
      { label: "Explore denture alternatives", href: "/services/denture-alternative" },
      consult,
    ],
  },
  {
    slug: "blog/same-day-dental-implants-new-teeth-one-day",
    grammar: "document",
    eyebrow: "From the blog",
    title: "Can you really walk out with new teeth in one day?",
    intro:
      "Learn how same-day dental implants work, who may qualify, what to expect during recovery, and whether one-day teeth are right for you.",
    image: media.clinic,
    sections: [
      {
        heading: "How do same-day implants work?",
        body: "Getting dental implants usually takes a few months: the implant is placed, the jawbone grows around it, and the final teeth are attached after healing. With same-day implants, the dentist places the implants and gives you a temporary set of teeth on the same day, so you leave the clinic with a complete smile while your mouth heals.",
      },
      {
        heading: "Who may qualify?",
        body: "Not everyone is a good fit. A dentist will first check your jawbone, gums, and the overall health of your mouth. People with healthy gums and enough jawbone support have a better chance of getting this treatment.",
      },
      {
        heading: "Why do people like same-day treatment?",
        body: "Leaving with teeth right away saves time and reduces stress. It also helps a person feel more confident in social settings during the healing period.",
      },
      {
        heading: "What to expect after the visit",
        body: "Your mouth may feel sore for a few days, with some swelling or mild pain. Eating soft foods can make you feel more comfortable while your mouth starts to heal.",
      },
      {
        heading: "When are one-day teeth not the right option?",
        body: "If your jawbone is not strong enough, you have gum disease, or your mouth needs more treatment before implants, your dentist may recommend a longer treatment plan.",
      },
    ],
    links: [
      { label: "Learn about same day implants", href: "/services/same-day-dental-implants" },
      consult,
    ],
  },
  {
    slug: "blog/all-on-4-dental-implants-after-years-of-missing-teeth",
    grammar: "document",
    eyebrow: "From the blog",
    title: "Can you get All-on-4 dental implants if you've been missing teeth for years?",
    intro:
      "Missing teeth for years does not always mean you cannot get All-on-4 dental implants.",
    image: media.allOn4,
    sections: [
      {
        heading: "What happens to your jawbone over time?",
        body: "When a tooth is gone, the bone under it slowly shrinks because it no longer gets pressure from chewing. Over several years, that bone loss can add up.",
      },
      {
        heading: "Why long-term tooth loss doesn't stop treatment",
        body: "Even people who lost their teeth 10 or 20 years ago can often get a new set. The All-on-4 method uses four implants placed at special angles to reach stronger areas of the jaw.",
      },
      {
        heading: "How the All-on-4 method works",
        body: "The All-on-4 treatment restores a full arch of teeth using just four strategically placed dental implants. In many cases, temporary teeth can be attached the same day.",
      },
      {
        heading: "Who may be a good candidate?",
        body: "People who have lost most or all teeth in one or both arches, whose dentures move or affect daily activities, or who want permanent teeth that stay in place instead of removable dentures.",
      },
    ],
    links: [
      { label: "Learn about All-on-4", href: "/services/all-on-4-dental-implants" },
      consult,
    ],
  },
  {
    slug: "blog/full-arch-vs-individual-dental-implants",
    grammar: "document",
    eyebrow: "From the blog",
    title: "What's the difference between full arch and individual dental implants?",
    intro:
      "Individual implants replace single teeth; full arch implants replace an entire row using fewer implant posts.",
    image: media.fullArch,
    sections: [
      {
        heading: "What are individual dental implants?",
        body: "Individual dental implants replace one missing tooth at a time. A titanium post is placed in the jawbone; after healing, a custom crown is attached.",
      },
      {
        heading: "What are full arch dental implants?",
        body: "Full arch dental implants replace most or all teeth in an upper or lower arch. Several implants support a full set of replacement teeth.",
      },
      {
        heading: "How do they differ?",
        body: "Individual implants replace single teeth one by one. Full arch implants replace an entire row using fewer implant posts — which is why options like All-on-4 can restore a whole arch on four implants.",
      },
    ],
    links: [
      { label: "Learn about full arch implants", href: "/services/full-arch-dental-implants" },
      consult,
    ],
  },
  {
    slug: "easy-implant-en",
    grammar: "document",
    eyebrow: "Easy Implant",
    title: "Stop living around your dentures",
    intro:
      "Easy Implant is one of our most affordable implant-supported denture solutions — designed to give your existing dentures greater comfort and stability, without investing in a completely new set of teeth.",
    image: media.snapOn,
    sections: [
      {
        heading: "Greater stability. Greater confidence.",
        body: "Reduce unwanted denture movement. Eat and speak with greater confidence. Smile and laugh more comfortably. Rely less on denture adhesives. Keep your existing dentures whenever possible, and avoid being without your teeth during treatment.",
      },
      {
        heading: "Stage 01 — free consultation",
        body: "Zero days without your teeth, a free initial consultation, your existing dentures kept, and 100% transparent costs.",
      },
      {
        heading: "Stage 02 — implant placement",
        body: "Implants are placed by Dr. Alex in our Orléans clinic to give your denture the anchor it's been missing.",
      },
      {
        heading: "Stage 03 — denture adaptation",
        body: "Your existing denture is adapted in our onsite lab to clip securely onto the implants.",
      },
    ],
    links: [consult, { label: "Compare denture alternatives", href: "/services/denture-alternative" }],
  },
  {
    slug: "for-dentists",
    grammar: "document",
    eyebrow: "For dentists",
    title: "A trusted implant partner for your practice",
    intro:
      "Tom Szarski, DD — Denturist with more than 20 years in implant prosthetics. Your relationship with your patient matters. Our role is to support it.",
    image: media.team,
    sections: [
      {
        heading: "Comprehensive implant support under one roof",
        body: "Single and multiple implant cases. Implant-supported and snap-on dentures. Full arch and All-on-4 restorations. Immediate and same-day prosthetic solutions. Treatment planning and case consultation. Digital scanning, design, milling, and 3D printing. Denture conversions, repairs, and ongoing maintenance.",
      },
      {
        heading: "Why dentists work with Renew",
        body: "More than 20 years of implant prosthetic experience. An implant surgeon and denturist working side by side. A fully equipped onsite dental laboratory. An efficient digital workflow. Bilingual service in English and French.",
      },
    ],
    links: [
      { label: "Refer a patient by email", href: `mailto:${site.email}?subject=Patient%20Referral` },
      call,
    ],
  },
  {
    slug: "privacy-policy",
    grammar: "document",
    eyebrow: "Last updated February 2025",
    title: "Privacy policy",
    intro:
      "Your privacy matters to us. This policy explains how Renew Implant Centre collects, uses, and protects your personal information.",
    image: media.clinic,
    sections: [
      {
        heading: "Introduction",
        body: "Renew Implant Centre is committed to protecting the privacy and confidentiality of our patients and website visitors. This policy explains how we collect, use, disclose, and safeguard your personal information when you visit www.renewimplants.ca or our clinic at 2530 St Joseph Blvd #6, Orléans, ON K1C 1G1. By using our website or services, you consent to the practices described here.",
      },
      {
        heading: "Information we collect",
        body: "Contact information such as your name, phone number, email address, and mailing address. Health information including dental history, treatment records, and related medical information collected during consultations and treatment. Website usage information such as IP address, browser type, and pages visited, collected through cookies and similar technologies.",
      },
      {
        heading: "How we use your information",
        body: "To respond to your consultation requests and inquiries, provide dental implant treatment and related care, schedule and manage appointments, process insurance claims and billing (including CDCP and direct billing), improve our website and services, and comply with legal and regulatory obligations. We do not sell, rent, or trade your personal information to third parties for marketing purposes.",
      },
      {
        heading: "How we protect your information",
        body: "We implement appropriate physical, electronic, and administrative safeguards to protect your personal information from unauthorized access, disclosure, alteration, or destruction. Patient health records are maintained in accordance with applicable Ontario and Canadian privacy legislation.",
      },
      {
        heading: "Third-party disclosure",
        body: "We may share your personal information with insurance providers and the CDCP for claims processing, healthcare professionals involved in your treatment (such as our implant surgeon, Dr. Alex), and service providers who assist with our website operations — subject to confidentiality agreements. We may also disclose information when required by law.",
      },
      {
        heading: "Cookies and website tracking",
        body: "Our website may use cookies to enhance your browsing experience, analyze traffic, and remember your preferences. You can manage cookie preferences through your browser settings. Disabling cookies may affect certain features of our website.",
      },
      {
        heading: "Your rights",
        body: "Under applicable Canadian privacy legislation, you have the right to access the personal information we hold about you, request corrections, withdraw consent for certain uses (subject to legal and contractual restrictions), and request deletion where permitted by law. To exercise these rights, contact us using the details below.",
      },
      {
        heading: "Children's privacy",
        body: "Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children without parental consent.",
      },
      {
        heading: "Changes to this policy",
        body: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.",
      },
    ],
    links: [email, call],
  },
  {
    slug: "terms",
    grammar: "document",
    eyebrow: "Last updated February 2025",
    title: "Terms of use",
    intro:
      "Please read these terms carefully before using the Renew Implant Centre website.",
    image: media.clinic,
    sections: [
      {
        heading: "Acceptance of terms",
        body: "By accessing and using the Renew Implant Centre website (www.renewimplants.ca), you agree to be bound by these Terms of Use. If you do not agree, please do not use this website. Renew Implant Centre reserves the right to update or modify these terms at any time without prior notice.",
      },
      {
        heading: "Use of this website",
        body: "This website is provided for informational purposes only. You agree to use it only for lawful purposes and in a manner that does not infringe upon the rights of others or restrict their use and enjoyment of the site.",
      },
      {
        heading: "Not medical advice",
        body: "The information on this website is for general educational purposes and does not constitute professional dental or medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional. Contacting us through the website does not establish a patient-practitioner relationship until you have been formally accepted as a patient.",
      },
      {
        heading: "Intellectual property",
        body: "All content on this website — including text, graphics, logos, images, photographs, and design elements — is the property of Renew Implant Centre or its content providers and is protected by Canadian and international copyright laws. You may not reproduce, distribute, modify, or republish any content without prior written consent.",
      },
      {
        heading: "Accuracy of information",
        body: "While we make reasonable efforts to ensure the information on this website is accurate and up to date, we do not guarantee the completeness, reliability, or accuracy of any content. Treatment outcomes, pricing, and availability may vary and are subject to change without notice. For current information, contact us at 613-841-6111.",
      },
      {
        heading: "Third-party links",
        body: "This website may contain links to third-party websites for your convenience. Renew Implant Centre does not endorse, control, or assume responsibility for the content, privacy policies, or practices of any third-party websites.",
      },
      {
        heading: "Limitation of liability",
        body: "Renew Implant Centre, its owner, employees, and affiliates shall not be held liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of this website or reliance on any information provided. This website is provided on an \"as is\" and \"as available\" basis without warranties of any kind.",
      },
      {
        heading: "User submissions",
        body: "Any information you submit through our website — including consultation request forms and contact forms — is subject to our Privacy Policy. By submitting information, you represent that it is accurate and that you have the authority to provide it.",
      },
      {
        heading: "Governing law",
        body: "These Terms of Use are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any disputes shall be subject to the exclusive jurisdiction of the courts of Ontario.",
      },
    ],
    links: [{ label: "Read the privacy policy", href: "/privacy-policy" }, email],
  },
  {
    slug: "sitemap",
    grammar: "document",
    eyebrow: "Find a page",
    title: "Sitemap",
    intro:
      "Find everything you need on the Renew Implant Centre website, grouped the way the header is organized.",
    image: media.heroClinic,
    sections: [
      {
        heading: "Services",
        body: "All-on-4, same day, full arch, upper jaw, lower jaw, denture alternative, sedation dentistry, and failed dental work.",
      },
      {
        heading: "About and patients",
        body: "Meet your dentist, why choose us, dental anxiety, patient stories, before and after, what to expect, pricing, FAQ, Easy Implant, and service areas.",
      },
      {
        heading: "Blog, contact, and legal",
        body: "Five blog articles, contact us, for dentists, privacy policy, and terms of use.",
      },
    ],
    links: [
      { label: "Home", href: "/" },
      consult,
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms of use", href: "/terms" },
    ],
  },
];

export function getRouteContent(slug: string) {
  return routes.find((route) => route.slug === slug);
}

export function getRouteSlugs() {
  return routes.map((route) => route.slug);
}
