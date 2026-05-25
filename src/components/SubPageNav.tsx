"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Icon } from "./Icon";
import { FundBraveLogo } from "./Logos";

interface SubPageNavProps {
  onBack: () => void;
}

export function SubPageNav({ onBack }: SubPageNavProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav className="subnav">
      <div className="subnav-inner">
        <button className="subnav-back" onClick={onBack}>
          <Icon name="arrow_back" size={18} />
          <span>Back to campaign</span>
        </button>
        <span className="topnav-brand">
          <FundBraveLogo size={32} />
          <span style={{ fontSize: 18 }}>FundBrave</span>
        </span>
        <div style={{ minWidth: 140, display: "flex", justifyContent: "flex-end" }}>
          {mounted && (
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus="avatar"
            />
          )}
        </div>
      </div>
    </nav>
  );
}
