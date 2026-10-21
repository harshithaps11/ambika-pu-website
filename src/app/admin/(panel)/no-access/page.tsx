import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { capabilityLabel } from "@/lib/permissions";
import type { Capability } from "@/generated/prisma/enums";

export const metadata = { title: "No access" };

export default async function NoAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ needed?: string }>;
}) {
  const { needed } = await searchParams;
  const user = await getCurrentUser();

  const label =
    needed && needed !== "OWNER"
      ? capabilityLabel(needed as Capability)
      : needed === "OWNER"
        ? "Owner access"
        : null;

  return (
    <div className="mx-auto max-w-xl border border-ink-200 bg-white p-8 text-center shadow-card">
      <h1 className="font-serif text-xl font-semibold text-ink-900">
        You do not have access to this section
      </h1>

      <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-600">
        {label ? (
          <>
            This page needs the <strong className="text-ink-900">{label}</strong>{" "}
            permission, which has not been granted to{" "}
            {user ? user.name : "your account"}.
          </>
        ) : (
          "This page is not available to your account."
        )}
      </p>

      <p className="mt-3 text-[0.86rem] text-ink-500">
        Permissions are managed by the site owner. Ask them to enable it for you if
        you need it for your work.
      </p>

      <Link
        href="/admin"
        className="mt-6 inline-flex h-10 items-center rounded-sm bg-brand-700 px-5 text-[0.82rem] font-semibold text-white"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
