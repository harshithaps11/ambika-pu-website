import { prisma } from "./prisma";

type AuditInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  summary?: string | null;
  ipHash?: string | null;
};

/**
 * Records an administrative change. Deliberately never throws: an audit write
 * failing must not roll back or hide the action the user actually performed.
 */
export async function recordAudit(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        summary: input.summary ?? null,
        ipHash: input.ipHash ?? null,
      },
    });
  } catch (error) {
    console.error("[audit] failed to record entry", input.action, error);
  }
}
