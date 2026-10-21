import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Crest } from "@/components/brand/crest";
import { getCurrentUser } from "@/lib/auth";
import { site } from "@/config/site";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Staff Sign In",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();

  if (user) redirect("/admin");

  return (
    <div className="flex min-h-dvh flex-col bg-ink-100">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center">
            <Crest className="h-16 text-brand-700" />
            <h1 className="mt-4 font-serif text-xl font-semibold text-ink-900">
              {site.name}
            </h1>
            <p className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-brand-700">
              Administration
            </p>
          </div>

          <div className="mt-7 border border-ink-200 bg-white p-6 shadow-card">
            <LoginForm next={next} />
          </div>

          <p className="mt-5 text-center text-[0.78rem] text-ink-500">
            For college staff only. If you cannot sign in, contact the site
            administrator.
          </p>

          <p className="mt-3 text-center text-[0.78rem]">
            <Link
              href="/"
              className="font-semibold text-brand-700 underline underline-offset-4"
            >
              ← Back to the website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
