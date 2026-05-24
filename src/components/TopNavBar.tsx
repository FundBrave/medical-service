"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
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
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`topnav${scrolled ? " scrolled" : ""}`}>
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
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="avatar"
          />
        </div>
      </div>
    </nav>
  );
}
