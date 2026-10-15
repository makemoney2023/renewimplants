export type ScrollDevice =
  | "parallax"
  | "kinetic"
  | "rail"
  | "split"
  | "panorama"
  | "iris";

export type ScrollAct = {
  id: string;
  label: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  video?: string;
  mobileVideo?: string;
  device: ScrollDevice;
  span: number;
  peak?: boolean;
};

export const site = {
  name: "Renew Implant Centre",
  shortName: "Renew Implants",
  url: "https://www.renewimplants.ca",
  description:
    "All-on-4 and full arch dental implants in Orléans, Ottawa. One clinic, one team, one day. Free consultations, CDCP accepted, onsite lab.",
  phone: {
    label: "613-841-6111",
    href: "tel:613-841-6111",
  },
  email: "info@renewimplants.ca",
  primaryCta: {
    label: "Book your free consultation",
    href: "/contact-us",
  },
  secondaryCta: {
    label: "Get pricing",
    href: "/pricing",
  },
  address: "2530 St Joseph Blvd #6, Orléans, ON K1C 1G1",
  mapHref:
    "https://www.google.com/maps/search/?api=1&query=2530+St+Joseph+Blvd+%236+Orl%C3%A9ans+ON+K1C+1G1",
  hours: [
    { day: "Monday to Friday", time: "By appointment" },
    { day: "Evenings and weekends", time: "Available on request" },
  ],
} as const;

/** Two lines rendered inside the homepage h1. The aria name stays scrollActs[0].title. */
export const heroLines: readonly [string, string] = [
  "Stop living around your teeth.",
  "Start living again.",
];

export const headerCta = "Free consultation";

export const trustNote = {
  strong: "CDCP accepted · Direct billing · Financing",
  span: "Onsite lab · Sedation available · English and French",
};

export const panorama = {
  label: "Inside Renew Implant Centre",
  caption: "Consultation, surgery, lab, and follow-up — all at 2530 St Joseph Blvd.",
};

export const doctorLink = { label: "Meet Tom Szarski", href: "/meet-your-dentist" };

export const featuredReviewNames: string[] = ["Ken Miller"];

export const footerNote =
  "Same day dental implants in Orléans, ON. One office. One dentist. One day. Transforming smiles and changing lives since 2010.";

