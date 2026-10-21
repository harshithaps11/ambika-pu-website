"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { Capability, Stream } from "@/generated/prisma/enums";
import { recordAudit } from "@/lib/audit";
import { tags } from "@/lib/cache-tags";
import { apiCapability, canAccessBranch } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils";
import {
  albumImageSchema,
  albumSchema,
  branchSettingsSchema,
  courseSchema,
  facultySchema,
  faqSchema,
  fieldErrors,
  pageContentSchema,
  topperSchema,
} from "@/lib/validation";

export type ResourceState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  attempt?: number;
};

function echo(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

/** Drops a cached entry immediately rather than marking it stale. */
function bust(...keys: string[]) {
  for (const key of keys) revalidateTag(key, { expire: 0 });
  revalidatePath("/", "layout");
}

function num(value: string | undefined) {
  return value && value !== "" ? Number(value) : null;
}

function list(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * Shared wrapper: checks the permission, validates, and echoes the submitted
 * values back so a validation error never empties the form.
 */
async function handle<S extends z.ZodType>(
  capability: Capability,
  schema: S,
  previous: ResourceState,
  formData: FormData,
  run: (
    data: z.infer<S>,
    user: Awaited<ReturnType<typeof apiCapability>>,
  ) => Promise<ResourceState>,
): Promise<ResourceState> {
  const attempt = (previous.attempt ?? 0) + 1;
  const values = echo(formData);

  let user;
  try {
    user = await apiCapability(capability);
  } catch {
    return { ok: false, message: "You do not have permission for this.", values, attempt };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      errors: fieldErrors(parsed.error),
      values,
      attempt,
    };
  }

  const result = await run(parsed.data, user);
  return { ...result, values: result.ok ? undefined : values, attempt };
}

// ---------------------------------------------------------------- faculty

export async function saveFaculty(previous: ResourceState, formData: FormData) {
  return handle(
    Capability.FACULTY_MANAGE,
    facultySchema,
    previous,
    formData,
    async (data, user) => {
      if (!canAccessBranch(user, data.branchId)) {
        return { ok: false, message: "You cannot edit that campus." };
      }

      const payload = {
        branchId: data.branchId,
        name: data.name,
        designation: data.designation,
        department: data.department || null,
        qualification: data.qualification || null,
        experienceYears: num(data.experienceYears),
        email: data.email || null,
        photoUrl: data.photoUrl || null,
        bio: data.bio || null,
        orderIndex: num(data.orderIndex) ?? 0,
        isActive: Boolean(data.isActive),
      };

      if (data.id) {
        await prisma.faculty.update({ where: { id: data.id }, data: payload });
      } else {
        await prisma.faculty.create({ data: payload });
      }

      await recordAudit({
        userId: user.id,
        action: data.id ? "faculty.updated" : "faculty.created",
        entity: "Faculty",
        entityId: data.id || null,
        summary: data.name,
      });

      bust(tags.faculty(data.branchId));
      revalidatePath("/admin/faculty");
      return { ok: true, message: `Saved ${data.name}.` };
    },
  );
}

export async function deleteFaculty(formData: FormData) {
  const user = await apiCapability(Capability.FACULTY_MANAGE);
  const id = String(formData.get("id") ?? "");

  const record = await prisma.faculty.findUnique({
    where: { id },
    select: { id: true, branchId: true, name: true },
  });

  if (record && canAccessBranch(user, record.branchId)) {
    await prisma.faculty.delete({ where: { id } });
    await recordAudit({
      userId: user.id,
      action: "faculty.deleted",
      entity: "Faculty",
      entityId: id,
      summary: record.name,
    });
    bust(tags.faculty(record.branchId));
  }

  revalidatePath("/admin/faculty");
  redirect("/admin/faculty");
}

// ----------------------------------------------------------------- toppers

export async function saveTopper(previous: ResourceState, formData: FormData) {
  return handle(
    Capability.TOPPER_MANAGE,
    topperSchema,
    previous,
    formData,
    async (data, user) => {
      if (!canAccessBranch(user, data.branchId)) {
        return { ok: false, message: "You cannot edit that campus." };
      }

      const payload = {
        branchId: data.branchId,
        studentName: data.studentName,
        academicYear: data.academicYear,
        stream: data.stream as Stream,
        percentage: Number(data.percentage),
        marksObtained: num(data.marksObtained),
        totalMarks: num(data.totalMarks),
        rankLabel: data.rankLabel || null,
        photoUrl: data.photoUrl || null,
        orderIndex: num(data.orderIndex) ?? 0,
      };

      if (data.id) {
        await prisma.topper.update({ where: { id: data.id }, data: payload });
      } else {
        await prisma.topper.create({ data: payload });
      }

      await recordAudit({
        userId: user.id,
        action: data.id ? "topper.updated" : "topper.created",
        entity: "Topper",
        entityId: data.id || null,
        summary: `${data.studentName} (${data.percentage}%)`,
      });

      bust(tags.toppers(data.branchId), tags.branches);
      revalidatePath("/admin/toppers");
      return { ok: true, message: `Saved ${data.studentName}.` };
    },
  );
}

export async function deleteTopper(formData: FormData) {
  const user = await apiCapability(Capability.TOPPER_MANAGE);
  const id = String(formData.get("id") ?? "");

  const record = await prisma.topper.findUnique({
    where: { id },
    select: { id: true, branchId: true, studentName: true },
  });

  if (record && canAccessBranch(user, record.branchId)) {
    await prisma.topper.delete({ where: { id } });
    await recordAudit({
      userId: user.id,
      action: "topper.deleted",
      entity: "Topper",
      entityId: id,
      summary: record.studentName,
    });
    bust(tags.toppers(record.branchId), tags.branches);
  }

  revalidatePath("/admin/toppers");
  redirect("/admin/toppers");
}

// ----------------------------------------------------------------- courses

export async function saveCourse(previous: ResourceState, formData: FormData) {
  return handle(
    Capability.COURSE_MANAGE,
    courseSchema,
    previous,
    formData,
    async (data, user) => {
      if (!canAccessBranch(user, data.branchId)) {
        return { ok: false, message: "You cannot edit that campus." };
      }

      const clash = await prisma.course.findFirst({
        where: {
          branchId: data.branchId,
          code: data.code,
          ...(data.id ? { NOT: { id: data.id } } : {}),
        },
        select: { id: true },
      });

      if (clash) {
        return {
          ok: false,
          errors: { code: "This campus already has a combination with that code." },
        };
      }

      const payload = {
        branchId: data.branchId,
        code: data.code,
        name: data.name,
        stream: data.stream as Stream,
        subjects: list(data.subjects),
        description: data.description || null,
        eligibility: data.eligibility || null,
        durationYears: num(data.durationYears) ?? 2,
        intake: num(data.intake),
        annualFee: num(data.annualFee),
        orderIndex: num(data.orderIndex) ?? 0,
        isActive: Boolean(data.isActive),
      };

      if (data.id) {
        await prisma.course.update({ where: { id: data.id }, data: payload });
      } else {
        await prisma.course.create({ data: payload });
      }

      await recordAudit({
        userId: user.id,
        action: data.id ? "course.updated" : "course.created",
        entity: "Course",
        entityId: data.id || null,
        summary: `${data.code} — ${data.name}`,
      });

      bust(tags.courses(data.branchId), tags.branches);
      revalidatePath("/admin/courses");
      return { ok: true, message: `Saved ${data.code}.` };
    },
  );
}

export async function deleteCourse(formData: FormData) {
  const user = await apiCapability(Capability.COURSE_MANAGE);
  const id = String(formData.get("id") ?? "");

  const record = await prisma.course.findUnique({
    where: { id },
    select: { id: true, branchId: true, code: true, _count: { select: { applications: true } } },
  });

  if (record && canAccessBranch(user, record.branchId)) {
    if (record._count.applications > 0) {
      // Keep the combination rather than orphan the applications that chose it.
      await prisma.course.update({ where: { id }, data: { isActive: false } });
      await recordAudit({
        userId: user.id,
        action: "course.deactivated",
        entity: "Course",
        entityId: id,
        summary: `${record.code} (has applications)`,
      });
    } else {
      await prisma.course.delete({ where: { id } });
      await recordAudit({
        userId: user.id,
        action: "course.deleted",
        entity: "Course",
        entityId: id,
        summary: record.code,
      });
    }

    bust(tags.courses(record.branchId), tags.branches);
  }

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

// -------------------------------------------------------------------- FAQs

export async function saveFaq(previous: ResourceState, formData: FormData) {
  return handle(
    Capability.FAQ_MANAGE,
    faqSchema,
    previous,
    formData,
    async (data, user) => {
      const branchId = data.branchId || null;

      if (!canAccessBranch(user, branchId)) {
        return { ok: false, message: "You cannot edit answers for that scope." };
      }

      const payload = {
        branchId,
        question: data.question,
        answer: data.answer,
        keywords: list(data.keywords),
        category: data.category || null,
        orderIndex: num(data.orderIndex) ?? 0,
        isActive: Boolean(data.isActive),
      };

      if (data.id) {
        await prisma.faqEntry.update({ where: { id: data.id }, data: payload });
      } else {
        await prisma.faqEntry.create({ data: payload });
      }

      await recordAudit({
        userId: user.id,
        action: data.id ? "faq.updated" : "faq.created",
        entity: "FaqEntry",
        entityId: data.id || null,
        summary: data.question,
      });

      bust(tags.faqs);
      revalidatePath("/admin/faqs");
      return { ok: true, message: "Saved." };
    },
  );
}

export async function deleteFaq(formData: FormData) {
  const user = await apiCapability(Capability.FAQ_MANAGE);
  const id = String(formData.get("id") ?? "");

  const record = await prisma.faqEntry.findUnique({
    where: { id },
    select: { id: true, branchId: true, question: true },
  });

  if (record && canAccessBranch(user, record.branchId)) {
    await prisma.faqEntry.delete({ where: { id } });
    await recordAudit({
      userId: user.id,
      action: "faq.deleted",
      entity: "FaqEntry",
      entityId: id,
      summary: record.question,
    });
    bust(tags.faqs);
  }

  revalidatePath("/admin/faqs");
  redirect("/admin/faqs");
}

// ------------------------------------------------------------ page content

export async function savePageContent(previous: ResourceState, formData: FormData) {
  return handle(
    Capability.PAGE_MANAGE,
    pageContentSchema,
    previous,
    formData,
    async (data, user) => {
      const branchId = data.branchId || null;

      if (!canAccessBranch(user, branchId)) {
        return { ok: false, message: "You cannot edit content for that scope." };
      }

      // A compound unique cannot be matched with a null component, so the
      // institution-wide row is located with findFirst.
      const existing = await prisma.pageContent.findFirst({
        where: { branchId, key: data.key },
        select: { id: true },
      });

      if (existing) {
        await prisma.pageContent.update({
          where: { id: existing.id },
          data: { title: data.title || null, body: data.body, updatedById: user.id },
        });
      } else {
        await prisma.pageContent.create({
          data: {
            branchId,
            key: data.key,
            title: data.title || null,
            body: data.body,
            updatedById: user.id,
          },
        });
      }

      await recordAudit({
        userId: user.id,
        action: "page.saved",
        entity: "PageContent",
        entityId: existing?.id ?? null,
        summary: `${data.key}${branchId ? "" : " (institution-wide)"}`,
      });

      bust(tags.pages);
      revalidatePath("/admin/pages");
      return { ok: true, message: "Content saved." };
    },
  );
}

// ----------------------------------------------------------------- gallery

export async function saveAlbum(previous: ResourceState, formData: FormData) {
  return handle(
    Capability.GALLERY_MANAGE,
    albumSchema,
    previous,
    formData,
    async (data, user) => {
      const branchId = data.branchId || null;

      if (!canAccessBranch(user, branchId)) {
        return { ok: false, message: "You cannot edit albums for that scope." };
      }

      const eventDate = data.eventDate ? new Date(data.eventDate) : null;

      const payload = {
        branchId,
        title: data.title,
        description: data.description || null,
        coverImageUrl: data.coverImageUrl || null,
        eventDate: eventDate && !Number.isNaN(eventDate.getTime()) ? eventDate : null,
        orderIndex: num(data.orderIndex) ?? 0,
        isPublished: Boolean(data.isPublished),
      };

      if (data.id) {
        await prisma.galleryAlbum.update({ where: { id: data.id }, data: payload });
      } else {
        const slug = await uniqueSlug(data.title, async (candidate) =>
          Boolean(
            await prisma.galleryAlbum.findUnique({
              where: { slug: candidate },
              select: { id: true },
            }),
          ),
        );

        await prisma.galleryAlbum.create({ data: { ...payload, slug } });
      }

      await recordAudit({
        userId: user.id,
        action: data.id ? "album.updated" : "album.created",
        entity: "GalleryAlbum",
        entityId: data.id || null,
        summary: data.title,
      });

      bust(tags.gallery);
      revalidatePath("/admin/gallery");
      return { ok: true, message: `Saved ${data.title}.` };
    },
  );
}

export async function deleteAlbum(formData: FormData) {
  const user = await apiCapability(Capability.GALLERY_MANAGE);
  const id = String(formData.get("id") ?? "");

  const record = await prisma.galleryAlbum.findUnique({
    where: { id },
    select: { id: true, branchId: true, title: true },
  });

  if (record && canAccessBranch(user, record.branchId)) {
    await prisma.galleryAlbum.delete({ where: { id } });
    await recordAudit({
      userId: user.id,
      action: "album.deleted",
      entity: "GalleryAlbum",
      entityId: id,
      summary: record.title,
    });
    bust(tags.gallery);
  }

  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function addAlbumImage(previous: ResourceState, formData: FormData) {
  return handle(
    Capability.GALLERY_MANAGE,
    albumImageSchema,
    previous,
    formData,
    async (data, user) => {
      const album = await prisma.galleryAlbum.findUnique({
        where: { id: data.albumId },
        select: { id: true, branchId: true, title: true },
      });

      if (!album || !canAccessBranch(user, album.branchId)) {
        return { ok: false, message: "Album not found." };
      }

      await prisma.galleryImage.create({
        data: {
          albumId: album.id,
          url: data.url,
          caption: data.caption || null,
          orderIndex: num(data.orderIndex) ?? 0,
        },
      });

      await recordAudit({
        userId: user.id,
        action: "album.image_added",
        entity: "GalleryAlbum",
        entityId: album.id,
        summary: album.title,
      });

      bust(tags.gallery);
      revalidatePath(`/admin/gallery/${album.id}`);
      return { ok: true, message: "Photograph added." };
    },
  );
}

export async function deleteAlbumImage(formData: FormData) {
  const user = await apiCapability(Capability.GALLERY_MANAGE);
  const id = String(formData.get("id") ?? "");

  const image = await prisma.galleryImage.findUnique({
    where: { id },
    select: { id: true, album: { select: { id: true, branchId: true } } },
  });

  if (image && canAccessBranch(user, image.album.branchId)) {
    await prisma.galleryImage.delete({ where: { id } });
    bust(tags.gallery);
    revalidatePath(`/admin/gallery/${image.album.id}`);
  }

  redirect(image ? `/admin/gallery/${image.album.id}` : "/admin/gallery");
}

// --------------------------------------------------------- branch settings

export async function saveBranchSettings(
  previous: ResourceState,
  formData: FormData,
) {
  return handle(
    Capability.SETTINGS_MANAGE,
    branchSettingsSchema,
    previous,
    formData,
    async (data, user) => {
      if (!canAccessBranch(user, data.id)) {
        return { ok: false, message: "You cannot edit that campus." };
      }

      const branch = await prisma.branch.update({
        where: { id: data.id },
        data: {
          shortName: data.shortName,
          tagline: data.tagline || null,
          about: data.about || null,
          addressLine1: data.addressLine1 || null,
          addressLine2: data.addressLine2 || null,
          city: data.city || null,
          district: data.district || null,
          state: data.state || null,
          pincode: data.pincode || null,
          phone: data.phone || null,
          altPhone: data.altPhone || null,
          email: data.email || null,
          whatsappNo: data.whatsappNo || null,
          mapEmbedUrl: data.mapEmbedUrl || null,
          principalName: data.principalName || null,
          principalMessage: data.principalMessage || null,
          principalPhotoUrl: data.principalPhotoUrl || null,
          admissionNote: data.admissionNote || null,
          themeColor: data.themeColor,
          admissionOpen: Boolean(data.admissionOpen),
        },
        select: { slug: true, shortName: true },
      });

      await recordAudit({
        userId: user.id,
        action: "branch.updated",
        entity: "Branch",
        entityId: data.id,
        summary: branch.shortName,
      });

      bust(tags.branches, tags.branch(branch.slug), tags.pages);
      revalidatePath("/admin/branches");
      return { ok: true, message: `Saved ${branch.shortName}.` };
    },
  );
}

// --------------------------------------------------------------- enquiries

export async function toggleEnquiryRead(formData: FormData) {
  const user = await apiCapability(Capability.CONTACT_VIEW);
  const id = String(formData.get("id") ?? "");

  const record = await prisma.contactMessage.findUnique({
    where: { id },
    select: { id: true, branchId: true, isRead: true },
  });

  if (record && (record.branchId === null || canAccessBranch(user, record.branchId))) {
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: !record.isRead },
    });
  }

  revalidatePath("/admin/enquiries");
}
