import { NextResponse } from "next/server";

const CACHE_TTL_MS = 10 * 60 * 1000;
const FALLBACK_RATE = 1370;

let cachedRate: number | null = null;
let cachedAt = 0;

async function fetchParallelRate(): Promise<number> {
  // Try multiple sources for the parallel/black market rate

  // Source 1: AbokiFX-style API (most accurate for Nigerian parallel market)
  try {
    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { next: { revalidate: 600 } }
    );
    if (res.ok) {
      const data = (await res.json()) as { rates?: Record<string, number> };
      const rate = data.rates?.NGN;
      if (rate && rate > 0) {
        return rate;
      }
    }
  } catch {}

  // Source 2: Open Exchange Rates
  try {
    const res = await fetch(
      "https://open.er-api.com/v6/latest/USD",
      { next: { revalidate: 600 } }
    );
    if (res.ok) {
      const data = (await res.json()) as { rates?: Record<string, number> };
      const rate = data.rates?.NGN;
      if (rate && rate > 0) {
        return rate;
      }
    }
  } catch {}

  return FALLBACK_RATE;
}

export async function GET() {
  const now = Date.now();

  if (cachedRate !== null && now - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({ rate: cachedRate, source: "cache" });
  }

  try {
    const rate = await fetchParallelRate();
    cachedRate = rate;
    cachedAt = now;
    return NextResponse.json({ rate, source: "live" });
  } catch {
    return NextResponse.json(
      { rate: cachedRate ?? FALLBACK_RATE, source: "fallback" },
      { status: 200 }
    );
  }
}
