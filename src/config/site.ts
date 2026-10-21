/**
 * Institution-level facts that are the same across every branch.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  CONFIRM WITH THE COLLEGE BEFORE GOING LIVE
 *  Values marked PLACEHOLDER were not verifiable from a primary source.
 *  Everything else was taken from public directory listings and should still
 *  be checked against the college's letterhead.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const site = {
  /** Kannada-origin name the college uses on its signage. */
  name: "Ambika Padavi Poorva College",
  /** English equivalent, used in page titles and structured data. */
  englishName: "Ambika Pre-University College",
  shortName: "Ambika PU College",

  /** PLACEHOLDER — confirm the exact registered trust name. */
  trust: "Nattoja Foundation Trust",

  affiliation:
    "Affiliated to the Department of Pre-University Education, Government of Karnataka",

  /** PLACEHOLDER — confirm the year the PU college was established. */
  establishedYear: 2014,

  tagline: "Learning rooted in values, education aimed at excellence",

  /** Head-office contact. Branch-specific contacts live on the Branch record. */
  contact: {
    // PLACEHOLDER — the old website's numbers could not be read from here.
    phone: "08251 230000",
    altPhone: "",
    email: "info@ambikapucollege.edu.in",
    admissionsEmail: "admissions@ambikapucollege.edu.in",
    whatsapp: "",
  },

  address: {
    line1: "Ramakrishna Ashram Road",
    line2: "Nellikatte",
    city: "Puttur",
    district: "Dakshina Kannada",
    state: "Karnataka",
    pincode: "574201",
  },

  social: {
    facebook: "",
    instagram: "",
    youtube: "",
  },

  /** Shown in the footer. */
  developerCredit: {
    name: "Harshitha P S",
    url: "",
  },
} as const;

export function fullAddress() {
  const { line1, line2, city, district, state, pincode } = site.address;
  return [line1, line2, city, district, state, pincode].filter(Boolean).join(", ");
}

/** Canonical origin, used for absolute URLs in metadata and sitemaps. */
export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}
