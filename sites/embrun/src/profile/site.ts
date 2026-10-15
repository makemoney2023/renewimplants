import leadSiteJson from "../../content/site.json";
import type { ClinicSite } from "@shell/types";
import type { ScrollAct, TreatmentCard } from "../../../../src/content/site";

const MEDIA_BASE = (
  process.env.MEDIA_BASE_URL ||
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
  "https://pub-5816dac948084d6bbbebbfef2581cc24.r2.dev"
).replace(/\/$/, "");

export function mediaUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${MEDIA_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export const leadSite = leadSiteJson as ClinicSite;

export const site = {
  name: "Embrun Denture & Implant Centre",
  shortName: "Embrun Dentures",
  url: "https://www.embrundentures.com",
  description: "Denture and implant centre in Embrun, Ontario. Custom dentures, implants, and denture care from a denturist near you.",
  phone: {
    label: "(613) 219-2945",
    href: "tel:613-219-2945",
  },
  email: "info@embrundentures.ca",
  primaryCta: { label: "Request an appointment", href: "/contact-us" },
  secondaryCta: { label: "Canadian Dental Care Plan", href: "/canadian-dental-care-plan" },
  address: "614 Notre-Dame St, Embrun, ON K4R 1E5",
  mapHref: "https://www.google.com/maps/search/?api=1&query=614+Notre-Dame+St+Embrun+ON+K4R+1E5",
  hours: [
    {
      day: "Monday",
      time: "8:00am - 4:00pm",
    },
    {
      day: "Tuesday",
      time: "8:00am - 3:00pm",
    },
    {
      day: "Wednesday",
      time: "9:00am - 3:00pm",
    },
    {
      day: "Thursday",
      time: "9:00am - 3:00pm",
    },
    {
      day: "Friday",
      time: "9:00am - 3:00pm",
    },
    {
      day: "Saturday",
      time: "Closed",
    },
    {
      day: "Sunday",
      time: "Closed",
    },
  ],
};

export const heroLines: readonly [string, string] = ["Denture care,", "in Embrun."];
export const headerCta = "Request an appointment";
export const trustNote = { strong: "CDCP guidance \u00b7 In-house dentures", span: "More than 20 years of experience" };
export const panorama = { label: "Inside Embrun Denture & Implant Centre", caption: "Denture and implant visits at 614 Notre-Dame St, Embrun." };
export const doctorLink = { label: "Meet Tom Szarski, DD", href: "/meet-your-dentist" };
export const featuredReviewNames: string[] = [];
export const footerNote = "Denture and implant care in Embrun, at 614 Notre-Dame St.";
export const legalLinks = [
  {
    label: "Sitemap",
    href: "/sitemap",
  },
  {
    label: "FAQ",
    href: "/faq",
  },
];
export const sitemapExtras = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "FAQ",
    href: "/faq",
  },
];
export const brandLogo = { src: mediaUrl("/embrun/ba99cb83_embrun-denture-and-implant-centre-logo.png"), width: 240, height: 72 };
export const homeFaqQuestions = ["What types of dentures do you offer?", "How long does it take to get a new denture?", "Can dental implants improve my chewing and speech?"] as const;
export const blogHero = { src: mediaUrl("/embrun/43c94dcd_dr-tom-szarski-new.png"), alt: "Tom Szarski, DD" };
export const blogIntro = "Explore our blog for informative articles, helpful tips, and the latest updates designed to keep you informed and confident before your next visit.";
export const blogTitle = "Blog";
export const formsBySlug: Record<string, string> = {
  "contact-us": "gform2",
  "request-an-appointment": "gform1",
};

export const practice = {
  telephone: "+1-613-219-2945",
  streetAddress: "614 Notre-Dame St",
  addressLocality: "Embrun",
  addressRegion: "ON",
  postalCode: "K4R 1E5",
  addressCountry: "CA",
  areaServed: ["Embrun", "Russell", "Brisson", "Forest Park", "Forget", "Longtinville"],
  availableLanguage: ["en", "fr"],
  paymentAccepted: "Canadian Dental Care Plan (CDCP)",
  servicesHub: "/services/dentures",
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
  heroClinic: mediaUrl("/embrun/b7a67d63_denture-clinic-near-me-in-embrum-on.webp"),
  heroConsult: mediaUrl("/embrun/43c94dcd_dr-tom-szarski-new.png"),
  clinic: mediaUrl("/embrun/b7a67d63_denture-clinic-near-me-in-embrum-on.webp"),
  tom: mediaUrl("/embrun/43c94dcd_dr-tom-szarski-new.png"),
  team: mediaUrl("/embrun/2b01eced_Office_19.jpg"),
};

export const implantAnimation: {
  poster: string;
  mobilePoster: string;
  webm: string;
  video: string;
  mobileWebm: string;
  mobileVideo: string;
  alt: string;
} | null = null;

