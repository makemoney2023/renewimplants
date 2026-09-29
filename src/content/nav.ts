export type NavChild = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  children: NavChild[];
};

export type RouteAlias = {
  source: string;
  destination: string;
};

const primaryNav: NavItem[] = [
  {
    label: "Services",
    href: "/services/all-on-4-dental-implants",
    children: [
      { label: "All-on-4 dental implants", href: "/services/all-on-4-dental-implants" },
      { label: "Same day dental implants", href: "/services/same-day-dental-implants" },
      { label: "Full arch dental implants", href: "/services/full-arch-dental-implants" },
      { label: "Upper jaw implants", href: "/services/upper-jaw-implants" },
      { label: "Lower jaw implants", href: "/services/lower-jaw-implants" },
      { label: "Denture alternative", href: "/services/denture-alternative" },
      { label: "Sedation dentistry", href: "/services/sedation-dentistry" },
      { label: "Failed dental work", href: "/services/failed-dental-work" },
    ],
  },
  {
    label: "About",
    href: "/meet-your-dentist",
    children: [
      { label: "Meet your dentist", href: "/meet-your-dentist" },
      { label: "Why choose us", href: "/why-choose-us" },
      { label: "Scared of the dentist?", href: "/dental-anxiety" },
      { label: "Patient stories", href: "/patient-stories" },
      { label: "Before and after", href: "/before-after" },
    ],
  },
  {
    label: "Patients",
    href: "/what-to-expect",
    children: [
      { label: "What to expect", href: "/what-to-expect" },
      { label: "Pricing and financing", href: "/pricing" },
      { label: "FAQ", href: "/faq" },
      { label: "Easy Implant", href: "/easy-implant-en" },
      { label: "Service areas", href: "/service-areas" },
    ],
  },
  {
    label: "Blog",
    href: "/blog",
    children: [
      { label: "Why people choose All-on-4", href: "/blog/why-people-are-choosing-all-on-4" },
      { label: "Dentures vs. implants", href: "/blog/dentures-vs-dental-implants" },
      { label: "New teeth in one day", href: "/blog/same-day-dental-implants-new-teeth-one-day" },
      {
        label: "All-on-4 after years of tooth loss",
        href: "/blog/all-on-4-dental-implants-after-years-of-missing-teeth",
      },
      { label: "Full arch vs. individual implants", href: "/blog/full-arch-vs-individual-dental-implants" },
    ],
  },
  {
    label: "Contact",
    href: "/contact-us",
    children: [
      { label: "Contact us", href: "/contact-us" },
      { label: "For dentists", href: "/for-dentists" },
    ],
  },
];

const routeAliases: RouteAlias[] = [
  { source: "/home", destination: "/" },
  { source: "/services", destination: "/services/all-on-4-dental-implants" },
  { source: "/about", destination: "/meet-your-dentist" },
  { source: "/easy-implant", destination: "/easy-implant-en" },
];

export function getPrimaryNav() {
  return primaryNav;
}

export function getRouteAliases() {
  return routeAliases;
}
