type FacilityItem = {
  id: string;
  title: string;
  description: string | null;
};

export function FacilitiesGrid({ facilities }: { facilities: FacilityItem[] }) {
  if (!facilities.length) return null;

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {facilities.map((facility) => (
        <li
          key={facility.id}
          className="border-l-2 border-gold-500 bg-white px-5 py-4 shadow-card"
        >
          <h3 className="font-serif text-[1.02rem] font-semibold text-ink-900">
            {facility.title}
          </h3>
          {facility.description ? (
            <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-600">
              {facility.description}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
