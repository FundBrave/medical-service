"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import { Icon } from "./Icon";
import { FundBraveLogo } from "./Logos";

const NAV_LINKS = [
  { label: "Campaigns", view: "home", icon: "home" },
  { label: "Donate", view: "donate", icon: "volunteer_activism" },
  { label: "Transparency", view: "transparency", icon: "verified_user" },
  { label: "Stake", view: "impact", icon: "savings" },
  { label: "Privacy", view: "privacy", icon: "shield" },
];

interface TopNavBarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="hamburger-svg">
      <motion.line
        x1="3" x2="19" y1="6" y2="6"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        animate={open ? { y1: 11, y2: 11, rotate: 45 } : { y1: 6, y2: 6, rotate: 0 }}
        style={{ transformOrigin: "center" }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      />
      <motion.line
        x1="3" x2="19" y1="11" y2="11"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        animate={open ? { opacity: 0, x1: 11, x2: 11 } : { opacity: 1, x1: 3, x2: 19 }}
        transition={{ duration: 0.2 }}
      />
      <motion.line
        x1="3" x2="19" y1="16" y2="16"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        animate={open ? { y1: 11, y2: 11, rotate: -45 } : { y1: 16, y2: 16, rotate: 0 }}
        style={{ transformOrigin: "center" }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </svg>
  );
}

export function TopNavBar({ activeView, onNavigate }: TopNavBarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleNav = useCallback((view: string) => {
    setDrawerOpen(false);
    onNavigate(view);
  }, [onNavigate]);

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
    <>
      <nav className={`topnav${scrolled || drawerOpen ? " scrolled" : ""}`} ref={navRef}>
        <div className="topnav-inner">
          <a className="topnav-brand" onClick={() => handleNav("home")} style={{ cursor: "pointer" }}>
            <FundBraveLogo size={36} />
            <span>FundBrave</span>
          </a>
          <div className="topnav-links">
            {NAV_LINKS.filter(l => l.view !== "privacy").map((link) => (
              <a
                key={link.view + link.label}
                className={`topnav-link${activeView === link.view ? " active" : ""}`}
                onClick={() => handleNav(link.view)}
                style={{ cursor: "pointer" }}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="topnav-end">
            <button className="btn btn-primary-flat topnav-wallet-desktop">
              <Icon name="account_balance_wallet" size={16} />
              <span style={{ marginLeft: 4 }}>Connect Wallet</span>
            </button>
            <button
              className="topnav-hamburger"
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
            >
              <HamburgerIcon open={drawerOpen} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="drawer-header">
                <span className="drawer-title">Menu</span>
              </div>

              <div className="drawer-links">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.view}
                    className={`drawer-link${activeView === link.view ? " active" : ""}`}
                    onClick={() => handleNav(link.view)}
                  >
                    <div className={`drawer-link-icon${activeView === link.view ? " active" : ""}`}>
                      <Icon name={link.icon} size={20} fill={activeView === link.view ? 1 : 0} />
                    </div>
                    <span>{link.label}</span>
                    {activeView === link.view && <div className="drawer-active-dot" />}
                  </button>
                ))}
              </div>

              <div className="drawer-divider" />

              <button className="drawer-wallet-btn" onClick={() => setDrawerOpen(false)}>
                <Icon name="account_balance_wallet" size={20} />
                <span>Connect Wallet</span>
              </button>

              <div className="drawer-footer">
                <p>Powered by Base · Secured by multisig</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
