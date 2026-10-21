import { NextResponse, type NextRequest } from "next/server";
import { site } from "@/config/site";
import { answerQuestion } from "@/lib/chatbot";
import { hashIdentifier } from "@/lib/crypto";
import { getBranchBySlug } from "@/lib/data/branches";
import { getFaqs } from "@/lib/data/content";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = hashIdentifier(forwarded ?? request.headers.get("x-real-ip") ?? "local");

  const limit = rateLimit(`chat:${ipHash}`, 30, 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Please wait a moment before asking again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let payload: { message?: unknown; branchSlug?: unknown };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const message = typeof payload.message === "string" ? payload.message.slice(0, 500) : "";
  const branchSlug =
    typeof payload.branchSlug === "string" ? payload.branchSlug.slice(0, 80) : "";

  if (!message.trim()) {
    return NextResponse.json({ error: "Please type a question." }, { status: 400 });
  }

  const branch = branchSlug ? await getBranchBySlug(branchSlug) : null;
  const faqs = await getFaqs(branch?.id ?? null);

  const reply = answerQuestion(
    message,
    faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords,
      category: faq.category,
    })),
    branch?.phone || site.contact.phone,
  );

  // Usage counts show the office which questions people actually ask, and
  // which gaps are worth writing an answer for. Never block the reply on it.
  if (reply.matchedId) {
    prisma.faqEntry
      .update({
        where: { id: reply.matchedId },
        data: { hitCount: { increment: 1 } },
      })
      .catch(() => undefined);
  }

  return NextResponse.json(reply, { headers: { "Cache-Control": "no-store" } });
}
