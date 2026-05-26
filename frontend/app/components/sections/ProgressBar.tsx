"use client";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function ProgressBar({ value, max = 100, className = "", style }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`progress-bar-track ${className}`} style={style}>
      <div className="progress-bar-fill progress-gradient-bg" style={{ width: `${pct}%` }} />
    </div>
  );
}
