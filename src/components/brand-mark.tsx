import Link from "next/link";
import { brandLogo, site } from "@/content/site";

// The original site rendered its wordmark as styled text (no logo file was
// ever served), so the rebuild keeps the mark as accessible type.
// A clinic config can supply brandLogo; Renew leaves it null.
export function BrandMark({ className }: { className?: string }) {
  const classes = className ? `brand ${className}` : "brand";

  if (brandLogo) {
    return (
      <Link className={classes} href="/" aria-label={`${site.name} home`}>
        <img className="brand-logo" src={brandLogo.src} alt="" width={brandLogo.width} height={brandLogo.height} />
      </Link>
    );
  }

  return (
    <Link className={classes} href="/" aria-label={`${site.name} home`}>
      <span className="brand-word">renew</span>
      <span className="brand-caps">implants</span>
    </Link>
  );
}
