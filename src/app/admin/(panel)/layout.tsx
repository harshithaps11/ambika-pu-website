import type { Metadata } from "next";
import Link from "next/link";
import { AdminSidebar, type AdminNavSection } from "@/components/admin/shell";
import { logout } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { Capability, Role } from "@/generated/prisma/enums";
import {
  branchScopeFilter,
  branchScopeFilterWithGlobal,
  can,
  requireUser,
} from "@/lib/permissions";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Ambika PU Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const scope = branchScopeFilter(user);

  // Counts shown as badges; each is a single indexed count query.
  const [pendingApplications, unreadMessages] = await Promise.all([
    can(user, Capability.APPLICATION_VIEW)
      ? prisma.application.count({ where: { ...scope, status: "SUBMITTED" } })
      : Promise.resolve(0),
    can(user, Capability.CONTACT_VIEW)
      ? prisma.contactMessage.count({
          where: { ...branchScopeFilterWithGlobal(user), isRead: false },
        })
      : Promise.resolve(0),
  ]);

  const sections: AdminNavSection[] = [];

  sections.push({
    heading: "Overview",
    items: [{ label: "Dashboard", href: "/admin" }],
  });

  const collegeItems = [];
  if (can(user, Capability.APPLICATION_VIEW)) {
    collegeItems.push({
      label: "Admissions",
      href: "/admin/applications",
      badge: pendingApplications || undefined,
    });
  }
  if (can(user, Capability.CONTACT_VIEW)) {
    collegeItems.push({
      label: "Enquiries",
      href: "/admin/enquiries",
      badge: unreadMessages || undefined,
    });
  }
  if (can(user, Capability.COURSE_MANAGE)) {
    collegeItems.push({ label: "Courses", href: "/admin/courses" });
  }
  if (can(user, Capability.FACULTY_MANAGE)) {
    collegeItems.push({ label: "Faculty", href: "/admin/faculty" });
  }
  if (can(user, Capability.TOPPER_MANAGE)) {
    collegeItems.push({ label: "Toppers", href: "/admin/toppers" });
  }
  if (collegeItems.length) {
    sections.push({ heading: "College", items: collegeItems });
  }

  const websiteItems = [];
  if (can(user, Capability.NEWS_VIEW) || can(user, Capability.NEWS_MANAGE)) {
    websiteItems.push({ label: "News & Notices", href: "/admin/news" });
  }
  if (can(user, Capability.GALLERY_MANAGE)) {
    websiteItems.push({ label: "Gallery", href: "/admin/gallery" });
  }
  if (can(user, Capability.PAGE_MANAGE)) {
    websiteItems.push({ label: "Page Content", href: "/admin/pages" });
  }
  if (can(user, Capability.FAQ_MANAGE)) {
    websiteItems.push({ label: "Chatbot Answers", href: "/admin/faqs" });
  }
  if (websiteItems.length) {
    sections.push({ heading: "Website", items: websiteItems });
  }

  const adminItems = [];
  if (can(user, Capability.SETTINGS_MANAGE)) {
    adminItems.push({ label: "Campus Settings", href: "/admin/branches" });
  }
  if (user.role === Role.OWNER) {
    adminItems.push({ label: "Staff Accounts", href: "/admin/users" });
  }
  if (can(user, Capability.AUDIT_VIEW)) {
    adminItems.push({ label: "Activity Log", href: "/admin/activity" });
  }
  adminItems.push({ label: "My Account", href: "/admin/account" });
  sections.push({ heading: "Administration", items: adminItems });

  return (
    <div className="flex min-h-dvh flex-col bg-ink-100 lg:flex-row">
      <AdminSidebar
        sections={sections}
        userName={user.name}
        userRole={user.role === Role.OWNER ? "Owner" : "College staff"}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b border-ink-200 bg-white px-4 lg:px-7">
          <Link
            href="/"
            target="_blank"
            className="text-[0.78rem] font-semibold text-ink-600 underline underline-offset-4 transition-colors hover:text-brand-700"
          >
            View website ↗
          </Link>

          <div className="flex items-center gap-4">
            {user.mustChangePassword ? (
              <Link
                href="/admin/account"
                className="rounded-sm bg-gold-100 px-2.5 py-1 text-[0.72rem] font-semibold text-gold-700"
              >
                Change your password
              </Link>
            ) : null}

            <form action={logout}>
              <button
                type="submit"
                className="text-[0.78rem] font-semibold text-ink-600 transition-colors hover:text-brand-700"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-7 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
