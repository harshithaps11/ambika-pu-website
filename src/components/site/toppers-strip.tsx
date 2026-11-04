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
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {toppers.map((topper) => (
        <li
          key={topper.id}
          className="group relative flex flex-col items-center justify-between rounded-2xl border border-ink-200/90 bg-white p-6 sm:p-7 text-center shadow-card transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-gold-400 hover:shadow-raise"
        >
          {/* Big Photo Container */}
          <div className="h-44 w-44 sm:h-52 sm:w-52 overflow-hidden rounded-2xl border-2 border-gold-400/80 bg-ink-50 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-gold-500 group-hover:shadow-md">
            <Avatar
              name={topper.studentName}
              src={topper.photoUrl}
              rounded="xl"
              className="h-full w-full object-cover rounded-xl text-3xl font-bold"
            />
          </div>

          {/* Student Info */}
          <div className="mt-4 w-full">
            <h3 className="font-serif text-[1.12rem] font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-700">
              {topper.studentName}
            </h3>

            {/* Stream & Year in crisp professional sans-serif numerals */}
            <p className="mt-1 font-sans text-xs font-semibold uppercase tracking-wider text-ink-500 tabular-nums">
              {topper.stream} · <span className="font-semibold text-ink-700">{topper.academicYear}</span>
            </p>

            {/* Percentage in clean, modern, bold lining numerals */}
            <p className="mt-3 font-sans font-black text-3xl sm:text-[2.1rem] leading-none tracking-tight text-brand-700 tabular-nums">
              {topper.percentage.toFixed(2)}
              <span className="text-xl sm:text-2xl font-bold text-brand-600">%</span>
            </p>

            {/* Rank badge shown only when present */}
            {topper.rankLabel ? (
              <span className="mt-3 inline-block rounded-full border border-gold-300 bg-gold-50 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-gold-800">
                {topper.rankLabel}
              </span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
