import { Avatar } from "@/components/site/avatar";

type Topper = {
  id: string;
  studentName: string;
  photoUrl?: string | null;
  percentage: number;
  stream: string;
  academicYear: string;
  rankLabel?: string | null;
};

export function ToppersStrip({ toppers }: { toppers: Topper[] }) {
  if (!toppers.length) return null;

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {toppers.map((topper) => (
        <li
          key={topper.id}
          className="group relative flex flex-col items-center rounded-xs border border-ink-200/90 bg-white px-4 py-6 text-center shadow-card transition-all duration-300 ease-out hover:-translate-y-2 hover:border-gold-400 hover:shadow-raise"
        >
          <div className="relative">
            <Avatar
              name={topper.studentName}
              src={topper.photoUrl}
              className="h-20 w-20 border-2 border-gold-400 text-xl transition-all duration-300 group-hover:scale-105 group-hover:border-gold-500 group-hover:ring-4 group-hover:ring-gold-300/40"
            />
          </div>

          <p className="mt-3.5 font-serif text-[0.98rem] font-semibold leading-snug text-ink-900 transition-colors group-hover:text-brand-700">
            {topper.studentName}
          </p>

          <p className="mt-0.5 text-[0.72rem] font-medium uppercase tracking-wider text-ink-500">
            {topper.stream} · {topper.academicYear}
          </p>

          <p className="mt-2.5 font-serif text-2xl font-semibold text-brand-700 transition-transform duration-200 group-hover:scale-108">
            {topper.percentage.toFixed(2)}
            <span className="text-base">%</span>
          </p>

          {topper.rankLabel ? (
            <span className="mt-1.5 inline-block rounded-full border border-gold-300/80 bg-gold-50 px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-gold-700">
              {topper.rankLabel}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
