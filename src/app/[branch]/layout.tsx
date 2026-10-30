import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/site/chat-widget";
import { MainNav, type NavItem } from "@/components/site/main-nav";
import { Masthead } from "@/components/site/masthead";
import { NewsTicker } from "@/components/site/news-ticker";
import { SiteFooter } from "@/components/site/site-footer";
import { TopUtilityBar } from "@/components/site/top-utility-bar";
import { site } from "@/config/site";
import { branchHref } from "@/lib/branch-routing";
import { getBranchBySlug, getBranchIndex } from "@/lib/data/branches";
import { getTickerItems } from "@/lib/data/news";
import { darken } from "@/lib/utils";

type Params = { params: Promise<{ branch: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { branch: slug } = await params;
  const branch = await getBranchBySlug(slug);

  if (!branch) return {};

  const location = [branch.city, branch.district].filter(Boolean).join(", ");

  return {
    title: {
      default: branch.name,
      template: `%s | ${branch.shortName}`,
    },
    description:
      branch.about?.slice(0, 180) ??
      `${branch.name}, ${location}. ${site.affiliation}.`,
    alternates: { canonical: branchHref(branch.slug) },
  };
}

export default async function BranchLayout({
  children,
  params,
}: Params & { children: React.ReactNode }) {
  const { branch: slug } = await params;
  const [branch, allBranches] = await Promise.all([
    getBranchBySlug(slug),
    getBranchIndex(),
  ]);

  if (!branch) notFound();

  const ticker = await getTickerItems(branch.id);
  const base = `/${branch.slug}`;

  const navItems: NavItem[] = [
    { label: "Home", href: base },
    { label: "About", href: `${base}/about` },
    { label: "Courses", href: `${base}/courses` },
    { label: "Faculty", href: `${base}/faculty` },
    { label: "Results", href: `${base}/results` },
    { label: "Gallery", href: `${base}/gallery` },
    { label: "News", href: `${base}/news` },
    { label: "Contact", href: `${base}/contact` },
  ];

  const siblings = allBranches.filter((item) => item.slug !== branch.slug);

  const address = [
    branch.addressLine1,
    branch.addressLine2,
    branch.city,
    branch.district,
    branch.state,
    branch.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      style={
        {
          "--branch-color": branch.themeColor,
          "--branch-color-dark": darken(branch.themeColor, 0.35),
        } as React.CSSProperties
      }
      className="flex min-h-full flex-col"
    >
      <TopUtilityBar
        phone={branch.phone}
        email={branch.email}
        links={[
          { label: "Main Website", href: "/" },
          ...siblings.map((item) => ({
            label: item.shortName,
            href: branchHref(item.slug),
          })),
          { label: "Staff Login", href: "/admin/login" },
        ]}
      />

      <Masthead
        homeHref={base}
        title={site.name}
        subtitle={branch.shortName}
        affiliation={branch.affiliation ?? site.affiliation}
        applyHref={`${base}/admissions`}
        admissionOpen={branch.admissionOpen}
      />

      <MainNav items={navItems} />

      <NewsTicker items={ticker} basePath={base} />

      <main id="main">{children}</main>

      <SiteFooter
        branches={allBranches}
        quickLinks={[
          { label: "About this campus", href: `${base}/about` },
          { label: "Courses offered", href: `${base}/courses` },
          { label: "Apply online", href: `${base}/admissions` },
          { label: "News & notices", href: `${base}/news` },
        ]}
        contact={{ phone: branch.phone, email: branch.email }}
        addressLines={address}
      />

      <ChatWidget
        branchSlug={branch.slug}
        starters={[
          "How do I apply?",
          "What documents are needed?",
          "What are the fees?",
          "Is there bus facility?",
        ]}
      />
    </div>
  );
}
