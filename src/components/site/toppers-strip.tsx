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
          className="flex flex-col items-center border border-ink-200 bg-white px-4 py-6 text-center shadow-card"
        >
          <Avatar
            name={topper.studentName}
            src={topper.photoUrl}
            className="h-20 w-20 border-2 border-gold-400 text-xl"
          />

          <p className="mt-3 font-serif text-[0.95rem] font-semibold leading-snug text-ink-900">
            {topper.studentName}
          </p>

          <p className="mt-0.5 text-[0.72rem] uppercase tracking-wider text-ink-500">
            {topper.stream} · {topper.academicYear}
          </p>

          <p className="mt-2.5 font-serif text-2xl font-semibold text-brand-700">
            {topper.percentage.toFixed(2)}
            <span className="text-base">%</span>
          </p>

          {topper.rankLabel ? (
            <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-wider text-gold-600">
              {topper.rankLabel}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
