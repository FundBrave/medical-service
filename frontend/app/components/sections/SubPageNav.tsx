"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./Icon";

const DRAWER_LINKS = [
  { label: "Donate", href: "/donate", icon: "volunteer_activism" },
  { label: "Transparency", href: "/dashboard", icon: "monitoring" },
  { label: "Impact", href: "/stake", icon: "trending_up" },
  { label: "Privacy", href: "/privacy", icon: "shield" },
] as const;

const line1 = { closed: { rotate: 0, y: 0 }, open: { rotate: 45, y: 6 } };
const line2 = { closed: { opacity: 1 }, open: { opacity: 0 } };
const line3 = { closed: { rotate: 0, y: 0 }, open: { rotate: -45, y: -6 } };

interface SubPageNavProps {
  backHref?: string;
  title?: string;
  navLinks?: { label: string; href: string }[];
}

export function SubPageNav({ backHref = "/" }: SubPageNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  return (
    <>
      <nav className={`topnav${scrolled ? " scrolled" : ""}`}>
        <div className="topnav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href={backHref} className="topnav-back-btn">
              <Icon name="arrow_back" size={20} />
            </Link>
            <Link href="/" className="topnav-brand">
              <Image src="/images/logo/Fundbrave_icon-gradient.png" alt="FundBrave" width={30} height={30} />
              <span style={{ fontSize: 18 }}>FundBrave</span>
            </Link>
          </div>

          <div className="topnav-end">
            {mounted && (
              <ConnectButton.Custom>
                {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted: rbMounted }) => {
                  const connected = rbMounted && account && chain;
                  return (
                    <div className="topnav-wallet-desktop" aria-hidden={!rbMounted} style={!rbMounted ? { opacity: 0, pointerEvents: "none", userSelect: "none" } : undefined}>
                      {!connected ? (
                        <button onClick={openConnectModal} type="button" className="btn btn-primary-flat">
                          <Icon name="account_balance_wallet" size={16} />
                          Connect
                        </button>
                      ) : chain.unsupported ? (
                        <button onClick={openChainModal} type="button" className="btn btn-primary-flat" style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}>
                          Wrong Network
                        </button>
                      ) : (
                        <button onClick={openAccountModal} type="button" className="btn btn-primary-flat">
                          <Icon name="account_circle" size={16} />
                          {account.displayName}
                        </button>
                      )}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            )}

            <button className="topnav-hamburger" onClick={() => setDrawerOpen((v) => !v)} aria-label="Toggle menu">
              <motion.svg width="20" height="14" viewBox="0 0 20 14" initial={false} animate={drawerOpen ? "open" : "closed"}>
                <motion.line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" variants={line1} transition={{ duration: 0.25 }} />
                <motion.line x1="0" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" variants={line2} transition={{ duration: 0.15 }} />
                <motion.line x1="0" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" variants={line3} transition={{ duration: 0.25 }} />
              </motion.svg>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setDrawerOpen(false)} />
            <motion.aside className="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 300 }}>
              <div className="drawer-header">
                <span className="drawer-title">Navigate</span>
              </div>
              <div className="drawer-links">
                {DRAWER_LINKS.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div key={link.href} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 + i * 0.05, duration: 0.2 }}>
                      <Link href={link.href} className={`drawer-link${isActive ? " active" : ""}`} onClick={() => setDrawerOpen(false)}>
                        <span className={`drawer-link-icon${isActive ? " active" : ""}`}>
                          <Icon name={link.icon} size={20} />
                        </span>
                        {link.label}
                        {isActive && <span className="drawer-active-dot" />}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              <div className="drawer-divider" />
              {mounted && (
                <ConnectButton.Custom>
                  {({ account, chain, openAccountModal, openConnectModal, mounted: rbMounted }) => {
                    const connected = rbMounted && account && chain;
                    return (
                      <div aria-hidden={!rbMounted} style={!rbMounted ? { opacity: 0, pointerEvents: "none", userSelect: "none" } : undefined}>
                        {!connected ? (
                          <button onClick={openConnectModal} type="button" className="drawer-wallet-btn">
                            <Icon name="account_balance_wallet" size={20} />
                            Connect Wallet
                          </button>
                        ) : (
                          <button onClick={openAccountModal} type="button" className="drawer-wallet-btn">
                            <Icon name="account_circle" size={20} />
                            {account.displayName}
                          </button>
                        )}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              )}
              <div className="drawer-footer">
                <p>&copy; {new Date().getFullYear()} FundBrave</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
