type Bucket = {
  hits: number[];
};

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;

  for (const [key, bucket] of buckets) {
    // An hour with no activity is long enough for every window we use.
    if (bucket.hits.every((hit) => now - hit > 60 * 60 * 1000)) {
      buckets.delete(key);
    }
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Sliding-window limiter held in process memory.
 *
 * This is sized for a single-server deployment, which is what this site runs
 * on. If the app is ever scaled to several instances behind a load balancer,
 * swap the Map for Redis — the signature here is intended to stay the same.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const windowMs = windowSeconds * 1000;
  const bucket = buckets.get(key) ?? { hits: [] };
  const hits = bucket.hits.filter((hit) => now - hit < windowMs);

  if (hits.length >= limit) {
    const oldest = hits[0];
    buckets.set(key, { hits });

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  hits.push(now);
  buckets.set(key, { hits });

  return {
    allowed: true,
    remaining: limit - hits.length,
    retryAfterSeconds: 0,
  };
}

/** Clears a key early, e.g. after a successful login. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}
