"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../lib/gsap-config";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./Icon";

/* ── Nav links ─────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Campaigns", href: "/", icon: "campaign" },
  { label: "Donate", href: "/donate", icon: "volunteer_activism" },
  { label: "Transparency", href: "/dashboard", icon: "monitoring" },
  { label: "Impact", href: "/stake", icon: "trending_up" },
] as const;

const DRAWER_LINKS = [
  ...NAV_LINKS,
  { label: "Privacy", href: "/privacy", icon: "shield" },
] as const;

/* ── Hamburger line variants (Framer Motion) ───────────────────────────────── */
const line1 = {
  closed: { rotate: 0, y: 0 },
  open: { rotate: 45, y: 6 },
};
const line2 = {
  closed: { opacity: 1 },
  open: { opacity: 0 },
};
const line3 = {
  closed: { rotate: 0, y: 0 },
  open: { rotate: -45, y: -6 },
};

export function TopNavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Entrance animation
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

  // Desktop link hover underline (GSAP)
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const after = el.querySelector(".topnav-link") || el;
    gsap.to(after, {
      "--underline-scale": 1,
      duration: 0.3,
      ease: "power2.out",
      overwrite: true,
    });
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const after = el.querySelector(".topnav-link") || el;
    gsap.to(after, {
      "--underline-scale": 0,
      duration: 0.3,
      ease: "power2.in",
      overwrite: true,
    });
  }, []);

  return (
    <>
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className={`topnav${scrolled ? " scrolled" : ""}`}
      >
        <div className="topnav-inner">
          {/* Brand */}
          <Link href="/" className="topnav-brand">
            <Image
              src="/images/logo/Fundbrave_icon-gradient.png"
              alt="FundBrave"
              width={36}
              height={36}
            />
            <span>FundBrave</span>
          </Link>

          {/* Desktop nav links */}
          <div className="topnav-links">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`topnav-link${isActive ? " active" : ""}`}
                  onMouseEnter={isActive ? undefined : handleMouseEnter}
                  onMouseLeave={isActive ? undefined : handleMouseLeave}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: wallet + hamburger */}
          <div className="topnav-end">
            {/* Wallet (desktop only) */}
            {mounted && (
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  mounted: rbMounted,
                }) => {
                  const connected = rbMounted && account && chain;
                  return (
                    <div
                      className="topnav-wallet-desktop"
                      aria-hidden={!rbMounted}
                      style={
                        !rbMounted
                          ? { opacity: 0, pointerEvents: "none", userSelect: "none" }
                          : undefined
                      }
                    >
                      {!connected ? (
                        <button onClick={openConnectModal} type="button" className="btn btn-primary">
                          <Icon name="account_balance_wallet" size={18} />
                          Connect Wallet
                        </button>
                      ) : chain.unsupported ? (
                        <button onClick={openChainModal} type="button" className="btn btn-primary" style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}>
                          <Icon name="warning" size={18} />
                          Wrong Network
                        </button>
                      ) : (
                        <button onClick={openAccountModal} type="button" className="btn btn-secondary">
                          <Icon name="account_circle" size={18} />
                          {account.displayName}
                        </button>
                      )}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            )}

            {/* Hamburger (mobile only) */}
            <button
              className="topnav-hamburger"
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <motion.svg
                width="20"
                height="14"
                viewBox="0 0 20 14"
                initial={false}
                animate={drawerOpen ? "open" : "closed"}
              >
                <motion.line
                  x1="0" y1="1" x2="20" y2="1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  variants={line1}
                  transition={{ duration: 0.25 }}
                />
                <motion.line
                  x1="0" y1="7" x2="20" y2="7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  variants={line2}
                  transition={{ duration: 0.15 }}
                />
                <motion.line
                  x1="0" y1="13" x2="20" y2="13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  variants={line3}
                  transition={{ duration: 0.25 }}
                />
              </motion.svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Panel */}
            <motion.aside
              className="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
            >
              <div className="drawer-header">
                <span className="drawer-title">Navigate</span>
              </div>

              <div className="drawer-links">
                {DRAWER_LINKS.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        className={`drawer-link${isActive ? " active" : ""}`}
                        onClick={() => setDrawerOpen(false)}
                      >
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

              {/* Wallet button in drawer */}
              {mounted && (
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openConnectModal,
                    mounted: rbMounted,
                  }) => {
                    const connected = rbMounted && account && chain;
                    return (
                      <div
                        aria-hidden={!rbMounted}
                        style={
                          !rbMounted
                            ? { opacity: 0, pointerEvents: "none", userSelect: "none" }
                            : undefined
                        }
                      >
                        {!connected ? (
                          <button
                            onClick={openConnectModal}
                            type="button"
                            className="drawer-wallet-btn"
                          >
                            <Icon name="account_balance_wallet" size={20} />
                            Connect Wallet
                          </button>
                        ) : (
                          <button
                            onClick={openAccountModal}
                            type="button"
                            className="drawer-wallet-btn"
                          >
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
