import type { ReactNode } from "react";
import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import { JsonLd } from "@shell/components/json-ld";
import { QuizStickyBar } from "@shell/components/quiz/quiz-sticky-bar";
import { UtmCapture } from "@shell/components/quiz/utm-capture";
import { SiteFooter } from "@shell/components/site-footer";
import { SiteHeader } from "@shell/components/site-header";
import { mediaUrl } from "@shell/lib/media";
import { siteOrigin } from "@shell/lib/origin";
import { buildSiteGraph } from "@shell/lib/schema";
import { site } from "@/content/load";
import "@shell/styles.css";
import "../theme.css";

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
  metadataBase: new URL(siteOrigin()),
  title: { absolute: site.name },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: site.name,
    description: site.description,
    url: "/",
    siteName: site.name,
    locale: "en_CA",
    type: "website",
    images: [{ url: mediaUrl(site.logo) }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-CA">
      <body className={`${display.variable} ${text.variable}`}>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <UtmCapture />
        <SiteHeader />
        {children}
        <SiteFooter />
        <QuizStickyBar />
        <JsonLd data={buildSiteGraph(site)} />
      </body>
    </html>
  );
}
