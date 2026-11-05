import { NewsSlider, type SlideInput } from "@/components/site/news-slider";
import { formatPhone, telHref } from "@/lib/utils";

const OFFICIAL_DOCUMENTS = [
  {
    title: "Karnataka Second PUC Board Syllabus & Blueprints",
    type: "PDF · Academic Ref",
    href: "/documents/pu-board-syllabus.pdf",
  },
  {
    title: "Academic Calendar & Working Days 2025–26",
    type: "PDF · Schedule",
    href: "/documents/academic-calendar-2025-26.pdf",
  },
  {
    title: "College Transportation & Bus Route Timetable",
    type: "PDF · Transit Details",
    href: "/documents/bus-routes-schedule.pdf",
  },
  {
    title: "Scholarship & Fee Concession Application Form",
    type: "PDF · Student Welfare",
    href: "/documents/scholarship-form-2025.pdf",
  },
];

export function NewsSidePanel({
  sliderItems = [],
  basePath = "",
  phone = "08251 230000",
  email = "info@ambikapucollege.edu.in",
  campusName,
}: {
  sliderItems?: SlideInput[];
  basePath?: string;
  phone?: string | null;
  email?: string | null;
  campusName?: string | null;
}) {
  const displayPhone = phone || "08251 230000";
  const displayEmail = email || "info@ambikapucollege.edu.in";

  return (
    <div className="space-y-6">
      {/* 1. Sliding Photo News & Events Box */}
      <div className="overflow-hidden rounded-2xl border border-ink-200/90 bg-white shadow-card">
        <NewsSlider
          items={sliderItems}
          title="Photo Highlights"
          basePath={basePath}
          viewAllHref={basePath ? `${basePath}/news` : "/news"}
        />
      </div>

      {/* 2. Official Circulars & Download Center */}
      <div className="rounded-2xl border border-ink-200/90 bg-white p-5 shadow-card">
        <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-50 text-gold-700">
            📄
          </span>
          <div>
            <h3 className="font-serif text-[1rem] font-bold text-ink-900">
              Official Circulars
            </h3>
            <p className="text-[0.7rem] uppercase tracking-wider text-ink-500 font-semibold">
              Public Documents &amp; Forms
            </p>
          </div>
        </div>

        <ul className="mt-3.5 divide-y divide-ink-100">
          {OFFICIAL_DOCUMENTS.map((doc, index) => (
            <li key={index} className="py-2.5 first:pt-0 last:pb-0">
              <a
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-3 transition-colors hover:text-brand-700"
              >
                <div>
                  <p className="text-xs font-semibold text-ink-800 transition-colors group-hover:text-brand-700">
                    {doc.title}
                  </p>
                  <p className="mt-0.5 text-[0.68rem] text-ink-400 font-medium">
                    {doc.type}
                  </p>
                </div>
                <span className="shrink-0 rounded-md border border-ink-200 bg-ink-50 px-2 py-1 text-[0.65rem] font-bold text-ink-600 transition-colors group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-700">
                  PDF ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Office Helpdesk & Verification */}
      <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/60 via-white to-gold-50/40 p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-700 text-white text-xs">
            🏛️
          </span>
          <div>
            <h3 className="font-serif text-[1rem] font-bold text-ink-900">
              Notice Board Desk
            </h3>
            <p className="text-[0.7rem] uppercase tracking-wider text-brand-700 font-bold">
              {campusName || "Administrative Office"}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-ink-600">
          For physical document verification, circular enquiries, or examination roll hall-tickets, reach our office during college working hours.
        </p>

        <div className="mt-4 space-y-2.5 border-t border-brand-100 pt-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-ink-500 font-medium">Telephone</span>
            <a
              href={telHref(displayPhone)}
              className="font-sans font-bold tabular-nums text-brand-700 hover:text-brand-900 underline underline-offset-2"
            >
              {formatPhone(displayPhone) || displayPhone}
            </a>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-ink-500 font-medium">Email</span>
            <a
              href={`mailto:${displayEmail}`}
              className="font-mono text-[0.72rem] text-ink-700 hover:text-brand-700 truncate max-w-[170px]"
            >
              {displayEmail}
            </a>
          </div>

          <div className="flex items-center justify-between text-[0.72rem]">
            <span className="text-ink-500 font-medium">Office Hours</span>
            <span className="font-semibold text-ink-800">8:30 AM – 4:30 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}

