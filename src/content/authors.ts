import { media } from "./site";

export const AUTHOR_KEYS = ["tom-szarski"] as const;
export type AuthorKey = (typeof AUTHOR_KEYS)[number];

export type Author = {
  key: AuthorKey;
  name: string;
  credential: string;
  role: string;
  profilePath: string;
  image: string;
};

export const authors: Record<AuthorKey, Author> = {
  "tom-szarski": {
    key: "tom-szarski",
    name: "Tom Szarski",
    credential: "DD",
    role: "Denturist and founder, Renew Implant Centre",
    profilePath: "/meet-your-dentist",
    image: media.tom,
  },
};
