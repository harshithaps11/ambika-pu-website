"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/field";
import { login, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = { ok: false };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(login, initialState);
  const errors = state.errors ?? {};

  return (
    <form
      key={state.attempt ?? 0}
      action={formAction}
      noValidate
      className="space-y-4"
    >
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.message ? (
        <div
          role="alert"
          className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-[0.85rem] text-red-800"
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <Label htmlFor="email" required>
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={state.values?.email ?? ""}
          autoComplete="username"
          autoFocus
          invalid={Boolean(errors.email)}
          required
        />
        <FieldError message={errors.email} />
      </div>

      <div>
        <Label htmlFor="password" required>
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          invalid={Boolean(errors.password)}
          required
        />
        <FieldError message={errors.password} />
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}
