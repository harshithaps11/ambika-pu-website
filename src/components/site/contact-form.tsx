"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/field";
import { submitContact, type ContactState } from "@/lib/actions/contact";

const initialState: ContactState = { ok: false };

export function ContactForm({ branchSlug }: { branchSlug?: string }) {
  const [state, formAction] = useActionState(submitContact, initialState);
  const errors = state.errors ?? {};
  const v = (name: string) => state.values?.[name] ?? "";

  if (state.ok) {
    return (
      <div
        role="status"
        className="border-l-4 border-emerald-600 bg-emerald-50 px-5 py-6 text-[0.92rem] text-emerald-900"
      >
        {state.message}
      </div>
    );
  }

  return (
    <form
      key={state.attempt ?? 0}
      action={formAction}
      noValidate
      className="space-y-4"
    >
      {branchSlug ? (
        <input type="hidden" name="branchSlug" value={branchSlug} />
      ) : null}

      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message ? (
        <div
          role="alert"
          className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-[0.86rem] text-red-800"
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name" required>
            Your name
          </Label>
          <Input
            id="contact-name"
            name="name" defaultValue={v("name")}
            autoComplete="name"
            invalid={Boolean(errors.name)}
            required
          />
          <FieldError message={errors.name} />
        </div>

        <div>
          <Label htmlFor="contact-phone" required>
            Mobile number
          </Label>
          <Input
            id="contact-phone"
            name="phone" defaultValue={v("phone")}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel-national"
            invalid={Boolean(errors.phone)}
            required
          />
          <FieldError message={errors.phone} />
        </div>
      </div>

      <div>
        <Label htmlFor="contact-email">Email address</Label>
        <Input
          id="contact-email"
          name="email" defaultValue={v("email")}
          type="email"
          autoComplete="email"
          invalid={Boolean(errors.email)}
        />
        <FieldError message={errors.email} />
      </div>

      <div>
        <Label htmlFor="contact-subject">Subject</Label>
        <Input id="contact-subject" name="subject" defaultValue={v("subject")} />
      </div>

      <div>
        <Label htmlFor="contact-message" required>
          Message
        </Label>
        <Textarea
          id="contact-message"
          name="message" defaultValue={v("message")}
          rows={5}
          invalid={Boolean(errors.message)}
          required
        />
        <FieldError message={errors.message} />
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}
