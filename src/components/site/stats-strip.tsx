type Stat = { id: string; label: string; value: number; suffix?: string | null };

export function StatsStrip({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;

  return (
    <section
      className="relative overflow-hidden py-12 bg-texture-dark border-y border-gold-500/20 shadow-inner"
      style={{ backgroundColor: "var(--branch-color-dark)" }}
      aria-label="College at a glance"
    >
      <div className="container-site grid grid-cols-2 gap-y-8 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="group border-l border-white/15 px-5 first:border-l-0 lg:px-6 transition-all duration-300 hover:bg-white/5 rounded-xs py-2"
          >
            <p className="font-sans font-black text-[2.4rem] tracking-tight leading-none text-gold-400 sm:text-[2.85rem] tabular-nums transition-transform duration-300 group-hover:translate-x-1">
              {stat.value.toLocaleString("en-IN")}
              {stat.suffix ? (
                <span className="ml-0.5 text-[1.5rem] font-bold text-gold-300">{stat.suffix}</span>
              ) : null}
            </p>
            <p className="mt-2 text-[0.78rem] font-medium uppercase tracking-[0.12em] text-white/75 transition-colors duration-200 group-hover:text-white">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
