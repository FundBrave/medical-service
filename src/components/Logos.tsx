"use client";

import Image from "next/image";

export function FundBraveLogo({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/images/logo/Fundbrave_icon-gradient.png"
      alt="FundBrave"
      width={size}
      height={size}
      style={{ borderRadius: 8, display: "block" }}
    />
  );
}

export function LogosLogo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/images/logo/logos-logo.png"
      alt="Logos"
      width={size}
      height={size}
      style={{ borderRadius: "50%", opacity: 0.8, display: "block" }}
    />
  );
}
