import Link from "next/link";

type Crumb = { label: string; href?: string };

export function PageHeader({
  title,
  description,
  crumbs = [],
}: {
  title: string;
  description?: string | null;
  crumbs?: Crumb[];
}) {
  return (
    <header
      className="border-b-4 border-gold-500 py-8 sm:py-10"
      style={{ backgroundColor: "var(--branch-color-dark)" }}
    >
      <div className="container-site">
        {crumbs.length ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.74rem] text-white/60">
              {crumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-gold-300"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white/85">{crumb.label}</span>
                  )}
                  {index < crumbs.length - 1 ? <span aria-hidden>/</span> : null}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <h1 className="mt-2 font-serif text-[1.6rem] font-semibold text-white sm:text-[2rem]">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-white/75">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
