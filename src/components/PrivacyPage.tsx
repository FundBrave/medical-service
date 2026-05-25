"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import { TopNavBar } from "./TopNavBar";
import { Footer } from "./Footer";

const SECTIONS = [
  {
    number: "1",
    title: "Information We Collect",
    content: (
      <>
        <p>We keep data collection minimal. FundBrave may process the following information in connection with this campaign:</p>
        <ul>
          <li>Wallet addresses and transaction data when you donate via USDC, ETH, or DAI on Base</li>
          <li>Bank transfer details (name, account number) when you donate in Naira through OPay</li>
          <li>Email address or contact details if you reach out to us directly</li>
          <li>Technical data your browser sends automatically: IP address, device type, browser version, collected via standard server logs</li>
          <li>Staking activity if you deposit USDC into the Aave V3 yield pool through our platform</li>
        </ul>
        <p>We do not require account creation. We do not use tracking cookies for advertising. If you donate anonymously via crypto, the only record is on-chain.</p>
      </>
    ),
  },
  {
    number: "2",
    title: "How We Use Information",
    content: (
      <>
        <p>Information collected is used for the following purposes and nothing else:</p>
        <ul>
          <li>Processing and confirming your donation, whether via OPay bank transfer or on-chain crypto payment</li>
          <li>Issuing donation receipts and transaction confirmations</li>
          <li>Operating the multisig treasury (3-of-5 signers) that governs fund disbursements to the family</li>
          <li>Responding to your questions, support requests, or transparency inquiries</li>
          <li>Maintaining the security and integrity of campaign smart contracts on Base</li>
        </ul>
        <p>We do not sell, rent, or share your personal information with third parties for marketing. Ever. Your data supports one thing: getting funds to this family transparently.</p>
      </>
    ),
  },
  {
    number: "3",
    title: "Third-Party Services",
    content: (
      <>
        <p>This campaign relies on trusted third-party infrastructure. Each service operates under its own privacy policy:</p>
        <ul>
          <li><strong>OPay</strong> processes Naira bank transfers for Nigerian donors</li>
          <li><strong>Base (Coinbase L2)</strong> is the blockchain network where all crypto donations are recorded</li>
          <li><strong>Aave V3</strong> is the DeFi protocol used for yield-based staking</li>
          <li><strong>RainbowKit / WalletConnect</strong> facilitate wallet connections for crypto transactions</li>
          <li><strong>Gnosis Safe</strong> secures the campaign treasury via multisig infrastructure</li>
        </ul>
        <p>FundBrave does not control how these services handle your data once it leaves our platform. We encourage you to review their policies directly.</p>
      </>
    ),
  },
  {
    number: "4",
    title: "Data Security",
    content: (
      <>
        <p>We take the security of your information as seriously as the security of campaign funds:</p>
        <ul>
          <li>Crypto donations are secured by Base and Ethereum{"'"}s underlying consensus</li>
          <li>Treasury funds are held in a Gnosis Safe multisig wallet requiring 3-of-5 signer approval</li>
          <li>All smart contracts are deployed on Base with verified source code</li>
          <li>Off-chain data is stored with encryption at rest and transmitted over HTTPS</li>
          <li>OPay transfer data is handled through OPay{"'"}s PCI-compliant infrastructure</li>
        </ul>
        <p>No system is perfectly secure. We implement reasonable, industry-standard protections proportional to the sensitivity of the data we handle.</p>
      </>
    ),
  },
  {
    number: "5",
    title: "Data Retention",
    content: (
      <>
        <p>We retain information only as long as it serves a clear purpose:</p>
        <ul>
          <li><strong>On-chain data</strong> is permanent. Wallet addresses, transaction hashes, and amounts are inherent to blockchain technology. This is what makes the campaign fully verifiable.</li>
          <li><strong>OPay transfer records</strong> are retained for the duration required by Nigerian financial regulations, then deleted.</li>
          <li><strong>Contact information</strong> is kept only while needed to resolve your inquiry or for the active life of the campaign, whichever is shorter.</li>
          <li><strong>Server logs</strong> are automatically purged after 90 days.</li>
        </ul>
      </>
    ),
  },
  {
    number: "6",
    title: "Your Rights",
    content: (
      <>
        <p>In alignment with the Nigeria Data Protection Regulation (NDPR) and global data protection principles, you have the right to:</p>
        <ul>
          <li><strong>Access</strong> a copy of any personal data we hold about you off-chain</li>
          <li><strong>Correct</strong> inaccurate off-chain information</li>
          <li><strong>Delete</strong> your off-chain personal data, subject to legal retention requirements</li>
          <li><strong>Object</strong> to specific uses of your data where no overriding legal basis exists</li>
        </ul>
        <p>On-chain data (wallet addresses, transaction hashes, amounts) is immutable by design and cannot be modified or erased by anyone. This is the transparency guarantee that allows every donor to independently verify fund flows.</p>
        <p>To exercise any of these rights, contact us at the address below. We respond within 14 business days.</p>
      </>
    ),
  },
  {
    number: "7",
    title: "Contact",
    content: (
      <>
        <p>Questions about this Privacy Notice, the campaign, or how your data is handled:</p>
        <div className="prv-contact-card">
          <a href="mailto:officialfundbrave@gmail.com" className="prv-contact-link">officialfundbrave@gmail.com</a>
          <span className="prv-contact-org">FundBrave Organisation</span>
        </div>
        <p>We aim to respond to all privacy-related inquiries within 14 business days.</p>
      </>
    ),
  },
];

