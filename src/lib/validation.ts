import { z } from "zod";

/** Indian mobile numbers: ten digits beginning 6-9. */
const phone = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

const optionalPhone = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
  .optional()
  .or(z.literal(""));

const optionalText = (max = 200) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const MIN_APPLICANT_AGE = 13;
const MAX_APPLICANT_AGE = 35;

export const admissionSchema = z.object({
  branchSlug: z.string().trim().min(1),
  courseId: z.string().trim().optional().or(z.literal("")),

  studentName: z
    .string()
    .trim()
    .min(2, "Please enter the student's full name")
    .max(120),

  dateOfBirth: z
    .string()
    .trim()
    .min(1, "Date of birth is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .refine((value) => {
      const dob = new Date(value);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const monthDelta = now.getMonth() - dob.getMonth();
      if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) {
        age -= 1;
      }
      return age >= MIN_APPLICANT_AGE && age <= MAX_APPLICANT_AGE;
    }, `Age must be between ${MIN_APPLICANT_AGE} and ${MAX_APPLICANT_AGE} years`),

  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Please select the gender",
  }),

  email: z.email("Enter a valid email address").max(160),
  phone,
  altPhone: optionalPhone,

  fatherName: optionalText(120),
  motherName: optionalText(120),
  guardianPhone: optionalPhone,
  guardianOccupation: optionalText(120),

  addressLine1: z.string().trim().min(3, "Address is required").max(200),
  addressLine2: optionalText(200),
  city: z.string().trim().min(2, "City or town is required").max(100),
  district: optionalText(100),
  state: optionalText(100),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit PIN code")
    .optional()
    .or(z.literal("")),

  category: optionalText(60),
  religion: optionalText(60),

  sslcBoard: optionalText(120),
  sslcSchool: optionalText(160),
  sslcRegisterNo: optionalText(60),
  sslcYear: z
    .string()
    .trim()
    .regex(/^(19|20)\d{2}$/, "Enter a valid year")
    .optional()
    .or(z.literal("")),
  sslcPercentage: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (!Number.isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100),
      "Enter a percentage between 0 and 100",
    )
    .optional()
    .or(z.literal("")),

  preferredCombination: z
    .string()
    .trim()
    .min(1, "Please choose a combination")
    .max(80),

  remarksFromApplicant: optionalText(1000),

  consent: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .refine((value) => value === true || value === "on" || value === "true", {
      message: "Please confirm that the details are correct",
    }),

  /** Hidden field; real visitors never fill it. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type AdmissionInput = z.infer<typeof admissionSchema>;

export const contactSchema = z.object({
  branchSlug: optionalText(80),
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Enter a valid email address").max(160).optional().or(z.literal("")),
  phone,
  subject: optionalText(160),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least a sentence")
    .max(2000),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(10, "Use at least 10 characters")
      .max(200)
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/\d/, "Include a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "The two passwords do not match",
    path: ["confirmPassword"],
  });

export const newsSchema = z.object({
  branchId: z.string().trim().optional().or(z.literal("")),
  title: z.string().trim().min(5, "Give the notice a clear title").max(220),
  category: z.enum(["NEWS", "NOTICE", "EVENT", "CIRCULAR", "RESULT", "ACHIEVEMENT"], {
    message: "Choose a category",
  }),
  summary: optionalText(400),
  body: z.string().trim().max(20000).optional().or(z.literal("")),
  linkUrl: z.url("Enter a valid URL").optional().or(z.literal("")),
  attachmentUrl: z.url("Enter a valid URL").optional().or(z.literal("")),
  publishedAt: z.string().trim().optional().or(z.literal("")),
  expiresAt: z.string().trim().optional().or(z.literal("")),
  isTicker: z.coerce.boolean().optional(),
  isPinned: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional(),
});

/** Turns a Zod error into the `{ field: message }` shape the forms render. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    // Only the first message per field is shown, directly under the input.
    if (typeof key === "string" && !(key in result)) {
      result[key] = issue.message;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Admin content schemas
// ---------------------------------------------------------------------------

const optionalUrl = z.string().trim().max(500).optional().or(z.literal(""));
const optionalInt = (max: number) =>
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (/^\d+$/.test(value) && Number(value) >= 0 && Number(value) <= max),
      `Enter a whole number up to ${max}`,
    )
    .optional()
    .or(z.literal(""));

export const facultySchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  branchId: z.string().trim().min(1, "Choose a campus"),
  name: z.string().trim().min(2, "Enter the name").max(120),
  designation: z.string().trim().min(2, "Enter the designation").max(120),
  department: optionalText(100),
  qualification: optionalText(160),
  experienceYears: optionalInt(70),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  photoUrl: optionalUrl,
  bio: optionalText(2000),
  orderIndex: optionalInt(999),
  isActive: z.coerce.boolean().optional(),
});

export const topperSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  branchId: z.string().trim().min(1, "Choose a campus"),
  studentName: z.string().trim().min(2, "Enter the student's name").max(120),
  academicYear: z.string().trim().min(4, "e.g. 2025–26").max(20),
  stream: z.enum(["SCIENCE", "COMMERCE", "ARTS"], { message: "Choose a stream" }),
  percentage: z
    .string()
    .trim()
    .refine(
      (value) => !Number.isNaN(Number(value)) && Number(value) > 0 && Number(value) <= 100,
      "Enter a percentage between 0 and 100",
    ),
  marksObtained: optionalInt(1000),
  totalMarks: optionalInt(1000),
  rankLabel: optionalText(80),
  photoUrl: optionalUrl,
  orderIndex: optionalInt(999),
});

export const courseSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  branchId: z.string().trim().min(1, "Choose a campus"),
  code: z
    .string()
    .trim()
    .min(2, "Enter a short code, e.g. PCMB")
    .max(20)
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(3, "Enter the full combination name").max(200),
  stream: z.enum(["SCIENCE", "COMMERCE", "ARTS"], { message: "Choose a stream" }),
  subjects: z.string().trim().max(500).optional().or(z.literal("")),
  description: optionalText(1000),
  eligibility: optionalText(500),
  durationYears: optionalInt(10),
  intake: optionalInt(2000),
  annualFee: optionalInt(1000000),
  orderIndex: optionalInt(999),
  isActive: z.coerce.boolean().optional(),
});

export const faqSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  branchId: z.string().trim().optional().or(z.literal("")),
  question: z.string().trim().min(5, "Enter the question").max(300),
  answer: z.string().trim().min(10, "Write the answer the assistant should give").max(2000),
  keywords: z.string().trim().max(500).optional().or(z.literal("")),
  category: optionalText(60),
  orderIndex: optionalInt(999),
  isActive: z.coerce.boolean().optional(),
});

export const pageContentSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  branchId: z.string().trim().optional().or(z.literal("")),
  key: z
    .string()
    .trim()
    .min(2, "Enter a page key")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  title: optionalText(200),
  body: z.string().trim().min(1, "Write some content").max(20000),
});

export const albumSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  branchId: z.string().trim().optional().or(z.literal("")),
  title: z.string().trim().min(3, "Enter an album title").max(160),
  description: optionalText(600),
  coverImageUrl: optionalUrl,
  eventDate: z.string().trim().optional().or(z.literal("")),
  orderIndex: optionalInt(999),
  isPublished: z.coerce.boolean().optional(),
});

export const albumImageSchema = z.object({
  albumId: z.string().trim().min(1),
  url: z.string().trim().min(1, "Enter the image address").max(500),
  caption: optionalText(200),
  orderIndex: optionalInt(999),
});

export const branchSettingsSchema = z.object({
  id: z.string().trim().min(1),
  shortName: z.string().trim().min(2, "Enter a short name").max(80),
  tagline: optionalText(120),
  about: optionalText(4000),
  addressLine1: optionalText(200),
  addressLine2: optionalText(200),
  city: optionalText(100),
  district: optionalText(100),
  state: optionalText(100),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit PIN code")
    .optional()
    .or(z.literal("")),
  phone: optionalText(20),
  altPhone: optionalText(20),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  whatsappNo: optionalText(20),
  mapEmbedUrl: optionalUrl,
  principalName: optionalText(120),
  principalMessage: optionalText(4000),
  principalPhotoUrl: optionalUrl,
  admissionNote: optionalText(600),
  themeColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Enter a colour like #7A1F2B"),
  admissionOpen: z.coerce.boolean().optional(),
});
