"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "./Icon";

const FOOTER_LINKS = [
  { label: "Donate", href: "/donate" },
  { label: "Transparency", href: "/dashboard" },
  { label: "Stake", href: "/stake" },
  { label: "Privacy", href: "/privacy" },
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* ── Top row: brands + links ──────────────────────────────────────── */}
        <div className="footer-top">
          <div className="footer-brand-row">
            <a
              href="https://www.fundbrave.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/logo/Fundbrave_icon-gradient.png"
                alt="FundBrave"
                width={40}
                height={40}
              />
              <span>FundBrave</span>
            </a>

            <span className="footer-brand-divider" />

            <a
              href="https://logos.co/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/logo/logos-logo.png"
                alt="Logos"
                width={32}
                height={32}
                style={{ borderRadius: "50%", opacity: 0.8 }}
              />
              <span style={{ fontSize: 20, fontWeight: 700, opacity: 0.6 }}>
                Logos
              </span>
            </a>
          </div>

          <div className="footer-links">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.label} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Bottom row: copyright + icons ────────────────────────────────── */}
        <div className="footer-bottom">
          <div className="footer-bottom-text">
            <p>Powered by FundBrave &times; Logos</p>
            <p>&copy; {new Date().getFullYear()} Built for the Ethereal Vault Ecosystem</p>
          </div>

          <div className="footer-icons">
            <span>
              <Icon name="language" size={24} />
            </span>
            <span>
              <Icon name="hub" size={24} />
            </span>
            <span>
              <Icon name="public" size={24} />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
