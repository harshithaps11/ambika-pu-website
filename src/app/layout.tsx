import type { Metadata } from "next";
import { site, siteUrl } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} — ${site.englishName}`,
    template: `%s | ${site.shortName}`,
  },
  description: `${site.englishName}, ${site.address.city}. ${site.affiliation}. Science and Commerce pre-university education managed by ${site.trust}.`,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: site.name,
    title: `${site.name} — ${site.englishName}`,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-IN"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col bg-white">{children}</body>
    </html>
  );
}
