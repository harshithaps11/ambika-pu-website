type Stat = { id: string; label: string; value: number; suffix?: string | null };

export function StatsStrip({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;

  return (
    <section
      className="py-10"
      style={{ backgroundColor: "var(--branch-color-dark)" }}
      aria-label="College at a glance"
    >
      <div className="container-site grid grid-cols-2 gap-y-8 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="border-l border-white/15 px-5 first:border-l-0 lg:px-6"
          >
            <p className="font-serif text-[2rem] font-semibold leading-none text-gold-400 sm:text-[2.4rem]">
              {stat.value.toLocaleString("en-IN")}
              {stat.suffix ? (
                <span className="text-[1.4rem]">{stat.suffix}</span>
              ) : null}
            </p>
            <p className="mt-2 text-[0.78rem] font-medium uppercase tracking-[0.1em] text-white/70">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
