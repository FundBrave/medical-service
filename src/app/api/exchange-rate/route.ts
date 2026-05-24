import { NextResponse } from "next/server";

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const FALLBACK_RATE = 1600;

let cachedRate: number | null = null;
let cachedAt = 0;

export async function GET() {
  const now = Date.now();

  if (cachedRate !== null && now - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({ rate: cachedRate, source: "cache" });
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 600 },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as { rates?: Record<string, number> };
    const rate = data.rates?.NGN;

    if (!rate || rate <= 0) throw new Error("NGN rate missing from response");

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
