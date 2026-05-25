"use client";

function VisaIcon({ dim }: { dim?: boolean }) {
  return (
    <svg width="36" height="12" viewBox="0 0 36 12" fill="none" style={{ opacity: dim ? 0.3 : 1 }}>
      <path d="M14.7 0.6L12.3 11.4H9.8L12.2 0.6H14.7ZM24.8 7.5L26.1 3.9L26.9 7.5H24.8ZM27.6 11.4H30L27.9 0.6H25.8C25.3 0.6 24.8 0.9 24.6 1.4L20.8 11.4H23.3L23.8 9.9H26.9L27.6 11.4ZM21.3 7.7C21.3 4.8 17.2 4.6 17.2 3.3C17.2 2.9 17.6 2.5 18.5 2.4C18.9 2.3 20.1 2.3 21.4 2.9L21.9 0.9C21.2 0.6 20.3 0.4 19.2 0.4C16.8 0.4 15.1 1.7 15.1 3.5C15.1 4.9 16.3 5.6 17.3 6.1C18.2 6.5 18.5 6.8 18.5 7.2C18.5 7.8 17.8 8.1 17.2 8.1C15.8 8.1 14.9 7.7 14.2 7.4L13.7 9.5C14.4 9.8 15.7 10.1 17.1 10.1C19.7 10.1 21.3 8.8 21.3 7.7ZM10.3 0.6L6.5 11.4H3.9L2.1 2.5C2 2 1.8 1.8 1.4 1.5C0.7 1.1 0 0.9 0 0.9L0.1 0.6H4C4.5 0.6 5 1 5.1 1.5L6 6.7L8.4 0.6H10.3Z" fill="#1A1F71"/>
    </svg>
  );
}

function MastercardIcon({ dim }: { dim?: boolean }) {
  return (
    <svg width="26" height="16" viewBox="0 0 26 16" fill="none" style={{ opacity: dim ? 0.3 : 1 }}>
      <circle cx="9" cy="8" r="8" fill="#EB001B"/>
      <circle cx="17" cy="8" r="8" fill="#F79E1B"/>
      <path d="M13 2.4c1.8 1.3 3 3.4 3 5.6s-1.2 4.3-3 5.6c-1.8-1.3-3-3.4-3-5.6s1.2-4.3 3-5.6z" fill="#FF5F00"/>
    </svg>
  );
}

function AmexIcon({ dim }: { dim?: boolean }) {
  return (
    <svg width="32" height="12" viewBox="0 0 32 12" fill="none" style={{ opacity: dim ? 0.3 : 1 }}>
      <rect width="32" height="12" rx="2" fill="#2E77BB"/>
      <path d="M4 9L6.5 3H8.5L11 9H9L8.5 7.8H6.5L6 9H4ZM7 6.5H8L7.5 4.8L7 6.5ZM11.5 9V3H14L15.5 6.5L17 3H19.5V9H17.8V5L16.2 9H14.8L13.2 5V9H11.5ZM20.5 9V3H25.5V4.3H22.2V5.3H25.3V6.5H22.2V7.7H25.5V9H20.5ZM26 9L28 6L26 3H28L29 4.7L30 3H32L30 6L32 9H30L29 7.3L28 9H26Z" fill="white"/>
    </svg>
  );
}

export function CardBrandIcons({ activeBrand }: { activeBrand: string | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <VisaIcon dim={!!activeBrand && activeBrand !== "visa"} />
      <MastercardIcon dim={!!activeBrand && activeBrand !== "mc"} />
      <AmexIcon dim={!!activeBrand && activeBrand !== "amex"} />
    </div>
  );
}

export function CardBrandChip({ brand }: { brand: string | null }) {
  if (brand === "visa") return <VisaIcon />;
  if (brand === "mc") return <MastercardIcon />;
  if (brand === "amex") return <AmexIcon />;
  return <VisaIcon />;
}
