"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/field";
import { STATUS_LABELS } from "@/components/admin/ui";
import {
  updateApplication,
  type ApplicationUpdateState,
} from "@/lib/actions/applications";
import { ApplicationStatus } from "@/generated/prisma/enums";

const initialState: ApplicationUpdateState = { ok: false };

export function ReviewForm({
  id,
  status,
  internalNotes,
}: {
  id: string;
  status: ApplicationStatus;
  internalNotes: string | null;
}) {
  const [state, formAction] = useActionState(updateApplication, initialState);

  return (
    <form action={formAction} className="space-y-4 p-5">
      <input type="hidden" name="id" value={id} />

      {state.message ? (
        <div
          role="status"
          className={
            state.ok
              ? "border-l-4 border-emerald-600 bg-emerald-50 px-4 py-2.5 text-[0.84rem] text-emerald-900"
              : "border-l-4 border-red-600 bg-red-50 px-4 py-2.5 text-[0.84rem] text-red-800"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={status}>
          {Object.values(ApplicationStatus).map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="internalNotes">Office notes</Label>
        <Textarea
          id="internalNotes"
          name="internalNotes"
          rows={5}
          defaultValue={internalNotes ?? ""}
          placeholder="Documents verified, fee paid, called on 12th, and so on."
        />
        <p className="mt-1 text-[0.74rem] text-ink-500">
          Visible only inside this panel. The applicant never sees these notes.
        </p>
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}
