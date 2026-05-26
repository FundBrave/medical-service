import Link from "next/link";
import { TopNavBar } from "../components/sections/TopNavBar";
import { Footer } from "../components/sections/Footer";

export const metadata = {
  title: "Privacy Notice — FundBrave",
  description: "How FundBrave handles information in connection with the medical support fundraising campaign.",
};

const sections = [
  {
    number: "1",
    title: "Information We Collect",
    content: (
      <>
        <p className="text-white/60 leading-relaxed mb-4">
          We keep data collection minimal. FundBrave may process the following information in connection with this campaign:
        </p>
        <ul className="space-y-2">
          {[
            "Wallet addresses and transaction data when you donate via USDC, ETH, or DAI on Base",
            "Bank transfer details (name, account number) when you donate in Naira through OPay",
            "Email address or contact details if you reach out to us directly",
            "Technical data your browser sends automatically: IP address, device type, browser version, collected via standard server logs",
            "Staking activity if you deposit USDC into the Aave V3 yield pool through our platform",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-white/60 text-sm leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-white/60 leading-relaxed mt-4">
          We do not require account creation. We do not use tracking cookies for advertising. If you donate anonymously via crypto, the only record is on-chain.
        </p>
      </>
    ),
  },
  {
    number: "2",
    title: "How We Use Information",
    content: (
      <>
        <p className="text-white/60 leading-relaxed mb-4">
          Information collected is used for the following purposes and nothing else:
        </p>
        <ul className="space-y-2 mb-4">
          {[
            "Processing and confirming your donation, whether via OPay bank transfer or on-chain crypto payment",
            "Issuing donation receipts and transaction confirmations",
            "Operating the multisig treasury (3-of-5 signers) that governs fund disbursements to the family",
            "Responding to your questions, support requests, or transparency inquiries",
            "Maintaining the security and integrity of campaign smart contracts on Base",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-white/60 text-sm leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-white/60 leading-relaxed">
          We do not sell, rent, or share your personal information with third parties for marketing. Ever. Your data supports one thing: getting funds to this family transparently.
        </p>
      </>
    ),
  },
  {
    number: "3",
    title: "Third-Party Services",
    content: (
      <>
        <p className="text-white/60 leading-relaxed mb-4">
          This campaign relies on trusted third-party infrastructure. Each service operates under its own privacy policy:
        </p>
        <ul className="space-y-2">
          {[
            { name: "OPay", desc: "processes Naira bank transfers for Nigerian donors" },
            { name: "Base (Coinbase L2)", desc: "is the blockchain network where all crypto donations are recorded" },
            { name: "Aave V3", desc: "is the DeFi protocol used for yield-based staking" },
            { name: "RainbowKit / WalletConnect", desc: "facilitate wallet connections for crypto transactions" },
            { name: "Gnosis Safe", desc: "secures the campaign treasury via multisig infrastructure" },
          ].map((item) => (
            <li key={item.name} className="flex gap-3 text-white/60 text-sm leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
              <span><strong className="text-white/80">{item.name}</strong> {item.desc}</span>
            </li>
          ))}
        </ul>
        <p className="text-white/60 leading-relaxed mt-4">
          FundBrave does not control how these services handle your data once it leaves our platform. We encourage you to review their policies directly.
        </p>
      </>
    ),
  },
  {
    number: "4",
    title: "Data Security",
    content: (
      <>
        <p className="text-white/60 leading-relaxed mb-4">
          We take the security of your information as seriously as the security of campaign funds:
        </p>
        <ul className="space-y-2">
          {[
            "Crypto donations are secured by Base and Ethereum's underlying consensus",
            "Treasury funds are held in a Gnosis Safe multisig wallet requiring 3-of-5 signer approval",
            "All smart contracts are deployed on Base with verified source code",
            "Off-chain data is stored with encryption at rest and transmitted over HTTPS",
            "OPay transfer data is handled through OPay's PCI-compliant infrastructure",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-white/60 text-sm leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-white/60 leading-relaxed mt-4">
          No system is perfectly secure. We implement reasonable, industry-standard protections proportional to the sensitivity of the data we handle.
        </p>
      </>
    ),
  },
  {
    number: "5",
    title: "Data Retention",
    content: (
      <>
        <p className="text-white/60 leading-relaxed mb-4">
          We retain information only as long as it serves a clear purpose:
        </p>
        <ul className="space-y-2">
          {[
            { name: "On-chain data", desc: "is permanent. Wallet addresses, transaction hashes, and amounts are inherent to blockchain technology. This is what makes the campaign fully verifiable." },
            { name: "OPay transfer records", desc: "are retained for the duration required by Nigerian financial regulations, then deleted." },
            { name: "Contact information", desc: "is kept only while needed to resolve your inquiry or for the active life of the campaign, whichever is shorter." },
            { name: "Server logs", desc: "are automatically purged after 90 days." },
          ].map((item) => (
            <li key={item.name} className="flex gap-3 text-white/60 text-sm leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
              <span><strong className="text-white/80">{item.name}</strong> {item.desc}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    number: "6",
    title: "Your Rights",
    content: (
      <>
        <p className="text-white/60 leading-relaxed mb-4">
          In alignment with the Nigeria Data Protection Regulation (NDPR) and global data protection principles, you have the right to:
        </p>
        <ul className="space-y-2 mb-4">
          {[
            { name: "Access", desc: "a copy of any personal data we hold about you off-chain" },
            { name: "Correct", desc: "inaccurate off-chain information" },
            { name: "Delete", desc: "your off-chain personal data, subject to legal retention requirements" },
            { name: "Object", desc: "to specific uses of your data where no overriding legal basis exists" },
          ].map((item) => (
            <li key={item.name} className="flex gap-3 text-white/60 text-sm leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
              <span><strong className="text-white/80">{item.name}</strong> {item.desc}</span>
            </li>
          ))}
        </ul>
        <p className="text-white/60 leading-relaxed mb-4">
          On-chain data (wallet addresses, transaction hashes, amounts) is immutable by design and cannot be modified or erased by anyone. This is the transparency guarantee that allows every donor to independently verify fund flows.
        </p>
        <p className="text-white/60 leading-relaxed">
          To exercise any of these rights, contact us at the address below. We respond within 14 business days.
        </p>
      </>
    ),
  },
  {
    number: "7",
    title: "Contact",
    content: (
      <>
        <p className="text-white/60 leading-relaxed mb-3">
          Questions about this Privacy Notice, the campaign, or how your data is handled:
        </p>
        <div className="glass rounded-xl p-4 inline-flex flex-col gap-1">
          <span className="text-white/40 text-xs uppercase tracking-widest">Email</span>
          <a
            href="mailto:officialfundbrave@gmail.com"
            className="text-[#2563EB] hover:text-blue-400 transition-colors font-medium"
          >
            officialfundbrave@gmail.com
          </a>
          <span className="text-white/40 text-xs uppercase tracking-widest mt-2">Organisation</span>
          <span className="text-white/80 font-medium">FundBrave Organisation</span>
        </div>
        <p className="text-white/40 text-sm mt-4 leading-relaxed">
          We aim to respond to all privacy-related inquiries within 14 business days.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <TopNavBar />
      <main className="min-h-screen bg-[#0A0E1A] pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">

          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#2563EB] text-xl">shield</span>
              </div>
              <span className="text-[#2563EB] text-sm font-semibold uppercase tracking-widest">
                Legal
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Privacy Notice
            </h1>
            <p className="text-white/50 text-lg leading-relaxed">
              FundBrave is committed to protecting the privacy of every donor. This notice explains how we handle information in connection with the medical support campaign running on the Base blockchain.
            </p>
            <div className="mt-6 flex items-center gap-2 text-white/30 text-sm">
              <span className="material-symbols-outlined text-base">update</span>
              Last updated May 2026
            </div>
          </div>

          {/* On-chain transparency notice */}
          <div className="glass rounded-2xl p-5 mb-12 border border-amber-500/20 bg-amber-500/5">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-amber-400 text-xl flex-shrink-0 mt-0.5">
                info
              </span>
              <div>
                <p className="text-amber-400 font-semibold text-sm mb-1">On-chain transparency</p>
                <p className="text-white/50 text-sm leading-relaxed">
                  This campaign runs on the Base blockchain. Donation amounts, wallet addresses, and timestamps are permanently public on-chain. This is a feature of blockchain fundraising: donors can independently verify every transaction. Wallet addresses cannot be made private after a donation is confirmed.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.number} className="glass rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] font-bold text-sm flex-shrink-0">
                    {section.number}
                  </span>
                  <h2 className="text-xl font-bold text-white pt-1">{section.title}</h2>
                </div>
                <div className="pl-12">{section.content}</div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-12 text-center">
            <p className="text-white/30 text-sm">
              By using this site you agree to this Privacy Notice and the responsible use of
              information related to your visit.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-6 text-[#2563EB] hover:text-blue-400 transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to campaign
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
