"use client";

interface AvatarDotProps {
  initials: string;
  hue?: number;
  size?: number;
}

export function AvatarDot({ initials, hue = 200, size = 40 }: AvatarDotProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--f-headline)",
        fontWeight: 700,
        fontSize: Math.round(size * 0.34),
        color: "rgba(255,255,255,.92)",
        background: `linear-gradient(135deg, oklch(0.45 0.12 ${hue}), oklch(0.32 0.08 ${(hue + 60) % 360}))`,
        border: "2px solid var(--surface-container-low)",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}
