export type NavItem = {
  label: string;
  href: string;
  children: Array<{ label: string; href: string }>;
};

export type Hour = { day: string; time: string };

export type FormField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export type ClinicForm = {
  id: string;
  submitLabel: string;
  fields: FormField[];
};

export type ClinicPerson = {
  name: string;
  honorificSuffix: string;
  jobTitle: string;
  path: string;
};

export type ClinicSite = {
  id: string;
  name: string;
  legalName: string;
  shortName: string;
  url: string;
  description: string;
  phone: { label: string; href: string };
  fax: string;
  email: string;
  address: {
    street: string;
    locality: string;
    region: string;
    postalCode: string;
    country: string;
    label: string;
  };
  mapHref: string;
  geo?: { latitude: number; longitude: number } | null;
  hours: Hour[];
  hoursNote: string;
  sameAs: string[];
  logo: string;
  logoInverse: string;
  nav: NavItem[];
  forms: ClinicForm[];
  redirects: Array<{ source: string; destination: string }>;
  areaServed: string[];
  languages: string[];
  person: ClinicPerson | null;
  mediaBaseDefault: string;
};

export type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; html: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "image"; src: string; alt: string }
  | { type: "gallery"; images: Array<{ type: "image"; src: string; alt: string }> }
  | { type: "video"; src: string; autoplay?: boolean }
  | { type: "faq"; items: Array<{ q: string; a: string }> }
  | { type: "cta"; label: string; href: string }
  | { type: "hours"; rows: Hour[] }
  | { type: "form"; id: string }
  | { type: "quotes"; items: Array<{ quote: string; name: string }> }
  | { type: "table"; rows: string[][] };

export type ClinicPage = {
  path: string;
  title: string;
  documentTitle: string;
  description: string;
  h1: string;
  blocks: Block[];
  hero: string;
  video: string;
  published: string;
  modified: string;
  formSubmit: string;
  formId: string;
  kind: "home" | "blog-index" | "post" | "team" | "legal" | "contact" | "gallery" | "page";
};
