import { redirect } from "next/navigation";
import { Capability, Role } from "@/generated/prisma/enums";
import { getCurrentUser, type SessionUser } from "./auth";
import { forbidden, unauthorized } from "./errors";

export type CapabilityMeta = {
  capability: Capability;
  label: string;
  description: string;
};

export type CapabilityGroup = {
  id: string;
  label: string;
  /** Shown on the owner's permission screen above the toggles. */
  hint: string;
  capabilities: CapabilityMeta[];
};

/**
 * The permission catalogue the owner sees. Every ability a college account can
 * hold appears here exactly once; adding a capability to the Prisma enum and
 * to this list is all it takes to expose a new toggle.
 */
export const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    id: "news",
    label: "News, notices & events",
    hint: "Controls the notice board and the scrolling headline ticker.",
    capabilities: [
      {
        capability: Capability.NEWS_VIEW,
        label: "View news & notices",
        description: "See every published and draft item, including expired ones.",
      },
      {
        capability: Capability.NEWS_MANAGE,
        label: "Create, edit & delete news",
        description:
          "Publish notices, set expiry dates and choose which headlines scroll in the ticker.",
      },
    ],
  },
  {
    id: "admissions",
    label: "Admissions",
    hint: "Applications submitted through the online admission forms.",
    capabilities: [
      {
        capability: Capability.APPLICATION_VIEW,
        label: "View applications",
        description: "Open the applications list and read individual submissions.",
      },
      {
        capability: Capability.APPLICATION_MANAGE,
        label: "Update application status",
        description:
          "Move applicants through shortlisted, admitted or rejected, and add office notes.",
      },
      {
        capability: Capability.APPLICATION_EXPORT,
        label: "Export applications",
        description:
          "Download the filtered list as a CSV file for the office. Grant with care — exports contain personal data.",
      },
    ],
  },
  {
    id: "academics",
    label: "Academics & people",
    hint: "Courses, teaching staff and published results.",
    capabilities: [
      {
        capability: Capability.COURSE_MANAGE,
        label: "Manage courses",
        description: "Add or edit combinations, intake, eligibility and fees.",
      },
      {
        capability: Capability.FACULTY_MANAGE,
        label: "Manage faculty",
        description: "Add, edit, reorder and remove staff profiles.",
      },
      {
        capability: Capability.TOPPER_MANAGE,
        label: "Manage toppers & results",
        description: "Publish exam toppers with marks, percentages and photos.",
      },
    ],
  },
  {
    id: "media",
    label: "Media & pages",
    hint: "Photographs and the editable text on public pages.",
    capabilities: [
      {
        capability: Capability.GALLERY_MANAGE,
        label: "Manage gallery",
        description: "Create albums and upload, caption or remove photographs.",
      },
      {
        capability: Capability.PAGE_MANAGE,
        label: "Edit page content",
        description:
          "Change the wording on About, Facilities, Fees and similar pages without a developer.",
      },
      {
        capability: Capability.FAQ_MANAGE,
        label: "Manage chatbot answers",
        description: "Edit the questions and answers the website assistant replies with.",
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    hint: "Enquiries, site settings and the activity trail.",
    capabilities: [
      {
        capability: Capability.CONTACT_VIEW,
        label: "View contact enquiries",
        description: "Read messages sent through the contact form.",
      },
      {
        capability: Capability.SETTINGS_MANAGE,
        label: "Manage branch settings",
        description:
          "Edit addresses, phone numbers, principal's message and admission status.",
      },
      {
        capability: Capability.AUDIT_VIEW,
        label: "View activity log",
        description: "See who changed what and when.",
      },
    ],
  },
];

export const ALL_CAPABILITIES: Capability[] = CAPABILITY_GROUPS.flatMap((group) =>
  group.capabilities.map((item) => item.capability),
);

const CAPABILITY_LABEL = new Map<Capability, string>(
  CAPABILITY_GROUPS.flatMap((group) =>
    group.capabilities.map((item) => [item.capability, item.label] as const),
  ),
);

export function capabilityLabel(capability: Capability) {
  return CAPABILITY_LABEL.get(capability) ?? capability;
}

export function isOwner(user: SessionUser | null): boolean {
  return user?.role === Role.OWNER;
}

/**
 * The single source of truth for "may this account do this?".
 *
 * Owners bypass the capability table entirely; everyone else needs an explicit
 * grant, so a brand-new staff account starts with no powers at all.
 */
export function can(user: SessionUser | null, capability: Capability): boolean {
  if (!user) return false;
  if (user.role === Role.OWNER) return true;
  return user.capabilities.includes(capability);
}

export function canAny(user: SessionUser | null, ...capabilities: Capability[]) {
  return capabilities.some((capability) => can(user, capability));
}

/**
 * Branch ids this account may act on, or `null` meaning "every branch".
 */
export function allowedBranchIds(user: SessionUser | null): string[] | null {
  if (!user) return [];
  if (user.role === Role.OWNER || user.allBranches) return null;
  return user.branchIds;
}

/** `branchId` of null means an institution-wide record. */
export function canAccessBranch(user: SessionUser | null, branchId: string | null) {
  if (!user) return false;
  const allowed = allowedBranchIds(user);
  if (allowed === null) return true;
  // Institution-wide records belong to whoever can see every branch.
  if (branchId === null) return false;
  return allowed.includes(branchId);
}

/**
 * A Prisma `where` fragment restricting a query to the branches this account
 * may see. Returns `{}` when the account is unrestricted.
 *
 * Use this for models whose `branchId` is required (Application, Course,
 * Faculty, Topper).
 */
export function branchScopeFilter(
  user: SessionUser | null,
): { branchId?: { in: string[] } } {
  const allowed = allowedBranchIds(user);
  if (allowed === null) return {};
  return { branchId: { in: allowed } };
}

/**
 * The same restriction for models where `branchId` may be null, meaning an
 * institution-wide record (NewsItem, GalleryAlbum, PageContent, FaqEntry,
 * ContactMessage). Institution-wide rows stay visible to scoped staff so the
 * office can still read notices that apply to every campus.
 */
export function branchScopeFilterWithGlobal(
  user: SessionUser | null,
): { OR?: ({ branchId: { in: string[] } } | { branchId: null })[] } {
  const allowed = allowedBranchIds(user);
  if (allowed === null) return {};
  return { OR: [{ branchId: { in: allowed } }, { branchId: null }] };
}

// ---------------------------------------------------------------------------
// Guards for server components and route handlers
// ---------------------------------------------------------------------------

/** For pages: sends anonymous visitors to the login screen. */
export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    const target = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    redirect(`/admin/login${target}`);
  }

  return user;
}

/** For pages: requires a specific ability, otherwise shows the no-access page. */
export async function requireCapability(capability: Capability): Promise<SessionUser> {
  const user = await requireUser();

  if (!can(user, capability)) {
    redirect(`/admin/no-access?needed=${capability}`);
  }

  return user;
}

export async function requireOwner(): Promise<SessionUser> {
  const user = await requireUser();

  if (user.role !== Role.OWNER) {
    redirect("/admin/no-access?needed=OWNER");
  }

  return user;
}

/** For route handlers: throws instead of redirecting. */
export async function apiUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  return user;
}

export async function apiCapability(capability: Capability): Promise<SessionUser> {
  const user = await apiUser();

  if (!can(user, capability)) {
    throw forbidden(
      `This account does not have the "${capabilityLabel(capability)}" permission.`,
    );
  }

  return user;
}