export const legalLinks = [
  { label: "Sitemap", href: "/sitemap" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy policy", href: "/privacy-policy" },
  { label: "Terms of use", href: "/terms" },
];

export const sitemapExtras = [
  { label: "Home", href: "/" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy policy", href: "/privacy-policy" },
  { label: "Terms of use", href: "/terms" },
];

export const brandLogo: { src: string; width: number; height: number } | null = null;

export const homeFaqQuestions = [
  "What are All-on-4 dental implants?",
  "What's the difference between All-on-4 and full arch implants?",
  "What are snap-on dentures?",
] as const;

export type PracticeDetails = {
  telephone: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  areaServed: readonly string[];
  availableLanguage: readonly string[];
  paymentAccepted: string;
  servicesHub: string;
  person: {
    name: string;
    honorificSuffix: string;
    jobTitle: string;
    path: string;
    alumniOf?: string;
    memberOf?: string;
  };
};

export const practice: PracticeDetails = {
  telephone: "+1-613-841-6111",
  streetAddress: "2530 St Joseph Blvd #6",
  addressLocality: "Orléans",
  addressRegion: "ON",
  postalCode: "K1C 1G1",
  addressCountry: "CA",
  areaServed: [
    "Orléans",
    "Ottawa",
    "Rockland",
    "Cumberland",
    "Embrun",
    "Casselman",
    "Hawkesbury",
    "Gatineau",
    "Kanata",
    "Barrhaven",
  ],
  availableLanguage: ["en", "fr"],
  paymentAccepted: "Canadian Dental Care Plan (CDCP), private dental insurance, in-house payment plans",
  servicesHub: "/services/all-on-4-dental-implants",
  person: {
    name: "Tom Szarski",
    honorificSuffix: "DD",
    jobTitle: "Denturist",
    path: "/meet-your-dentist",
    alumniOf: "George Brown College",
    memberOf: "Denturist Association of Ontario",
  },
};

export const media = {
  heroClinic: "/media/heroes/renew-hero.jpg",
  heroConsult: "/media/heroes/meet-hero.jpg",
  clinic: "/media/interiors/renew-lab.jpg",
  tom: "/media/staff/tom-szarski.jpg",
  team: "/media/staff/team-group.jpg",
  allOn4: "/media/services/service-allon4.jpg",
  fullArch: "/media/services/service-fullarch.jpg",
  sedation: "/media/services/service-sedation.jpg",
  snapOn: "/media/services/service-snapon.jpg",
} as const;

// Generated exploded-view implant loop (crown → screw → abutment → fixture),
// see ASSETS-MANIFEST.md "implant-animation". Only the silent web renders ship.
export const implantAnimation = {
  poster: "/media/animation/dental-implant-angled-16x9.png",
  mobilePoster: "/media/animation/dental-implant-angled-9x16.png",
  webm: "/media/animation/implant-assemble-web-16x9.webm",
  video: "/media/animation/implant-assemble-web-16x9.mp4",
  mobileWebm: "/media/animation/implant-assemble-web-9x16.webm",
  mobileVideo: "/media/animation/implant-assemble-web-9x16.mp4",
  alt: "A dental implant assembling: crown, retaining screw, abutment, and titanium fixture",
} as const;

export const panoramaTiles = [
  { src: media.heroConsult, alt: "A consultation at Renew Implant Centre" },
  { src: media.clinic, alt: "The renovated treatment room" },
  { src: media.team, alt: "Tom Szarski with a patient" },
  { src: media.heroClinic, alt: "The operatory and its blue accent wall" },
];

export const scrollActs: ScrollAct[] = [
  {
    id: "arrival",
    label: "Orléans, Ottawa",
    title: "Stop living around your teeth. Start living again.",
    body: "All-on-4 and full arch implants — one clinic, one team, one day. Ottawa's implant specialists for over 20 years.",
    image: media.clinic,
    imageAlt: "The bright, recently renovated treatment room at Renew Implant Centre",
    video: "/media/video/renew-hero-16x9.mp4",
    mobileVideo: "/media/video/renew-hero-9x16.mp4",
    device: "parallax",
    span: 1.7,
  },
  {
    id: "trust",
    label: "Four generations in dentistry",
    title: "Twenty years of renewing Ottawa smiles.",
    body: "Tom Szarski built Renew to do things differently — no runaround, no jargon, no bouncing between specialists across town. Just honest answers and a team that treats you like family.",
    image: media.team,
    imageAlt: "Tom Szarski talking with a smiling patient inside the clinic",
    device: "kinetic",
    span: 1.5,
  },
  {
    id: "choice",
    label: "Solutions that actually last",
    title: "Teeth that stay in and work like your own.",
    body: "All-on-4, full arch implants, snap-on dentures, and sedation dentistry — designed, crafted, and fitted right here.",
    image: media.allOn4,
    imageAlt: "A clear dental model showing a full arch supported by implants",
    device: "rail",
    span: 2,
  },
  {
    id: "connection",
    label: "Meet Tom Szarski, DD",
    title: "He listens first.",
    body: "Before Tom looks at your teeth, he listens to your story. Dr. Alex places the implants in the same building, and the onsite lab builds your teeth the same day.",
    image: media.tom,
    imageAlt: "Portrait of denturist Tom Szarski in navy scrubs",
    device: "split",
    span: 1.4,
  },
  {
    id: "proof",
    label: "One clinic. One team.",
    title: "Everything under one roof.",
    body: "Your consultation, your surgery, your lab work, and your follow-ups all happen here — with the same team who already knows your name.",
    image: media.heroConsult,
    imageAlt: "A patient describing tooth pain to Tom during a consultation",
    device: "panorama",
    span: 2.8,
    peak: true,
  },
  {
    id: "commitment",
    label: "Your free consultation",
    title: "You've waited long enough. The rest of your life won't.",
    body: "Book your free, no-obligation consultation. We'll talk about what's going on, what's possible, and whether implants are right for you.",
    image: media.heroClinic,
    imageAlt: "The Renew Implant Centre operatory with its blue accent wall",
    device: "iris",
    span: 1.4,
  },
];

// Gemini Omni loops animated from each card's service photo (the photo stays
// the poster and the reduced-motion fallback). See ASSETS-MANIFEST.md
// "treatment-animation".
function treatmentLoop(name: string, poster: string) {
  const base = `/media/treatments/treatment-${name}-web`;
  return {
    poster,
    webm: `${base}-16x9.webm`,
    video: `${base}-16x9.mp4`,
    mobileWebm: `${base}-9x16.webm`,
    mobileVideo: `${base}-9x16.mp4`,
  };
}

export type TreatmentCard = {
  title: string;
  body: string;
  href: string;
  image: string;
  imageAlt: string;
  animation?: ReturnType<typeof treatmentLoop>;
};

export const treatments: TreatmentCard[] = [
  {
    title: "All-on-4 implants",
    body: "Four implants anchor a full set of fixed teeth. No adhesive, no slipping, often no bone grafting.",
    href: "/services/all-on-4-dental-implants",
    image: media.allOn4,
    imageAlt: "A clear dental model showing a full arch of teeth supported by four implants",
    animation: treatmentLoop("allon4", media.allOn4),
  },
  {
    title: "Full arch implants",
    body: "Replace every tooth — upper, lower, or both — with permanent teeth you never take out.",
    href: "/services/full-arch-dental-implants",
    image: media.fullArch,
    imageAlt: "A full arch implant bridge beside a single implant crown",
    animation: treatmentLoop("fullarch", media.fullArch),
  },
  {
    title: "Snap-on dentures",
    body: "Your denture, but stable. Two or four implants lock it in place while you eat, talk, and smile.",
    href: "/services/denture-alternative",
    image: media.snapOn,
    imageAlt: "An implant-retained snap-on denture beside the implants it clips onto",
    animation: treatmentLoop("snapon", media.snapOn),
  },
  {
    title: "Sedation dentistry",
    body: "Sleep through the whole thing. Oral, IV, and general anaesthesia options in a monitored setting.",
    href: "/services/sedation-dentistry",
    image: media.sedation,
    imageAlt: "A patient resting with eyes closed in a dental chair while a clinician stands beside them",
    animation: treatmentLoop("sedation", media.sedation),
  },
];

export const processSteps = [
  {
    title: "A real conversation",
    body: "We sit down, listen to what you've been through, and talk in plain English about what's going on. No pressure. No sales pitch.",
  },
  {
    title: "Your custom plan",
    body: "Using 3D scans and digital imaging, we map out exactly what your new smile will look like. You'll know the timeline, the cost, and every step before anything begins.",
  },
  {
    title: "Your smile, renewed",
    body: "On treatment day, you walk in with teeth that are broken, loose, or missing — and walk out with a secure, natural-looking smile you can finally trust.",
  },
];

// The five header parents. nav.ts attaches the dropdown children to these.
export const navLinks = [
  { label: "Services", href: "/services/all-on-4-dental-implants" },
  { label: "About", href: "/meet-your-dentist" },
  { label: "Patients", href: "/what-to-expect" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact-us" },
] as const;

export type NavParentLabel = (typeof navLinks)[number]["label"];
