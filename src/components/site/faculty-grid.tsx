"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/site/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type FacultyMember = {
  id: string;
  name: string;
  designation: string;
  department?: string | null;
  qualification?: string | null;
  experienceYears?: number | null;
  email?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  branchId?: string;
};

export function FacultyGrid({ faculty }: { faculty: FacultyMember[] }) {
  const [selected, setSelected] = useState<FacultyMember | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };
    if (selected) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selected]);

  const departments = [...new Set(faculty.map((f) => f.department ?? "Faculty"))];

  return (
    <div className="space-y-14">
      {departments.map((department) => {
        const members = faculty.filter(
          (m) => (m.department ?? "Faculty") === department,
        );

        return (
          <div key={department} className="space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-brand-700/20 pb-3">
              <span className="h-6 w-1.5 rounded-full bg-brand-700" />
              <h2 className="font-serif text-2xl font-bold tracking-tight text-ink-900">
                {department}
              </h2>
              <span className="ml-auto rounded-full bg-ink-100 px-3 py-0.5 text-xs font-semibold text-ink-600">
                {members.length} {members.length === 1 ? "Lecturer" : "Faculty Members"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setSelected(member)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink-200/90 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-raise cursor-pointer"
                >
                  {/* Top Photo Section */}
                  <div className="relative h-64 w-full overflow-hidden bg-gradient-to-b from-ink-100 to-ink-200">
                    <Avatar
                      name={member.name}
                      src={member.photoUrl}
                      rounded="sm"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 text-4xl"
                    />

                    {/* Gradient Overlay for photo contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Designation Badge pinned on photo bottom */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="inline-block rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-700 shadow-sm backdrop-blur-xs">
                        {member.designation}
                      </span>
                      {member.experienceYears ? (
                        <span className="rounded-md bg-black/60 px-2 py-0.5 text-[0.7rem] font-sans font-semibold tabular-nums text-white backdrop-blur-xs">
                          {member.experienceYears} Yrs Exp
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="font-serif text-[1.12rem] font-bold leading-snug text-ink-900 group-hover:text-brand-700 transition-colors">
                        {member.name}
                      </h3>

                      {member.qualification ? (
                        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-600 font-medium">
                          <span className="shrink-0 text-brand-700">🎓</span>
                          <span>{member.qualification}</span>
                        </p>
                      ) : null}

                      {member.bio ? (
                        <p className="mt-2.5 text-xs text-ink-500 line-clamp-2 leading-relaxed">
                          {member.bio}
                        </p>
                      ) : (
                        <p className="mt-2.5 text-xs italic text-ink-400">
                          Click to view qualifications and academic experience.
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Know More</span>
                        <span>→</span>
                      </span>
                      <span className="text-[0.72rem] text-ink-400 font-medium">Profile</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Interactive Detail Modal Box */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl w-full max-h-[90vh] bg-white rounded-2xl shadow-raise border border-ink-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-brand-800 to-brand-900 px-6 py-6 text-white">
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close dialog"
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/90 hover:bg-black/40 hover:text-white transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center gap-4">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-3 border-gold-400 bg-white shrink-0 shadow-md">
                  <Avatar
                    name={selected.name}
                    src={selected.photoUrl}
                    rounded="xl"
                    className="h-full w-full object-cover text-3xl font-bold"
                  />
                </div>
                <div className="min-w-0 pr-8">
                  <span className="inline-block rounded-md bg-gold-400/20 px-2 py-0.5 text-xs font-bold text-gold-300 uppercase tracking-wider mb-1">
                    {selected.department ?? "Faculty"}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight text-white truncate">
                    {selected.name}
                  </h3>
                  <p className="text-sm font-semibold text-white/90 mt-0.5">
                    {selected.designation}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-6 space-y-5 text-sm text-ink-800">
              {/* Academic Qualification */}
              <div className="rounded-xl border border-ink-200/80 bg-ink-50/70 p-4">
                <div className="flex items-center gap-2 font-bold text-ink-950 text-xs uppercase tracking-wider text-brand-700">
                  <span className="text-base">🎓</span>
                  <span>Academic Qualifications</span>
                </div>
                <p className="mt-1.5 text-ink-900 font-semibold text-base">
                  {selected.qualification || "M.Sc. / Postgraduate Degree"}
                </p>
              </div>

              {/* Teaching Experience */}
              <div className="rounded-xl border border-ink-200/80 bg-ink-50/70 p-4">
                <div className="flex items-center gap-2 font-bold text-ink-950 text-xs uppercase tracking-wider text-brand-700">
                  <span className="text-base">⏱️</span>
                  <span>Experience &amp; Tenure</span>
                </div>
                <p className="mt-1.5 font-sans font-semibold tabular-nums text-ink-900">
                  {selected.experienceYears
                    ? `${selected.experienceYears} Years of Dedicated Pre-University Teaching`
                    : "Experienced Academic Faculty Member"}
                </p>
                <p className="mt-1 text-xs text-ink-600 leading-relaxed">
                  Specialized in syllabus coverage, competitive examinations (KCET / NEET / JEE Foundation), and laboratory practical coaching.
                </p>
              </div>

              {/* Biography & Achievements */}
              <div className="rounded-xl border border-ink-200/80 bg-ink-50/70 p-4">
                <div className="flex items-center gap-2 font-bold text-ink-950 text-xs uppercase tracking-wider text-brand-700">
                  <span className="text-base">🏆</span>
                  <span>Key Achievements &amp; Student Guidance</span>
                </div>
                <p className="mt-1.5 text-ink-700 leading-relaxed text-[0.88rem]">
                  {selected.bio ||
                    `${selected.name} has consistently guided students toward academic distinction in Karnataka State Pre-University Board Examinations, mentoring top rank holders and fostering subject mastery through practical demonstrations and doubt-clearing sessions.`}
                </p>
              </div>

              {/* Official Email / Communication */}
              {selected.email && (
                <div className="flex items-center justify-between rounded-xl border border-brand-200/70 bg-brand-50/50 p-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✉️</span>
                    <div>
                      <p className="font-bold text-brand-950">Official Email Contact</p>
                      <a
                        href={`mailto:${selected.email}`}
                        className="font-mono text-brand-700 underline underline-offset-2 hover:text-brand-900"
                      >
                        {selected.email}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-ink-200 bg-white px-6 py-4 flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

