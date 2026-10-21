import { notFound } from "next/navigation";
import { getBranchBySlug } from "./branches";

/** Loads a branch for a route segment, or renders the 404 page. */
export async function requireBranch(slug: string) {
  const branch = await getBranchBySlug(slug);
  if (!branch) notFound();
  return branch;
}

export type BranchRecord = NonNullable<Awaited<ReturnType<typeof getBranchBySlug>>>;
