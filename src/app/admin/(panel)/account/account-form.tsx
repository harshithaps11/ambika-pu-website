"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { FieldError, Hint, Input, Label } from "@/components/ui/field";
import { changePassword, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = { ok: false };

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePassword, initialState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} noValidate className="max-w-md space-y-4 p-5">
      {state.message ? (
        <div
          role="status"
          className={
            state.ok
              ? "border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-[0.85rem] text-emerald-900"
              : "border-l-4 border-red-600 bg-red-50 px-4 py-3 text-[0.85rem] text-red-800"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <Label htmlFor="currentPassword" required>
          Current password
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          invalid={Boolean(errors.currentPassword)}
          required
        />
        <FieldError message={errors.currentPassword} />
      </div>

      <div>
        <Label htmlFor="newPassword" required>
          New password
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          invalid={Boolean(errors.newPassword)}
          required
        />
        <Hint>
          At least 10 characters, with an uppercase letter, a lowercase letter and a
          number.
        </Hint>
        <FieldError message={errors.newPassword} />
      </div>

      <div>
        <Label htmlFor="confirmPassword" required>
          Confirm new password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          invalid={Boolean(errors.confirmPassword)}
          required
        />
        <FieldError message={errors.confirmPassword} />
      </div>

      <SubmitButton />

      <p className="text-[0.76rem] text-ink-500">
        Changing your password signs you out of every other device.
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Change password"}
    </Button>
  );
}
