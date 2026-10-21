/**
 * Quick quality check for the website assistant's answer matching.
 *
 * Run with `npm run check:chatbot` after editing chatbot answers to confirm
 * that the questions visitors actually ask still reach the right reply, and
 * that off-topic questions still fall through to the "call the office" path.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { answerQuestion } from "../src/lib/chatbot";

const SHOULD_ANSWER = [
  "how much is the fee",
  "what are the fees for pcmb",
  "how do i apply",
  "admision process",
  "what documents are needed",
  "is there bus facility",
  "do you have hostel",
  "what combinations do you offer",
  "last date to apply",
  "scholarship for sc st",
  "what was the result last year",
  "office timings",
  "contact number",
  "can i get admission in both branches",
];

const SHOULD_NOT_ANSWER = [
  "who won the cricket match",
  "what is the price of gold today",
];

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const faqs = await prisma.faqEntry.findMany({ where: { isActive: true } });
  const candidates = faqs.map((faq) => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    keywords: faq.keywords,
    category: faq.category,
  }));

  let matched = 0;
  for (const question of SHOULD_ANSWER) {
    const reply = answerQuestion(question, candidates, "08251 230000");
    if (reply.kind === "answer") matched += 1;
    console.log(`${reply.kind === "answer" ? "OK  " : "MISS"} ${question}`);
    console.log(`       → ${reply.answer.slice(0, 90)}…`);
  }

  let falsePositives = 0;
  for (const question of SHOULD_NOT_ANSWER) {
    const reply = answerQuestion(question, candidates, "08251 230000");
    if (reply.kind === "answer") falsePositives += 1;
    console.log(`${reply.kind === "answer" ? "BAD " : "OK  "} (expected no match) ${question}`);
  }

  const greeting = answerQuestion("hello", candidates, "08251 230000").kind;

  console.log(
    `\nmatched ${matched}/${SHOULD_ANSWER.length} · false positives ${falsePositives}/${SHOULD_NOT_ANSWER.length} · greeting: ${greeting}`,
  );

  await prisma.$disconnect();

  if (matched < SHOULD_ANSWER.length || falsePositives > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
