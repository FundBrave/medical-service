"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import { Icon } from "./Icon";
import { FundBraveLogo } from "./Logos";

const NAV_LINKS = [
  { label: "Campaigns", view: "home" },
  { label: "Donate", view: "donate" },
  { label: "Transparency", view: "transparency" },
  { label: "Support", view: "impact" },
];

interface TopNavBarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function TopNavBar({ activeView, onNavigate }: TopNavBarProps) {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(
    () => {
      if (!navRef.current) return;
      gsap.fromTo(
        navRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.1 }
      );
    },
    { dependencies: [], scope: navRef }
  );

  return (
    <nav className={`topnav${scrolled ? " scrolled" : ""}`} ref={navRef}>
      <div className="topnav-inner">
        <a className="topnav-brand" onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>
          <FundBraveLogo size={36} />
          <span>FundBrave</span>
        </a>
        <div className="topnav-links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.view + link.label}
              className={`topnav-link${activeView === link.view ? " active" : ""}`}
              onClick={() => onNavigate(link.view)}
              style={{ cursor: "pointer" }}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="topnav-end">
          <button className="btn btn-primary-flat">
            <Icon name="account_balance_wallet" size={16} />
            <span style={{ marginLeft: 4 }}>Connect Wallet</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
