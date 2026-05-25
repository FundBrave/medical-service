"use client";

import { Icon } from "./Icon";
import { FundBraveLogo, LogosLogo } from "./Logos";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const FOOTER_LINKS = [
  { label: "Donate", view: "donate" },
  { label: "Transparency", view: "transparency" },
  { label: "Stake", view: "impact" },
  { label: "Privacy", view: "privacy" },
];

interface FooterProps {
  onNavigate?: (view: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const ref = useScrollReveal<HTMLElement>({ y: 20, duration: 0.5 });

  const handleClick = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  return (
    <footer ref={ref} className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand-row">
            <a onClick={() => handleClick("home")} style={{ cursor: "pointer" }}>
              <FundBraveLogo size={40} />
              <span>FundBrave</span>
            </a>
            <span className="footer-brand-divider" />
            <a>
              <LogosLogo size={32} />
              <span style={{ color: "var(--on-surface-variant)", opacity: 0.6, fontSize: 20, fontWeight: 700 }}>
                Logos
              </span>
            </a>
          </div>
          <div className="footer-links">
            {FOOTER_LINKS.map((link) => (
              <a key={link.view} onClick={() => handleClick(link.view)} style={{ cursor: "pointer" }}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-bottom-text">
            <p>Powered by FundBrave × Logos</p>
            <p>© {new Date().getFullYear()} Built for the Ethereal Vault Ecosystem</p>
          </div>
          <div className="footer-icons">
            <span><Icon name="language" /></span>
            <span><Icon name="hub" /></span>
            <span><Icon name="public" /></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
