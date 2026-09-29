import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";
import "./globals.css";

const display = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const text = Plus_Jakarta_Sans({
  variable: "--font-text",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} | All-on-4 Dental Implants in Orléans, Ottawa`,
  description: site.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: site.name,
    description:
      "One clinic, one team, one day. All-on-4 and full arch dental implants in Orléans, Ottawa.",
    url: "/",
    siteName: site.name,
    locale: "en_CA",
    type: "website",
    images: [{ url: "/media/heroes/renew-hero.jpg", width: 1600, height: 1067 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${text.variable}`}>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
