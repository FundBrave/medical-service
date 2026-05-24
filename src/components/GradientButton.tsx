"use client";

interface GradientButtonProps {
  variant?: "primary" | "outline";
  size?: "default" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function GradientButton({
  variant = "primary",
  size = "default",
  children,
  onClick,
  disabled,
  className = "",
  style,
}: GradientButtonProps) {
  const base = "btn " + (variant === "outline" ? "btn-outline" : "btn-grad") + (size === "lg" ? " lg" : "");
  return (
    <button className={`${base} ${className}`} onClick={disabled ? undefined : onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
}
