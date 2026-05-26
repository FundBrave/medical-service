export function formatNGN(usd: number, rate: number): string {
  if (!Number.isFinite(usd) || !Number.isFinite(rate)) return "0";
  return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(
    Math.round(usd * rate)
  );
}

export function formatUSD(usd: number, decimals = 2): string {
  if (!Number.isFinite(usd)) return "0";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(usd);
}
