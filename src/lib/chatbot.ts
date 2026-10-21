/**
 * Rule-based answer matching for the website assistant.
 *
 * The assistant answers only from entries the college has written in the
 * admin panel. It never generates prose, so it cannot quote a fee or a date
 * that nobody approved — the property that matters most when the people
 * asking are parents deciding where to send a child.
 */

export type FaqCandidate = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string | null;
};

export type Match = {
  faq: FaqCandidate;
  score: number;
};

/** Words that carry no signal in a question of this kind. */
const STOPWORDS = new Set([
  "a", "about", "am", "an", "and", "any", "are", "as", "at", "be", "can",
  "could", "did", "do", "does", "for", "from", "get", "give", "has", "have",
  "how", "i", "if", "in", "into", "is", "it", "its", "know", "me", "my",
  "need", "of", "on", "or", "please", "pls", "sir", "so", "tell", "than",
  "that", "the", "their", "there", "they", "this", "to", "us", "was", "we",
  "what", "when", "where", "which", "who", "will", "with", "would", "you",
  "your", "u", "plz", "kindly", "madam",
]);

const GREETINGS = new Set([
  "hi", "hello", "hey", "namaskara", "namaste", "good", "morning", "evening",
  "afternoon", "thanks", "thank", "ok", "okay",
]);

/** Crude but effective suffix stripping — enough to tie "fees" to "fee". */
function stem(word: string) {
  if (word.length <= 3) return word;
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith("es") && word.length > 4) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  if (word.endsWith("ing") && word.length > 5) return word.slice(0, -3);
  return word;
}

export function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !STOPWORDS.has(word))
    .map(stem);
}

/**
 * Damerau-Levenshtein distance, bailed out early once it exceeds `limit`.
 * Keeps "admision" and "addmission" matching "admission".
 */
function editDistanceWithin(a: string, b: string, limit: number) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
      current[j] = value;
      if (value < rowMin) rowMin = value;
    }

    if (rowMin > limit) return limit + 1;
    previous = current;
  }

  return previous[b.length];
}

function fuzzyEqual(a: string, b: string) {
  if (a === b) return true;
  if (a.length < 5 || b.length < 5) return false;
  return editDistanceWithin(a, b, 1) <= 1;
}

/**
 * Builds the set of every word the college has written anywhere in its
 * answers. A question made mostly of words that appear nowhere in that
 * vocabulary is about something else entirely.
 */
export function buildVocabulary(faqs: FaqCandidate[]) {
  const vocabulary = new Set<string>();

  for (const faq of faqs) {
    for (const keyword of faq.keywords) {
      for (const token of tokenize(keyword)) vocabulary.add(token);
    }
    for (const token of tokenize(faq.question)) vocabulary.add(token);
    for (const token of tokenize(faq.answer)) vocabulary.add(token);
  }

  return vocabulary;
}

function inVocabulary(token: string, vocabulary: Set<string>) {
  if (vocabulary.has(token)) return true;
  for (const word of vocabulary) {
    if (fuzzyEqual(token, word)) return true;
  }
  return false;
}

const WEIGHT_KEYWORD = 3;
const WEIGHT_QUESTION = 1.6;
const WEIGHT_ANSWER = 0.4;
const FUZZY_FACTOR = 0.6;
/** Below this, the assistant says it does not know rather than guessing. */
export const CONFIDENCE_THRESHOLD = 1.15;
/**
 * A multi-word question needs at least this share of its words to be ones
 * the college has actually used. Without it, a single incidental word — the
 * "price" in "price of gold" brushing against the fees answer — is enough to
 * return a confident, wrong reply.
 */
const MIN_VOCABULARY_COVERAGE = 0.5;

export function scoreFaq(queryTokens: string[], faq: FaqCandidate): number {
  if (queryTokens.length === 0) return 0;

  const keywordTokens = new Set(faq.keywords.flatMap((keyword) => tokenize(keyword)));
  const questionTokens = new Set(tokenize(faq.question));
  const answerTokens = new Set(tokenize(faq.answer));

  let score = 0;
  let answerHits = 0;

  for (const token of queryTokens) {
    let best = 0;

    for (const keyword of keywordTokens) {
      if (token === keyword) {
        best = Math.max(best, WEIGHT_KEYWORD);
        break;
      }
      if (fuzzyEqual(token, keyword)) {
        best = Math.max(best, WEIGHT_KEYWORD * FUZZY_FACTOR);
      }
    }

    if (best < WEIGHT_KEYWORD) {
      for (const word of questionTokens) {
        if (token === word) {
          best = Math.max(best, WEIGHT_QUESTION);
          break;
        }
        if (fuzzyEqual(token, word)) {
          best = Math.max(best, WEIGHT_QUESTION * FUZZY_FACTOR);
        }
      }
    }

    // The answer body is weak evidence, and capped so a long answer cannot
    // win on sheer length.
    if (best === 0 && answerHits < 3 && answerTokens.has(token)) {
      best = WEIGHT_ANSWER;
      answerHits += 1;
    }

    score += best;
  }

  // Dividing by the square root rather than the count stops a long, rambling
  // question from being penalised into the fallback.
  return score / Math.sqrt(queryTokens.length);
}

export type ChatReply = {
  kind: "answer" | "greeting" | "unknown";
  answer: string;
  matchedId?: string;
  suggestions: { id: string; question: string }[];
};

export function answerQuestion(
  message: string,
  faqs: FaqCandidate[],
  fallbackContact: string,
): ChatReply {
  const rawTokens = message.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const tokens = tokenize(message);

  const isGreeting =
    rawTokens.length > 0 && rawTokens.every((word) => GREETINGS.has(word));

  const popular = faqs.slice(0, 4).map((faq) => ({ id: faq.id, question: faq.question }));

  if (isGreeting) {
    return {
      kind: "greeting",
      answer:
        "Namaskara. I can help with admissions, courses, fees, results, timings and contact details. What would you like to know?",
      suggestions: popular,
    };
  }

  if (tokens.length === 0) {
    return {
      kind: "unknown",
      answer: "Could you tell me a little more about what you are looking for?",
      suggestions: popular,
    };
  }

  const vocabulary = buildVocabulary(faqs);
  const known = tokens.filter((token) => inVocabulary(token, vocabulary)).length;
  const coverage = tokens.length ? known / tokens.length : 0;
  const offTopic = tokens.length >= 2 && coverage < MIN_VOCABULARY_COVERAGE;

  const ranked: Match[] = faqs
    .map((faq) => ({ faq, score: scoreFaq(tokens, faq) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (offTopic || !best || best.score < CONFIDENCE_THRESHOLD) {
    return {
      kind: "unknown",
      answer: `I do not have an answer for that yet. Please call the college office on ${fallbackContact}, or send your question through the contact form and the staff will reply.`,
      suggestions: ranked
        .slice(0, 3)
        .filter((match) => match.score > 0)
        .map((match) => ({ id: match.faq.id, question: match.faq.question })),
    };
  }

  return {
    kind: "answer",
    answer: best.faq.answer,
    matchedId: best.faq.id,
    suggestions: ranked
      .slice(1, 4)
      .filter((match) => match.score > CONFIDENCE_THRESHOLD * 0.5)
      .map((match) => ({ id: match.faq.id, question: match.faq.question })),
  };
}
