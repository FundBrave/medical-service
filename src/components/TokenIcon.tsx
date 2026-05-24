"use client";

import { TOKEN_COLORS } from "@/lib/constants";

interface TokenIconProps {
  symbol: string;
  size?: number;
}

export function TokenIcon({ symbol, size = 18 }: TokenIconProps) {
  const color = TOKEN_COLORS[symbol] || "#888";
  const letter = symbol === "POLYGON" ? "P" : symbol === "ARBITRUM" ? "A" : symbol === "OPTIMISM" ? "O" : symbol[0];
  return (
    <span
      className="token-icon"
      style={{ background: color, width: size, height: size, fontSize: Math.max(8, size * 0.5) }}
    >
      {letter}
    </span>
  );
}
