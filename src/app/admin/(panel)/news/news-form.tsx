"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { FieldError, Hint, Input, Label, Select, Textarea } from "@/components/ui/field";
import { saveNewsItem, type NewsFormState } from "@/lib/actions/news";
import { NewsCategory } from "@/generated/prisma/enums";

const initialState: NewsFormState = { ok: false };

const CATEGORY_LABELS: Record<string, string> = {
  NOTICE: "Notice",
  NEWS: "News",
  EVENT: "Event",
  CIRCULAR: "Circular",
  RESULT: "Result",
  ACHIEVEMENT: "Achievement",
};

export type NewsFormValues = {
  id?: string;
  branchId?: string | null;
  title?: string;
  category?: string;
  summary?: string | null;
  body?: string | null;
  linkUrl?: string | null;
  attachmentUrl?: string | null;
  publishedAt?: string;
  expiresAt?: string;
  isTicker?: boolean;
  isPinned?: boolean;
  isPublished?: boolean;
};

export function NewsForm({
  item,
  branches,
  canPublishGlobally,
}: {
  item?: NewsFormValues;
  branches: { id: string; shortName: string }[];
  canPublishGlobally: boolean;
}) {
  const [state, formAction] = useActionState(saveNewsItem, initialState);
  const errors = state.errors ?? {};
  const v = (name: keyof NewsFormValues, fallback = "") =>
    state.values?.[name] ?? (item?.[name] as string | undefined) ?? fallback;

  const checked = (name: "isTicker" | "isPinned" | "isPublished", fallback: boolean) =>
    state.values ? state.values[name] === "on" : (item?.[name] ?? fallback);

  return (
    <form
      key={state.attempt ?? 0}
      action={formAction}
      noValidate
      className="space-y-6"
    >
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}

      {state.message ? (
        <div
          role="alert"
          className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-[0.86rem] text-red-800"
        >
          {state.message}
        </div>
      ) : null}

      <Panel title="Notice">
        <div className="grid gap-4 p-5">
          <div>
            <Label htmlFor="title" required>
              Title
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={v("title")}
              invalid={Boolean(errors.title)}
              required
            />
            <FieldError message={errors.title} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="category" required>
                Category
              </Label>
              <Select
                id="category"
                name="category"
                defaultValue={v("category", NewsCategory.NOTICE)}
              >
                {Object.values(NewsCategory).map((value) => (
                  <option key={value} value={value}>
                    {CATEGORY_LABELS[value] ?? value}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.category} />
            </div>

            <div>
              <Label htmlFor="branchId">Campus</Label>
              <Select
                id="branchId"
                name="branchId"
                defaultValue={v("branchId")}
              >
                {canPublishGlobally ? (
                  <option value="">Institution-wide (shown everywhere)</option>
                ) : null}
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.shortName}
                  </option>
                ))}
              </Select>
              <Hint>
                Institution-wide notices appear on the main site and on both campus
                sites.
              </Hint>
            </div>
          </div>

          <div>
            <Label htmlFor="summary">Short summary</Label>
            <Textarea
              id="summary"
              name="summary"
              rows={2}
              defaultValue={v("summary")}
              placeholder="One or two lines shown in the notice board and listings."
            />
            <FieldError message={errors.summary} />
          </div>

          <div>
            <Label htmlFor="body">Full text</Label>
            <Textarea
              id="body"
              name="body"
              rows={10}
              defaultValue={v("body")}
              placeholder="Leave a blank line between paragraphs."
            />
            <FieldError message={errors.body} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="linkUrl">External link</Label>
              <Input
                id="linkUrl"
                name="linkUrl"
                defaultValue={v("linkUrl")}
                placeholder="https://…"
                invalid={Boolean(errors.linkUrl)}
              />
              <Hint>If set, the notice links straight here instead of to its page.</Hint>
              <FieldError message={errors.linkUrl} />
            </div>

            <div>
              <Label htmlFor="attachmentUrl">Attachment link</Label>
              <Input
                id="attachmentUrl"
                name="attachmentUrl"
                defaultValue={v("attachmentUrl")}
                placeholder="https://… (PDF or image)"
                invalid={Boolean(errors.attachmentUrl)}
              />
              <FieldError message={errors.attachmentUrl} />
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Publishing">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="publishedAt">Publish date</Label>
            <Input
              id="publishedAt"
              name="publishedAt"
              type="date"
              defaultValue={v("publishedAt")}
            />
            <Hint>A future date keeps it hidden until then.</Hint>
          </div>

          <div>
            <Label htmlFor="expiresAt">Remove from the website on</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              defaultValue={v("expiresAt")}
            />
            <Hint>Leave blank to keep it indefinitely.</Hint>
          </div>

          <div className="space-y-3 sm:col-span-2">
            <Toggle
              name="isPublished"
              label="Published"
              description="Unpublished notices stay here as drafts."
              defaultChecked={checked("isPublished", true)}
            />
            <Toggle
              name="isTicker"
              label="Show in the scrolling updates strip"
              description="Appears in the rolling headline bar at the top of every page."
              defaultChecked={checked("isTicker", false)}
            />
            <Toggle
              name="isPinned"
              label="Pin to the top"
              description="Keeps the notice above newer ones in lists and the notice board."
              defaultChecked={checked("isPinned", false)}
            />
          </div>
        </div>
      </Panel>

      <div className="flex items-center gap-4">
        <SubmitButton isEdit={Boolean(item?.id)} />
        <Link
          href="/admin/news"
          className="text-[0.82rem] font-semibold text-ink-600 underline underline-offset-4"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#7a1f2b]"
      />
      <span>
        <span className="block text-[0.86rem] font-medium text-ink-800">{label}</span>
        <span className="block text-[0.78rem] text-ink-500">{description}</span>
      </span>
    </label>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Saving…" : isEdit ? "Save changes" : "Publish notice"}
    </Button>
  );
}
