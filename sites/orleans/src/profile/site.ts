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
  name: "Orleans Denture Clinic",
  shortName: "Orleans Denture Clinic",
  url: "https://orleansdentureclinic.com",
  description: "Denture specialists and implant centre in Orl\u00e9ans, Ottawa. Custom dentures, repairs, and dental implants at 2882 St. Joseph Blvd.",
  phone: {
    label: "613-590-9200",
    href: "tel:613-590-9200",
  },
  email: "info@orleansdentureclinic.ca",
  primaryCta: { label: "Book a free consultation", href: "/contact-us" },
  secondaryCta: { label: "Canadian Dental Care Plan", href: "/canadian-dental-care-plan" },
  address: "2882 St. Joseph Blvd., Orl\u00e9ans, ON K1C 1G7",
  mapHref: "https://www.google.com/maps/search/?api=1&query=2882+St+Joseph+Blvd+Orleans+ON+K1C+1G7",
  hours: [
    {
      day: "Monday",
      time: "8:00am - 6:00pm",
    },
    {
      day: "Tuesday",
      time: "8:00am - 4:30pm",
    },
    {
      day: "Wednesday",
      time: "8:00am - 3:00pm",
    },
    {
      day: "Thursday",
      time: "8:00am - 4:30pm",
    },
    {
      day: "Friday",
      time: "8:00am - 3:00pm",
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

export const heroLines: readonly [string, string] = ["Dentures and implants,", "in Orl\u00e9ans."];
export const headerCta = "Free consultation";
export const trustNote = { strong: "CDCP welcome \u00b7 On-site dental lab", span: "Free consultations \u00b7 Dentures and implants" };
export const panorama = { label: "Inside Orleans Denture Clinic", caption: "Consultation, lab work, and follow-up at 2882 St. Joseph Blvd." };
export const doctorLink = { label: "Meet Tom Szarski, DD", href: "/meet-your-dentist" };
export const featuredReviewNames: string[] = [];
export const footerNote = "Dentures and implants in Orl\u00e9ans, at 2882 St. Joseph Blvd. On-site dental lab.";
export const legalLinks = [
  {
    label: "Sitemap",
    href: "/sitemap",
  },
  {
    label: "FAQ",
    href: "/faq",
  },
  {
    label: "Privacy policy",
    href: "/privacy-policy",
  },
  {
    label: "Terms of use",
    href: "/terms",
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
  {
    label: "Privacy policy",
    href: "/privacy-policy",
  },
  {
    label: "Terms of use",
    href: "/terms",
  },
];
export const brandLogo = { src: mediaUrl("/orleans/49258636_odc-full-logo.svg"), width: 220, height: 64 };
export const homeFaqQuestions = ["How can I make an appointment?", "Do you offer insurance?", "Do I need to be referred by a doctor?"] as const;
export const blogHero = { src: mediaUrl("/orleans/e3a33714_Tom_0070-min-1.jpg"), alt: "Tom Szarski, DD" };
export const blogIntro = "Welcome to the Orleans Denture Clinic blog! Here, we share expert tips, insights, and the latest in denture care to help you smile with confidence.";
export const blogTitle = "Our blog";
export const formsBySlug: Record<string, string> = {
  "contact-us": "orleans",
};

export const practice = {
  telephone: "+1-613-590-9200",
  streetAddress: "2882 St. Joseph Blvd.",
  addressLocality: "Orl\u00e9ans",
  addressRegion: "ON",
  postalCode: "K1C 1G7",
  addressCountry: "CA",
  areaServed: ["Ottawa", "Orleans", "Vanier"],
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
  heroClinic: mediaUrl("/orleans/216efa07_Orleans-Denture-Clinic-Office-Lab-Desk-e1790869327511.jpg"),
  heroConsult: mediaUrl("/orleans/e3a33714_Tom_0070-min-1.jpg"),
  clinic: mediaUrl("/orleans/216efa07_Orleans-Denture-Clinic-Office-Lab-Desk-e1790869327511.jpg"),
  tom: mediaUrl("/orleans/e3a33714_Tom_0070-min-1.jpg"),
  team: mediaUrl("/orleans/e3a33714_Tom_0070-min-1.jpg"),
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
    label: "Orl\u00e9ans, Ottawa",
    title: "Dentures and implants, in Orl\u00e9ans.",
    body: "Expert denture care in Orl\u00e9ans, helping patients across Ottawa feel comfortable, confident, and at ease with their smile.",
    image: media.heroClinic,
    imageAlt: "The front desk and lab at Orleans Denture Clinic",
    device: "parallax" as const,
    span: 1.7,
  },
  {
    id: "trust",
    label: "On-site dental lab",
    title: "Dentures made in Orl\u00e9ans.",
    body: "Our impressive lab gives us control, quality, and convenience, allowing us to fabricate any prosthesis on-demand and on-site.",
    image: mediaUrl("/orleans/853442bf_mb-slide.png"),
    imageAlt: "The on-site dental lab",
    device: "kinetic" as const,
    span: 1.5,
  },
  {
    id: "choice",
    label: "Our services",
    title: "Dentures, implants, and repairs.",
    body: "Come see why Ottawa\u2019s best dental professionals have been referring their patients to our clinic with confidence. We have been a long-time trusted pillar in the Ottawa area and have earned a reputation based on superior quality and customer service.",
    image: mediaUrl("/orleans/e6413369_Group-760-1-1.png"),
    imageAlt: "Denture care at Orleans Denture Clinic",
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
    label: "With you at every step",
    title: "The same team, from the first visit.",
    body: "Our staff will ensure that you are comfortable through every step of the process \u2013 from being welcomed by our receptionist when you walk in the door, to facilitating all follow-up appointments and care. Our whole office is newly renovated.",
    image: media.clinic,
    imageAlt: "The front desk and lab at Orleans Denture Clinic",
    device: "panorama" as const,
    span: 2.8,
    peak: true,
  },
  {
    id: "commitment",
    label: "Free consultation",
    title: "Book a free consultation.",
    body: "The clinic is at 2882 St. Joseph Blvd., Orl\u00e9ans, ON K1C 1G7. Call 613-590-9200.",
    image: media.heroClinic,
    imageAlt: "The front desk and lab at Orleans Denture Clinic",
    device: "iris" as const,
    span: 1.4,
  },
];

export const treatments: TreatmentCard[] = [
  {
    title: "Full dentures",
    body: "Complete dentures are a removable prosthesis used to replace natural teeth. If you are missing all of your teeth, complete dentures are the affordable solution for you.",
    href: "/services/full-dentures",
    image: mediaUrl("/orleans/e6413369_Group-760-1-1.png"),
    imageAlt: "Full Dentures in Orleans",
  },
  {
    title: "Partial dentures",
    body: "Partial dentures are a removable option used to replace one or more missing teeth and fill the spaces in your smile.",
    href: "/services/partial-dentures",
    image: mediaUrl("/orleans/8dfd2a5c_Group-760-3-1.png"),
    imageAlt: "Partial Dentures in Orleans",
  },
  {
    title: "Dental implants",
    body: "At Orleans Denture Clinic, we make your dental implant experience smooth, comfortable, and fully guided from start to finish.",
    href: "/services/dental-implants",
    image: mediaUrl("/orleans/097a24de_Group-773-1.png"),
    imageAlt: "Dental Implants in Orleans",
  },
  {
    title: "Suction dentures",
    body: "Lower dentures can be difficult to keep stable.",
    href: "/services/suction-dentures",
    image: mediaUrl("/orleans/bf955896_Suction-SEMCD-Dentures-in-Orleans-.png"),
    imageAlt: "Suction Dentures in Orléans",
  },
];

export const processSteps = [
  {
    title: "What to Expect",
    body: "Orleans Denture Clinic in Ottawa",
  },
  {
    title: "What to Expect (2)",
    body: "Our staff will ensure that you are comfortable through every step of the process – from being welcomed by our receptionist when you walk in the door, to facilitating all follow-up appointments and care.",
  },
  {
    title: "Book a Free Consultation",
    body: "The Orléans Denture Clinic and Implant Centre provides patients with high-quality, custom dentures and implants.",
  },
];

export const panoramaTiles = [
  {
    src: mediaUrl("/orleans/216efa07_Orleans-Denture-Clinic-Office-Lab-Desk-e1790869327511.jpg"),
    alt: "The front desk at Orleans Denture Clinic",
  },
  {
    src: mediaUrl("/orleans/853442bf_mb-slide.png"),
    alt: "The on-site dental lab",
  },
  {
    src: mediaUrl("/orleans/e3a33714_Tom_0070-min-1.jpg"),
    alt: "Tom Szarski, DD",
  },
  {
    src: mediaUrl("/orleans/714f33eb_Mask-group-10-1.png"),
    alt: "A visit to the clinic",
  },
];

export const navLinks = [
  { label: "Services", href: "/services/dentures" },
  { label: "About", href: "/meet-your-dentist" },
  { label: "Patients", href: "/what-to-expect" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact-us" },
] as const;
