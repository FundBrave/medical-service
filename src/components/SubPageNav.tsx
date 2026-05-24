"use client";

import { Icon } from "./Icon";
import { FundBraveLogo } from "./Logos";

interface SubPageNavProps {
  onBack: () => void;
}

export function SubPageNav({ onBack }: SubPageNavProps) {
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
        <div style={{ width: 140 }} />
      </div>
    </nav>
  );
}
