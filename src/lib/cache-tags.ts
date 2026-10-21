/**
 * Cache tags shared by the read layer and the admin mutations, so that saving
 * a notice in the admin panel refreshes exactly the public pages that show it.
 */
export const tags = {
  branches: "branches",
  branch: (slug: string) => `branch:${slug}`,
  news: "news",
  branchNews: (branchId: string) => `news:${branchId}`,
  ticker: "ticker",
  courses: (branchId: string) => `courses:${branchId}`,
  faculty: (branchId: string) => `faculty:${branchId}`,
  toppers: (branchId: string) => `toppers:${branchId}`,
  gallery: "gallery",
  pages: "pages",
  faqs: "faqs",
} as const;
