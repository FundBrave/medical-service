import { useQuery } from "@tanstack/react-query";

const FALLBACK_RATE = 1600;

async function fetchRate(): Promise<number> {
  const res = await fetch("/api/exchange-rate");
  if (!res.ok) return FALLBACK_RATE;
  const data = (await res.json()) as { rate?: number };
  return data.rate && data.rate > 0 ? data.rate : FALLBACK_RATE;
}

export function useNGNRate() {
  const { data: rate = FALLBACK_RATE } = useQuery({
    queryKey: ["ngn-rate"],
    queryFn: fetchRate,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
  });

  const usdToNgn = (usd: number) => Math.round(usd * rate);
  const ngnToUsd = (ngn: number) => ngn / rate;

  return { rate, usdToNgn, ngnToUsd };
}