interface PrivacyPageProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function PrivacyPage({ activeView, onNavigate }: PrivacyPageProps) {
  const mainRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!mainRef.current) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: mainRef.current, start: "top 90%", toggleActions: "play none none none" },
        defaults: { ease: "power4.out" },
      });
      tl.fromTo(".prv-hero-label", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 0.1);
      tl.fromTo(".prv-hero-title", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.2);
      tl.fromTo(".prv-hero-intro", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 0.35);
      tl.fromTo(".prv-hero-meta", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.5);
      tl.fromTo(".prv-chain-banner", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 0.6);
      tl.fromTo(".prv-section", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.06 }, 0.7);
    },
    { dependencies: [], scope: mainRef }
  );

  return (
    <>
      <TopNavBar activeView={activeView} onNavigate={onNavigate} />
      <main className="prv-main" ref={mainRef}>
        <div className="prv-wrap">
          <div className="prv-hero">
            <div>
              <span className="prv-hero-label">Privacy Notice</span>
              <h1 className="prv-hero-title">How we handle your information</h1>
              <p className="prv-hero-intro">
                FundBrave exists to make fundraising transparent, verifiable, and direct. That same standard applies to your data. This notice covers what we collect, why, and how it connects to the &ldquo;Save a Family Fighting Cancer&rdquo; campaign in Benin City, Nigeria.
              </p>
              <div className="prv-hero-meta">
                <span className="prv-meta-chip">Last updated May 2026</span>
                <span className="prv-meta-chip">NDPR aligned</span>
              </div>
            </div>
          </div>

          <div className="prv-content-area">
            <div className="prv-chain-banner">
              <p className="prv-chain-title">On-chain transparency</p>
              <p className="prv-chain-text">
                This campaign operates on the Base blockchain. Donation amounts, wallet addresses, and timestamps are recorded permanently on a public ledger. This is by design: it lets any donor independently verify where funds go. Once confirmed, on-chain data cannot be edited, hidden, or deleted.
              </p>
            </div>

            <div className="prv-sections">
              {SECTIONS.map((s) => (
                <article key={s.number} className="prv-section">
                  <h2 className="prv-section-title">
                    <span className="prv-section-num">{s.number}.</span>
                    {s.title}
                  </h2>
                  <div className="prv-section-body">{s.content}</div>
                </article>
              ))}
            </div>

            <div className="prv-footer-note">
              <p>By using this site you agree to this Privacy Notice and the responsible use of information related to your visit.</p>
              <button onClick={() => onNavigate("home")} className="prv-back-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back to campaign
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </>
  );
}
