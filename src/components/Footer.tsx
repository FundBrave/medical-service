"use client";

import { Icon } from "./Icon";
import { FundBraveLogo, LogosLogo } from "./Logos";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand-row">
            <a>
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
            <a>Donate</a>
            <a>Transparency</a>
            <a>Stake</a>
            <a>Privacy</a>
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
