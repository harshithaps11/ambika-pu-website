"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { PermissionMatrix } from "@/components/admin/permission-matrix";
import { Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import {
  resetStaffPassword,
  updateStaffPermissions,
  type UserActionState,
} from "@/lib/actions/users";
import type { CapabilityGroup } from "@/lib/permissions";
import type { Capability } from "@/generated/prisma/enums";

const initialState: UserActionState = { ok: false };

export function EditUserForm({
  userId,
  groups,
  granted,
  branches,
  branchIds,
  allBranches,
  isActive,
}: {
  userId: string;
  groups: CapabilityGroup[];
  granted: Capability[];
  branches: { id: string; shortName: string }[];
  branchIds: string[];
  allBranches: boolean;
  isActive: boolean;
}) {
  const [state, formAction] = useActionState(updateStaffPermissions, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="userId" value={userId} />

      {state.message ? (
        <div
          role="status"
          className={
            state.ok
              ? "border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-[0.86rem] text-emerald-900"
              : "border-l-4 border-red-600 bg-red-50 px-4 py-3 text-[0.86rem] text-red-800"
          }
        >
          {state.message}
        </div>
      ) : null}

      <Panel title="Campus access & status">
        <div className="space-y-3 p-5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="allBranches"
              defaultChecked={allBranches}
              className="mt-0.5 h-4 w-4 accent-[#7a1f2b]"
            />
            <span className="text-[0.86rem] text-ink-800">
              All campuses, including institution-wide notices
            </span>
          </label>

          {branches.map((branch) => (
            <label key={branch.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                name="branchIds"
                value={branch.id}
                defaultChecked={branchIds.includes(branch.id)}
                className="h-4 w-4 accent-[#7a1f2b]"
              />
              <span className="text-[0.86rem] text-ink-800">{branch.shortName}</span>
            </label>
          ))}

          <label className="mt-4 flex items-start gap-3 border-t border-ink-200 pt-4">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={isActive}
              className="mt-0.5 h-4 w-4 accent-[#7a1f2b]"
            />
            <span className="text-[0.86rem] text-ink-800">
              Account is active
              <span className="block text-[0.78rem] text-ink-500">
                Unticking this signs the account out everywhere and blocks sign-in.
              </span>
            </span>
          </label>
        </div>
      </Panel>

      <Panel
        title="Permissions"
        description="Tick to grant, untick to revoke. Changes apply on this person's next page load."
      >
        <PermissionMatrix groups={groups} granted={granted} />
      </Panel>

      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Saving…" : "Save permissions"}
    </Button>
  );
}

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState(resetStaffPassword, initialState);

  return (
    <form action={formAction} className="space-y-3 p-5">
      <input type="hidden" name="userId" value={userId} />

      {state.message ? (
        <p
          className={
            state.ok
              ? "text-[0.84rem] text-emerald-800"
              : "text-[0.84rem] text-red-700"
          }
        >
          {state.message}
        </p>
      ) : null}

      {state.temporaryPassword ? (
        <div className="border-2 border-dashed border-ink-300 bg-ink-50 px-4 py-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
            Temporary password — shown only once
          </p>
          <p className="mt-1 font-mono text-base font-semibold text-brand-700">
            {state.temporaryPassword}
          </p>
        </div>
      ) : null}

      <ResetButton />
    </form>
  );
}

function ResetButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "Resetting…" : "Reset password"}
    </Button>
  );
}
