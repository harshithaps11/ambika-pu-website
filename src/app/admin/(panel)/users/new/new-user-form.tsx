"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { PermissionMatrix } from "@/components/admin/permission-matrix";
import { Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { FieldError, Hint, Input, Label } from "@/components/ui/field";
import { createStaffUser, type UserActionState } from "@/lib/actions/users";
import type { CapabilityGroup } from "@/lib/permissions";

const initialState: UserActionState = { ok: false };

export function NewUserForm({
  groups,
  branches,
}: {
  groups: CapabilityGroup[];
  branches: { id: string; shortName: string }[];
}) {
  const [state, formAction] = useActionState(createStaffUser, initialState);
  const errors = state.errors ?? {};

  if (state.ok && state.temporaryPassword) {
    return (
      <Panel title="Account created">
        <div className="space-y-4 p-5">
          <p className="text-[0.9rem] text-ink-700">{state.message}</p>

          <div className="border-2 border-dashed border-ink-300 bg-ink-50 px-5 py-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
              Temporary password — shown only once
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-brand-700">
              {state.temporaryPassword}
            </p>
          </div>

          <p className="text-[0.84rem] text-ink-600">
            Pass this to the staff member. They will be asked to set a password of
            their own the first time they sign in.
          </p>

          <div className="flex gap-3">
            <Link
              href="/admin/users"
              className="inline-flex h-10 items-center rounded-sm bg-brand-700 px-5 text-[0.82rem] font-semibold text-white"
            >
              Back to staff accounts
            </Link>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state.message && !state.ok ? (
        <div
          role="alert"
          className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-[0.86rem] text-red-800"
        >
          {state.message}
        </div>
      ) : null}

      <Panel title="Account details">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="name" required>
              Name
            </Label>
            <Input
              id="name"
              name="name"
              invalid={Boolean(errors.name)}
              placeholder="e.g. Office — Nellikatte"
              required
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <Label htmlFor="email" required>
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              invalid={Boolean(errors.email)}
              required
            />
            <Hint>Used to sign in. A temporary password is generated for you.</Hint>
            <FieldError message={errors.email} />
          </div>
        </div>
      </Panel>

      <Panel
        title="Campus access"
        description="Which campuses this account may work with."
      >
        <div className="space-y-3 p-5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="allBranches"
              className="mt-0.5 h-4 w-4 accent-[#7a1f2b]"
            />
            <span className="text-[0.86rem] text-ink-800">
              All campuses, including institution-wide notices
            </span>
          </label>

          <p className="text-[0.78rem] text-ink-500">Or choose specific campuses:</p>

          {branches.map((branch) => (
            <label key={branch.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                name="branchIds"
                value={branch.id}
                className="h-4 w-4 accent-[#7a1f2b]"
              />
              <span className="text-[0.86rem] text-ink-800">{branch.shortName}</span>
            </label>
          ))}
        </div>
      </Panel>

      <Panel
        title="Permissions"
        description="Nothing is granted by default. Tick only what this account needs; you can change it at any time."
      >
        <PermissionMatrix groups={groups} granted={[]} />
      </Panel>

      <div className="flex items-center gap-4">
        <SubmitButton />
        <Link
          href="/admin/users"
          className="text-[0.82rem] font-semibold text-ink-600 underline underline-offset-4"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Creating…" : "Create account"}
    </Button>
  );
}
