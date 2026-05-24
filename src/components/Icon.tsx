"use client";

interface IconProps {
  name: string;
  size?: number;
  fill?: number;
  weight?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function Icon({ name, size, fill = 0, weight, style, className }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className || ""}`}
      style={{
        fontSize: size != null ? size : "inherit",
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight || 400}, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
