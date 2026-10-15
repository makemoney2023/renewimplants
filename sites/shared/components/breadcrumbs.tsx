import Link from "next/link";

export function Breadcrumbs({ crumbs }: { crumbs: Array<{ name: string; path: string }> }) {
  if (crumbs.length <= 1) return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((crumb, index) => {
          const current = index === crumbs.length - 1;
          return (
            <li key={`${crumb.path}-${index}`}>
              {current ? (
                <span aria-current="page">{crumb.name}</span>
              ) : (
                <Link href={crumb.path}>{crumb.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
