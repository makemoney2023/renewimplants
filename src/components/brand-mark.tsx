import Link from "next/link";
import { site } from "@/content/site";

// The original site rendered its wordmark as styled text (no logo file was
// ever served), so the rebuild keeps the mark as accessible type.
export function BrandMark({ className }: { className?: string }) {
  return (
    <Link className={className ? `brand ${className}` : "brand"} href="/" aria-label={`${site.name} home`}>
      <span className="brand-word">renew</span>
      <span className="brand-caps">implants</span>
    </Link>
  );
}
