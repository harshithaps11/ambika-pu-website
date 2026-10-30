import { ChatWidget } from "@/components/site/chat-widget";
import { MainNav, type NavItem } from "@/components/site/main-nav";
import { Masthead } from "@/components/site/masthead";
import { NewsTicker } from "@/components/site/news-ticker";
import { SiteFooter } from "@/components/site/site-footer";
import { OrganizationSchema } from "@/components/site/structured-data";
import { TopUtilityBar } from "@/components/site/top-utility-bar";
import { site } from "@/config/site";
import { branchHref } from "@/lib/branch-routing";
import { getBranchIndex, getBranchSchema } from "@/lib/data/branches";
import { getTickerItems } from "@/lib/data/news";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [branches, ticker] = await Promise.all([
    getBranchIndex(),
    getTickerItems(null),
  ]);

  const campusChildren = branches.map((branch) => ({
    label: branch.shortName,
    href: branchHref(branch.slug),
  }));

  const navItems: NavItem[] = [
    { label: "Home", href: "/" },
    {
      label: "About",
      href: "/about",
      children: [
        { label: "About the Institution", href: "/about" },
        { label: "Vision & Mission", href: "/about#vision" },
        { label: "Management", href: "/about#management" },
      ],
    },
    {
      label: "Our Campuses",
      href: "/#campuses",
      children: campusChildren,
    },
    {
      label: "Admissions",
      href: "/#admissions",
      children: branches.map((branch) => ({
        label: `Apply — ${branch.shortName}`,
        href: branchHref(branch.slug, "/admissions"),
      })),
    },
    { label: "News & Notices", href: "/news" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ];

  const quickLinks = [
    { label: "About the Institution", href: "/about" },
    { label: "News & Notices", href: "/news" },
    { label: "Photo Gallery", href: "/gallery" },
    { label: "Contact Us", href: "/contact" },
  ];

  const branchSchema = await getBranchSchema();

  return (
    <>
      <OrganizationSchema branches={branchSchema} />
      <TopUtilityBar />
      <Masthead
        homeHref="/"
        title={site.name}
        affiliation={`${site.affiliation} · Managed by ${site.trust}`}
        applyHref="/#campuses"
      />
      <MainNav items={navItems} />
      <NewsTicker items={ticker} />

      <main id="main">{children}</main>

      <SiteFooter branches={branches} quickLinks={quickLinks} />

      <ChatWidget
        starters={[
          "How do I apply?",
          "What are the fees?",
          "What combinations are offered?",
          "Office timings",
        ]}
      />
    </>
  );
}
