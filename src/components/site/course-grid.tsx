import { Badge } from "@/components/ui/badge";
import type { CourseRecord } from "@/lib/data/content";
import { formatCurrency } from "@/lib/utils";

const streamTone = {
  SCIENCE: "blue",
  COMMERCE: "gold",
  ARTS: "green",
} as const;

export function CourseGrid({
  courses,
  showFees = true,
}: {
  courses: CourseRecord[];
  showFees?: boolean;
}) {
  if (!courses.length) {
    return (
      <p className="border border-dashed border-ink-300 bg-ink-50 px-5 py-8 text-center text-sm text-ink-500">
        Course details for this campus have not been published yet.
      </p>
    );
  }

  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {courses.map((course) => (
        <li
          key={course.id}
          className="flex flex-col border border-ink-200 bg-white p-5 shadow-card"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink-900">
                {course.code}
              </h3>
              <p className="mt-0.5 text-[0.85rem] text-ink-600">{course.name}</p>
            </div>
            <Badge tone={streamTone[course.stream]}>{course.stream}</Badge>
          </div>

          {course.description ? (
            <p className="mt-3 text-[0.86rem] leading-relaxed text-ink-600">
              {course.description}
            </p>
          ) : null}

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {course.subjects.map((subject) => (
              <li
                key={subject}
                className="border border-ink-200 bg-ink-50 px-2 py-0.5 text-[0.72rem] text-ink-700"
              >
                {subject}
              </li>
            ))}
          </ul>

          <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-ink-200 pt-3.5 text-[0.76rem]">
            <div>
              <dt className="text-ink-500">Duration</dt>
              <dd className="font-semibold text-ink-800">
                {course.durationYears} years
              </dd>
            </div>
            {course.intake ? (
              <div>
                <dt className="text-ink-500">Intake</dt>
                <dd className="font-semibold text-ink-800">{course.intake}</dd>
              </div>
            ) : null}
            {showFees && course.annualFee ? (
              <div>
                <dt className="text-ink-500">Annual fee</dt>
                <dd className="font-semibold text-ink-800">
                  {formatCurrency(course.annualFee)}
                </dd>
              </div>
            ) : null}
          </dl>

          {course.eligibility ? (
            <p className="mt-3 text-[0.76rem] text-ink-500">
              <span className="font-semibold text-ink-700">Eligibility: </span>
              {course.eligibility}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
