"use client";

interface TokenIconProps {
  symbol: string;
  size?: number;
}

function USDCIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <path d="M20.5 18.5c0-2.1-1.3-2.8-3.8-3.1-1.8-.3-2.2-.7-2.2-1.5s.7-1.3 1.8-1.3c1 0 1.6.4 1.9 1.2.1.1.2.2.3.2h.7c.2 0 .3-.1.3-.3v-.1c-.3-1.1-1.2-2-2.3-2.2v-1.3c0-.2-.1-.3-.3-.3h-.7c-.2 0-.3.1-.3.3v1.3c-1.6.2-2.6 1.3-2.6 2.6 0 2 1.2 2.7 3.7 3 1.7.3 2.3.6 2.3 1.6 0 1-.9 1.7-2 1.7-1.5 0-2-.6-2.2-1.5 0-.1-.2-.2-.3-.2h-.8c-.2 0-.3.1-.3.3 .3 1.3 1.1 2.2 2.7 2.5v1.3c0 .2.1.3.3.3h.7c.2 0 .3-.1.3-.3v-1.3c1.7-.2 2.8-1.4 2.8-2.8z" fill="white"/>
      <path d="M13.3 24.3c-4.4-1.5-6.7-6.4-5.1-10.8 .8-2.2 2.6-4 4.8-4.8.2-.1.3-.2.3-.4v-.6c0-.2-.1-.3-.3-.3-.1 0-.1 0-.2 0C7.9 9 5 14.3 6.6 19.2c1 2.8 3.2 5 6 6 .2.1.4 0 .4-.2v-.6c.1-.2 0-.4-.2-.4l-.5.3zM18.9 7.4c-.2-.1-.4 0-.4.2v.6c0 .2.1.4.3.4 4.4 1.5 6.7 6.4 5.1 10.8-.8 2.2-2.6 4-4.8 4.8-.2.1-.3.2-.3.4v.6c0 .2.1.3.3.3.1 0 .1 0 .2 0 4.9-1.6 7.6-6.9 6-11.8-1-2.8-3.2-5-6-6l-.4.7z" fill="white"/>
    </svg>
  );
}

function ETHIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path d="M16.5 4v8.87l7.5 3.35L16.5 4z" fill="white" fillOpacity="0.6"/>
      <path d="M16.5 4L9 16.22l7.5-3.35V4z" fill="white"/>
      <path d="M16.5 21.97v6.03L24 17.62l-7.5 4.35z" fill="white" fillOpacity="0.6"/>
      <path d="M16.5 28v-6.03L9 17.62 16.5 28z" fill="white"/>
      <path d="M16.5 20.57l7.5-4.35-7.5-3.35v7.7z" fill="white" fillOpacity="0.2"/>
      <path d="M9 16.22l7.5 4.35v-7.7L9 16.22z" fill="white" fillOpacity="0.6"/>
    </svg>
  );
}

function DAIIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F5AC37" />
      <path d="M16.4 6.8h-5.6v5.4H8.2v2.2h2.4v1.2H8.2v2.2h2.6v5.4h5.6c5.2 0 8.4-3.2 8.4-8.2s-3.2-8.2-8.4-8.2zm-.2 14.2h-3.1v-3.2h3.1c2.6 0 4.2-1.2 4.8-3h-7.9v-2.2h7.9c-.6-1.8-2.2-3-4.8-3h-3.1V6.8h0v2.8h3.1c3.8 0 6.5 2.6 6.5 6s-2.7 6.2-6.5 6.2z" fill="white"/>
    </svg>
  );
}

function WETHIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#EC4899" />
      <path d="M16.5 4v8.87l7.5 3.35L16.5 4z" fill="white" fillOpacity="0.6"/>
      <path d="M16.5 4L9 16.22l7.5-3.35V4z" fill="white"/>
      <path d="M16.5 21.97v6.03L24 17.62l-7.5 4.35z" fill="white" fillOpacity="0.6"/>
      <path d="M16.5 28v-6.03L9 17.62 16.5 28z" fill="white"/>
      <path d="M16.5 20.57l7.5-4.35-7.5-3.35v7.7z" fill="white" fillOpacity="0.2"/>
      <path d="M9 16.22l7.5 4.35v-7.7L9 16.22z" fill="white" fillOpacity="0.6"/>
    </svg>
  );
}

function ArbitrumIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#28A0F0" />
      <path d="M17.8 10.3l-5 8.6 2 1.1 5-8.6-2-1.1zm3.6 6.2l-2.2 3.8 2 1.1 2.2-3.8-2-1.1z" fill="white"/>
      <path d="M10.6 20l2 1.2 2.2-3.8-2-1.2L10.6 20z" fill="white"/>
    </svg>
  );
}

function OptimismIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#FF0420" />
      <path d="M12.2 20.2c-2.4 0-4-1.7-4-4.2s1.6-4.2 4-4.2c2.4 0 4 1.7 4 4.2s-1.6 4.2-4 4.2zm0-6.4c-1.2 0-1.9 1-1.9 2.2s.7 2.2 1.9 2.2 1.9-1 1.9-2.2-.7-2.2-1.9-2.2zM20.4 11.8c1.6 0 2.8 1 2.8 2.7 0 1.7-1.2 2.7-2.8 2.7h-1.2v3h-2v-8.4h3.2zm-.2 3.6c.6 0 1-.4 1-1s-.4-.9-1-.9h-1v1.9h1z" fill="white"/>
    </svg>
  );
}

function BaseIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#0052FF" />
      <path d="M16 26c5.5 0 10-4.5 10-10S21.5 6 16 6C10.8 6 6.5 10 6 15.1h13.2v1.8H6C6.5 22 10.8 26 16 26z" fill="white"/>
    </svg>
  );
}

const ICON_MAP: Record<string, React.FC<{ size: number }>> = {
  USDC: USDCIcon,
  ETH: ETHIcon,
  DAI: DAIIcon,
  WETH: WETHIcon,
  ARBITRUM: ArbitrumIcon,
  OPTIMISM: OptimismIcon,
  BASE: BaseIcon,
};

export function TokenIcon({ symbol, size = 18 }: TokenIconProps) {
  const SvgIcon = ICON_MAP[symbol];
  if (SvgIcon) {
    return <SvgIcon size={size} />;
  }
  const letter = symbol[0];
  return (
    <span
      className="token-icon"
      style={{ background: "#888", width: size, height: size, fontSize: Math.max(8, size * 0.5) }}
    >
      {letter}
    </span>
  );
}
