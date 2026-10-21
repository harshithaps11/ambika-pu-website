"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Suggestion = { id: string; question: string };

type Message = {
  id: string;
  from: "visitor" | "assistant";
  text: string;
  suggestions?: Suggestion[];
};

const OPENING: Message = {
  id: "opening",
  from: "assistant",
  text: "Namaskara. Ask me about admissions, combinations, fees, results, timings or how to reach the college.",
  suggestions: [],
};

export function ChatWidget({
  branchSlug,
  starters = [],
  title = "Ask the college",
}: {
  branchSlug?: string;
  starters?: string[];
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([OPENING]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const panelId = useId();
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;

    setDraft("");
    setMessages((current) => [
      ...current,
      { id: `v-${Date.now()}`, from: "visitor", text },
    ]);
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, branchSlug }),
      });

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          from: "assistant",
          text:
            data.answer ??
            data.error ??
            "Something went wrong. Please call the college office.",
          suggestions: data.suggestions ?? [],
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          from: "assistant",
          text: "I could not reach the college just now. Please try again in a moment.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="fixed bottom-4 right-4 z-50 flex h-13 items-center gap-2 rounded-full px-5 py-3 text-[0.82rem] font-semibold text-white shadow-raise transition-transform hover:scale-[1.03]"
        style={{ backgroundColor: "var(--branch-color)" }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
          {open ? (
            <path d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 01-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 01-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z" />
          ) : (
            <path d="M10 2.5c-4.3 0-7.8 2.9-7.8 6.5 0 2 1.1 3.8 2.8 5-.1 1-.6 2.3-1.5 3.2 1.6-.2 3.1-.9 4.2-1.8.7.2 1.5.3 2.3.3 4.3 0 7.8-2.9 7.8-6.7S14.3 2.5 10 2.5z" />
          )}
        </svg>
        {open ? "Close" : title}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="fixed bottom-20 right-4 z-50 flex max-h-[min(32rem,calc(100dvh-7rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden border border-ink-300 bg-white shadow-raise"
      >
        <header
          className="flex items-center justify-between px-4 py-3 text-white"
          style={{ backgroundColor: "var(--branch-color)" }}
        >
          <div>
            <p className="font-serif text-[0.95rem] font-semibold">{title}</p>
            <p className="text-[0.7rem] text-white/75">
              Answers written by the college office
            </p>
          </div>
        </header>

        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          className="flex-1 space-y-3 overflow-y-auto bg-ink-50 px-3.5 py-3.5"
        >
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={cn(
                  "max-w-[85%] px-3.5 py-2.5 text-[0.84rem] leading-relaxed",
                  message.from === "visitor"
                    ? "ml-auto bg-ink-800 text-white"
                    : "border border-ink-200 bg-white text-ink-800",
                )}
              >
                {message.text}
              </div>

              {message.suggestions?.length ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {message.suggestions.map((suggestion) => (
                    <li key={suggestion.id}>
                      <button
                        type="button"
                        onClick={() => ask(suggestion.question)}
                        className="border border-ink-300 bg-white px-2.5 py-1 text-left text-[0.74rem] text-ink-700 transition-colors hover:border-brand-700 hover:text-brand-700"
                      >
                        {suggestion.question}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}

          {messages.length === 1 && starters.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {starters.map((starter) => (
                <li key={starter}>
                  <button
                    type="button"
                    onClick={() => ask(starter)}
                    className="border border-ink-300 bg-white px-2.5 py-1 text-[0.74rem] text-ink-700 transition-colors hover:border-brand-700 hover:text-brand-700"
                  >
                    {starter}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {busy ? (
            <p className="text-[0.76rem] italic text-ink-500">Looking that up…</p>
          ) : null}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            ask(draft);
          }}
          className="flex items-center gap-2 border-t border-ink-200 bg-white px-3 py-2.5"
        >
          <label htmlFor={`${panelId}-input`} className="sr-only">
            Type your question
          </label>
          <input
            id={`${panelId}-input`}
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your question…"
            maxLength={300}
            autoComplete="off"
            className="min-w-0 flex-1 border border-ink-300 px-3 py-2 text-[0.84rem] focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/15"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="shrink-0 px-3 py-2 text-[0.8rem] font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--branch-color)" }}
          >
            Ask
          </button>
        </form>
      </div>
    </>
  );
}
