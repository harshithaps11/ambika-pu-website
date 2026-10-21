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
    <section className="bg-ink-50 py-14">
      <div className="container-site grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
        <div className="mx-auto w-full max-w-[260px] lg:mx-0">
          <Avatar
            name={name}
            src={photoUrl}
            rounded="sm"
            className="h-[300px] w-full border-4 border-white text-5xl shadow-card"
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
    </section>
  );
}
