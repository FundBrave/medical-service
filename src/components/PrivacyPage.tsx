"use client";

import { Icon } from "./Icon";
import { TopNavBar } from "./TopNavBar";
import { Footer } from "./Footer";

const SECTIONS = [
  {
    number: "1",
    title: "Information We Collect",
    content: (
      <>
        <p>FundBrave does not intentionally collect personal data from individuals participating in this fundraising campaign. However, limited information may be processed when:</p>
        <ul>
          <li>Donations are made through third-party payment providers</li>
          <li>Individuals voluntarily contact us via email or messaging platforms</li>
          <li>Basic technical information (such as IP address or browser type) is automatically generated</li>
        </ul>
      </>
    ),
  },
  {
    number: "2",
    title: "How We Use Information",
    content: (
      <>
        <p>Any information received is used strictly for:</p>
        <ul>
          <li>Processing and confirming donations</li>
          <li>Responding to inquiries or support requests</li>
          <li>Maintaining the security and integrity of our fundraising activities</li>
        </ul>
        <p>We do not sell, rent, or share personal information with third parties for marketing purposes.</p>
      </>
    ),
  },
  {
    number: "3",
    title: "Third-Party Services",
    content: <p>Donations may be processed through trusted third-party payment platforms. These providers may collect and process personal information in accordance with their own privacy policies. FundBrave does not control how these third parties handle data.</p>,
  },
  {
    number: "4",
    title: "Data Security",
    content: <p>We take reasonable steps to protect any information associated with our fundraising activities from unauthorized access, misuse, or disclosure.</p>,
  },
  {
    number: "5",
    title: "Data Retention",
    content: <p>We retain information only for as long as necessary to fulfill the purpose for which it was received, comply with legal obligations, or resolve disputes.</p>,
  },
  {
    number: "6",
    title: "Your Rights",
    content: <p>Individuals who have shared information with FundBrave may request access to, correction of, or deletion of their information by contacting us using the details below.</p>,
  },
  {
    number: "7",
    title: "Contact Information",
    content: (
      <>
        <p>If you have any questions about this Privacy Notice or our fundraising campaign, please contact:</p>
        <div className="privacy-contact">
          <span className="privacy-contact-label">Email</span>
          <a href="mailto:officialfundbrave@gmail.com" className="privacy-contact-value">officialfundbrave@gmail.com</a>
          <span className="privacy-contact-label" style={{ marginTop: 8 }}>Organisation</span>
          <span className="privacy-contact-value">FundBrave</span>
        </div>
        <p className="privacy-update-note">We may update this Privacy Notice from time to time. Any changes will be communicated through our official channels.</p>
      </>
    ),
  },
];

interface PrivacyPageProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function PrivacyPage({ activeView, onNavigate }: PrivacyPageProps) {
  return (
    <>
      <TopNavBar activeView={activeView} onNavigate={onNavigate} />
      <main className="privacy-main">
        <div className="privacy-wrap">
          <div className="privacy-header">
            <div className="privacy-header-icon">
              <Icon name="shield" size={20} />
            </div>
            <span className="privacy-header-label">Legal</span>
            <h1 className="privacy-title">Privacy Notice</h1>
            <p className="privacy-intro">
              FundBrave is committed to protecting the privacy of individuals who support our fundraising activities. This Notice explains how we handle information in connection with our campaigns.
            </p>
            <div className="privacy-updated">
              <Icon name="update" size={16} /> Last updated May 2026
            </div>
          </div>

          <div className="privacy-chain-notice">
            <Icon name="info" size={20} />
            <div>
              <p className="privacy-chain-title">On-chain transparency</p>
              <p className="privacy-chain-text">
                This campaign runs on the Base blockchain. Donation amounts, wallet addresses, and timestamps are permanently public on-chain. This is a feature of blockchain fundraising — donors can independently verify every transaction — but it means wallet addresses cannot be made private after a donation is confirmed.
              </p>
            </div>
          </div>

          <div className="privacy-sections">
            {SECTIONS.map((section) => (
              <div key={section.number} className="privacy-section-card">
                <div className="privacy-section-head">
                  <span className="privacy-section-num">{section.number}</span>
                  <h2 className="privacy-section-title">{section.title}</h2>
                </div>
                <div className="privacy-section-body">{section.content}</div>
              </div>
            ))}
          </div>

          <div className="privacy-footer-note">
            <p>By using this site you agree to this Privacy Notice and the responsible use of information related to your visit.</p>
            <button onClick={() => onNavigate("home")} className="privacy-back-link">
              <Icon name="arrow_back" size={16} /> Back to campaign
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
