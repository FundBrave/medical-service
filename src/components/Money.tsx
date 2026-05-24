"use client";

import { formatNGN, formatUSD } from "@/lib/format";

interface MoneyProps {
  usd: number;
  rate: number;
  size?: "sm" | "md" | "lg" | "xl";
  inline?: boolean;
  hideUsd?: boolean;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Money({
  usd,
  rate,
  size = "md",
  inline = true,
  hideUsd = false,
  decimals = 2,
  className = "",
  style,
}: MoneyProps) {
  const usdFmt = formatUSD(usd, decimals);
  const ngnFmt = formatNGN(usd, rate);
  return (
    <span className={`money money-${size}${inline ? "" : " money-stack"} ${className}`} style={style}>
      <span className="money-ngn">₦{ngnFmt}</span>
      {!hideUsd && <span className="money-usd">≈&nbsp;${usdFmt}</span>}
    </span>
  );
}