export const scrollActs: ScrollAct[] = [
  {
    id: "arrival",
    label: "Embrun, Ontario",
    title: "Denture care, in Embrun.",
    body: "At Embrun Denture & Implant Centre, we understand that every smile is unique and deserves personalized attention.",
    image: media.heroClinic,
    imageAlt: "Embrun Denture & Implant Centre",
    device: "parallax" as const,
    span: 1.7,
  },
  {
    id: "trust",
    label: "Your denturist",
    title: "Care from a denturist.",
    body: "Tom Szarski is an award-winning Denturist who owns and operates the Orl\u00e9ans Denture Clinic located in the National Capital Region. He graduated from George Brown College in 2003 at the top of his class having received the A.J. McGuire Award.",
    image: mediaUrl("/embrun/43c94dcd_dr-tom-szarski-new.png"),
    imageAlt: "Tom Szarski, DD",
    device: "kinetic" as const,
    span: 1.5,
  },
  {
    id: "choice",
    label: "Dentures and implants",
    title: "Dentures and implants in Embrun.",
    body: "At Embrun Denture & Implant Centre, your smile is a new beginning. Confidence makes a world of difference. That is why we offer a full range of denture and implant solutions tailored to your individual oral health needs, prioritizing your comfort and satisfaction.",
    image: mediaUrl("/embrun/e347929c_dentures-in-embrun-on.webp"),
    imageAlt: "Denture care in Embrun",
    device: "rail" as const,
    span: 2,
  },
  {
    id: "connection",
    label: "Meet Tom Szarski, DD",
    title: "Tom Szarski, DD.",
    body: "Tom Szarski is an award-winning Denturist who owns and operates the Orl\u00e9ans Denture Clinic located in the National Capital Region. He graduated from George Brown College in 2003 at the top of his class having received the A.J. McGuire Award.",
    image: media.tom,
    imageAlt: "Portrait of denturist Tom Szarski",
    device: "split" as const,
    span: 1.4,
  },
  {
    id: "proof",
    label: "The clinic",
    title: "A bright, welcoming clinic.",
    body: "Step into a bright and welcoming space thoughtfully designed with your comfort in mind. Our modern clinic combines a friendly, relaxed atmosphere with advanced technology to ensure every treatment is efficient, precise, and tailored to your needs.",
    image: media.clinic,
    imageAlt: "Embrun Denture & Implant Centre",
    device: "panorama" as const,
    span: 2.8,
    peak: true,
  },
  {
    id: "commitment",
    label: "Appointments",
    title: "Request an appointment.",
    body: "Call (613) 219-2945 or send a request. The clinic is at 614 Notre-Dame St, Embrun, ON K4R 1E5.",
    image: media.heroClinic,
    imageAlt: "Embrun Denture & Implant Centre",
    device: "iris" as const,
    span: 1.4,
  },
];

export const treatments: TreatmentCard[] = [
  {
    title: "Dentures",
    body: "Full Dentures",
    href: "/services/dentures",
    image: mediaUrl("/embrun/e347929c_dentures-in-embrun-on.webp"),
    imageAlt: "Dentures in Embrun, ON",
  },
  {
    title: "Dental implants",
    body: "Although dental implants are an effective way to replace lost teeth, not everyone is a good candidate for them. You might be a good match for dental implants if:",
    href: "/services/dental-implants",
    image: mediaUrl("/embrun/a2211537_dental-implants-in-embrun-on.jpg"),
    imageAlt: "Dental Implants in Embrun, ON",
  },
  {
    title: "Relines and repairs",
    body: "Are your dentures loose, sore, or not fitting like they used to? Your mouth can change shape over time, and dentures that once fit well may become uncomfortable or even fall out.",
    href: "/services/relines-repairs",
    image: mediaUrl("/embrun/c18e6e5e_denture-relines-and-repairs-in-embrun-on.jpg"),
    imageAlt: "Denture Relines and Repairs in Embrun, ON",
  },
  {
    title: "Teeth whitening",
    body: "At Embrun Denture & Implant Centre, our teeth whitening is safe, gentle, and performed by a trained dental professional.",
    href: "/services/teeth-whitening",
    image: mediaUrl("/embrun/e0a59abe_teeth-whitening-in-embrun-on.jpg"),
    imageAlt: "Teeth Whitening in Embrun, ON",
  },
];

export const processSteps = [
  {
    title: "From the moment you enter our office, our",
    body: "From the moment you enter our office, our team is working diligently to make you feel comfortable at every stage of your visit.",
  },
  {
    title: "During your denture consultation, our team",
    body: "During your denture consultation, our team will assess your oral health, discuss your needs and preferences, and create a personalized treatment plan to restore your smile and confidence.",
  },
  {
    title: "Taking denture impressions is a quick and",
    body: "Taking denture impressions is a quick and painless process that involves creating molds of your mouth to ensure a perfect fit for your custom dentures.",
  },
];

export const panoramaTiles = [
  {
    src: mediaUrl("/embrun/b7a67d63_denture-clinic-near-me-in-embrum-on.webp"),
    alt: "Embrun Denture & Implant Centre",
  },
  {
    src: mediaUrl("/embrun/43c94dcd_dr-tom-szarski-new.png"),
    alt: "Tom Szarski, DD",
  },
  {
    src: mediaUrl("/embrun/2b01eced_Office_19.jpg"),
    alt: "Inside the clinic",
  },
  {
    src: mediaUrl("/embrun/38527be7_dental-implant-centre-in-embrun-on.jpg"),
    alt: "The clinic",
  },
];

export const navLinks = [
  { label: "Services", href: "/services/dentures" },
  { label: "About", href: "/meet-your-dentist" },
  { label: "Patients", href: "/what-to-expect" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact-us" },
] as const;
