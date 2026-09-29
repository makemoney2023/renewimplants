import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RouteLink } from "@/content/routes";

export function RouteActions({ links }: { links: RouteLink[] }) {
  return (
    <aside className="content-actions" aria-label="Next steps">
      {links.map((link, index) => (
        <RouteButton key={`${link.href}-${link.label}`} link={link} primary={index === 0} />
      ))}
    </aside>
  );
}

function RouteButton({
  link,
  primary,
}: {
  link: RouteLink;
  primary: boolean;
}) {
  const isExternal =
    link.href.startsWith("mailto:") ||
    link.href.startsWith("tel:") ||
    link.href.startsWith("http");
  const content = (
    <>
      {link.label}
      <ArrowUpRight aria-hidden="true" />
    </>
  );

  return (
    <Button asChild size="lg" variant={primary ? "default" : "outline"}>
      {isExternal ? (
        <a href={link.href} rel={link.href.startsWith("http") ? "noreferrer" : undefined}>
          {content}
        </a>
      ) : (
        <Link href={link.href}>{content}</Link>
      )}
    </Button>
  );
}
