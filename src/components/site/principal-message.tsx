import { Avatar } from "@/components/site/avatar";
import { SectionHeading } from "@/components/ui/section-heading";

export function PrincipalMessage({
  name,
  message,
  photoUrl,
  designation = "Principal",
}: {
  name: string;
  message: string;
  photoUrl?: string | null;
  designation?: string;
}) {
  return (
    <section className="bg-ink-50 py-16">
      <div className="container-site">
        <div className="rounded-2xl border border-ink-200/90 bg-white p-6 sm:p-10 shadow-card">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12 items-center">
            <div className="mx-auto w-full max-w-[260px] lg:mx-0">
              <Avatar
                name={name}
                src={photoUrl}
                rounded="xl"
                className="h-[300px] w-full rounded-2xl border-4 border-white text-5xl shadow-card"
              />
              <p className="mt-3 text-center font-serif text-base font-semibold text-ink-900">
                {name}
              </p>
              <p className="text-center text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-brand-700">
                {designation}
              </p>
            </div>

            <div>
              <SectionHeading eyebrow="From the desk of the Principal" title="A message to our students and parents" />

              <blockquote className="prose-content relative mt-5 border-l-2 border-gold-500 pl-5 text-[0.95rem]">
                {message
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
