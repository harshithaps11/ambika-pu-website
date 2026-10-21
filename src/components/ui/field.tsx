import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-sm border bg-white px-3 py-2 text-sm text-ink-900 transition-colors placeholder:text-ink-400 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/15 disabled:bg-ink-50 disabled:text-ink-500";

export function Label({
  children,
  htmlFor,
  required,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("mb-1.5 block text-[0.8rem] font-semibold text-ink-700", className)}
    >
      {children}
      {required ? <span className="ml-0.5 text-red-600">*</span> : null}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-700">{message}</p>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-ink-500">{children}</p>;
}

export function Input({
  className,
  invalid,
  ...props
}: ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      className={cn(controlBase, invalid ? "border-red-400" : "border-ink-300", className)}
      {...props}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...props
}: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(
        controlBase,
        "min-h-28 resize-y",
        invalid ? "border-red-400" : "border-ink-300",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...props
}: ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <select
      className={cn(
        controlBase,
        "appearance-none bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat pr-9",
        invalid ? "border-red-400" : "border-ink-300",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%235f5a51'%3E%3Cpath fill-rule='evenodd' d='M5.2 7.3a1 1 0 011.4 0L10 10.7l3.4-3.4a1 1 0 111.4 1.4l-4.1 4.1a1 1 0 01-1.4 0L5.2 8.7a1 1 0 010-1.4z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}
