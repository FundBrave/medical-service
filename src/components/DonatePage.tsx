"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseUnits } from "viem";
import type { Address } from "viem";
import { Icon } from "./Icon";
import { Money } from "./Money";
import { ProgressBar } from "./ProgressBar";
import { TokenIcon } from "./TokenIcon";
import { CardBrandIcons, CardBrandChip } from "./CardBrandIcon";
import { SubPageNav } from "./SubPageNav";
import { Footer } from "./Footer";
import { CrossChainDonate } from "./CrossChainDonate";
import { formatNGN, formatUSD } from "@/lib/format";
import { SUPPORTED_TOKENS, PRESET_USD, PRESET_NGN, PRESET_ETH, MIN_DONATION_USD } from "@/lib/constants";
import { SUPPORTED_TOKENS as CONTRACT_TOKENS, isBaseChain, SOURCE_CHAINS } from "@/lib/contracts";
import { useDonate } from "@/hooks/useDonate";

function detectCardBrand(digits: string) {
  const d = digits.replace(/\s/g, "");
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mc";
  if (/^3[47]/.test(d)) return "amex";
  if (/^6(011|5)/.test(d)) return "disc";
  return null;
}

function formatCardNumber(val: string) {
  const d = val.replace(/\D/g, "").slice(0, 19);
  return d.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(val: string) {
  const d = val.replace(/\D/g, "").slice(0, 4);
  if (d.length < 3) return d;
  return d.slice(0, 2) + " / " + d.slice(2);
}

interface PayMethodTabsProps {
  method: string;
  onChange: (m: string) => void;
  methods: { id: string; icon: string; label: string; sub?: string }[];
}

function PayMethodTabs({ method, onChange, methods }: PayMethodTabsProps) {
  const activeIdx = methods.findIndex((m) => m.id === method);
  return (
    <div className="method-tabs" style={{ position: "relative" }}>
      <motion.div
        className="method-tab-indicator"
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          position: "absolute",
          top: 4, bottom: 4,
          left: `calc(${activeIdx} * (100% - 8px) / ${methods.length} + 4px)`,
          width: `calc((100% - 8px) / ${methods.length})`,
          borderRadius: 10,
          background: "var(--surface-container-high)",
          boxShadow: "0 1px 0 rgba(255,255,255,.06) inset",
          zIndex: 0,
        }}
      />
      {methods.map((m) => (
        <button
          key={m.id}
          className={`method-tab${method === m.id ? " active" : ""}`}
          onClick={() => onChange(m.id)}
          style={{ position: "relative", zIndex: 1, background: "transparent" }}
        >
          <Icon name={m.icon} />
          {m.label}
          {m.sub && <span className="method-tab-sub">{m.sub}</span>}
        </button>
      ))}
    </div>
  );
}

function WalletPayRow({ onPay }: { onPay: () => void }) {
  return (
    <div className="wallet-pay-row">
      <button className="wallet-pay-btn apple" onClick={onPay}>
        <svg width="16" height="20" viewBox="0 0 16 20" aria-hidden="true">
          <path fill="currentColor" d="M13.16 10.79c-.02-2.18 1.78-3.23 1.86-3.28-1.02-1.48-2.6-1.69-3.16-1.71-1.34-.14-2.62.79-3.31.79-.7 0-1.74-.77-2.86-.75-1.47.02-2.83.85-3.59 2.16-1.53 2.65-.39 6.57 1.09 8.72.74 1.05 1.61 2.23 2.74 2.19 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.12.84-1.21 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.33-3.52zM10.99 4.4c.6-.73 1-1.74.89-2.75-.86.04-1.9.57-2.52 1.29-.55.64-1.04 1.67-.91 2.66.96.07 1.94-.49 2.54-1.2z" />
        </svg>
        <span>Pay</span>
      </button>
      <button className="wallet-pay-btn" onClick={onPay}>
        <span className="gpay-g">G</span>
        <span>Pay</span>
      </button>
    </div>
  );
}

interface CardForm {
  email: string;
  card: string;
  expiry: string;
  cvc: string;
  country: string;
  zip: string;
}

const COUNTRIES = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
];

function CountrySelect({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = COUNTRIES.find((c) => c.code === value) || COUNTRIES[0];

  const filtered = search
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;

  const close = useCallback(() => { setOpen(false); setSearch(""); }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler); };
  }, [open, close]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  return (
    <div className="country-select" ref={ref}>
      <button
        type="button"
        className="country-select-trigger"
        onClick={() => setOpen(!open)}
      >
        <span className="country-flag">{selected.flag}</span>
        <span className="country-name">{selected.name}</span>
        <Icon name="expand_more" size={18} className={`country-chev${open ? " open" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="country-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="country-search-wrap">
              <Icon name="search" size={16} />
              <input
                ref={inputRef}
                className="country-search"
                type="text"
                placeholder="Search country…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="country-list">
              {filtered.length === 0 && (
                <div className="country-empty">No results</div>
              )}
              {filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  className={`country-option${c.code === value ? " active" : ""}`}
                  onClick={() => { onChange(c.code); close(); }}
                >
                  <span className="country-flag">{c.flag}</span>
                  <span className="country-option-name">{c.name}</span>
                  <span className="country-option-code">{c.code}</span>
                  {c.code === value && <Icon name="check" size={16} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FiatCardForm({ form, setForm }: { form: CardForm; setForm: (f: CardForm) => void }) {
  const brand = detectCardBrand(form.card);
  return (
    <div className="card-form">
      <div className="card-input-shell">
        <div className="card-field">
          <label className="card-field-label">Email</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="card-field">
          <label className="card-field-label">Card</label>
          <input inputMode="numeric" placeholder="1234 1234 1234 1234" value={form.card} onChange={(e) => setForm({ ...form, card: formatCardNumber(e.target.value) })} />
          <CardBrandIcons activeBrand={brand} />
        </div>
        <div className="card-field card-field-twocol">
          <div>
            <label className="card-field-label" style={{ width: "auto" }}>Expiry</label>
            <input inputMode="numeric" placeholder="MM / YY" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })} />
          </div>
          <div>
            <label className="card-field-label" style={{ width: "auto" }}>CVC</label>
            <input inputMode="numeric" placeholder="123" maxLength={4} value={form.cvc} onChange={(e) => setForm({ ...form, cvc: e.target.value.replace(/\D/g, "") })} />
          </div>
        </div>
        <div className="card-field card-field-country">
          <label className="card-field-label">Country</label>
          <CountrySelect value={form.country} onChange={(code) => setForm({ ...form, country: code })} />
          <input placeholder="ZIP / Postal" style={{ width: 110 }} value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function RecurringRow({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="recurring-row">
      <div className="info">
        <Icon name="autorenew" fill={1} />
        <div className="info-text">
          <span className="l1">Donate monthly</span>
          <span className="l2">Cancel anytime — receipts auto-sent</span>
        </div>
      </div>
      <button type="button" className="toggle" data-on={value ? "1" : "0"} onClick={() => onChange(!value)}>
        <i />
      </button>
    </div>
  );
}

function TrustStrip({ method }: { method: string }) {
  return (
    <div className="trust-strip">
      {method === "card" ? (
        <>
          <span><Icon name="lock" />256-bit TLS</span>
          <span><Icon name="verified_user" />PCI compliant</span>
          <span><Icon name="receipt_long" />Tax receipt emailed</span>
        </>
      ) : (
        <>
          <span><Icon name="link" />Non-custodial</span>
          <span><Icon name="verified_user" />On-chain receipt NFT</span>
          <span><Icon name="public" />Public ledger</span>
        </>
      )}
    </div>
  );
}

function DonateCampaignBanner({ campaign, stats, rate }: { campaign: { goal: number; goalNGN?: number }; stats: { raised: number }; rate: number }) {
  const pct = (stats.raised / campaign.goal) * 100;
  const goalNgn = campaign.goalNGN || Math.round(campaign.goal * rate);
  return (
    <div className="donate-banner">
      <div className="donate-banner-row">
        <div className="raised">
          <span className="raised-amount">{"₦"}{formatNGN(stats.raised, rate)}</span>
          raised of <span className="money money-sm"><span className="money-ngn">₦{new Intl.NumberFormat("en-NG").format(goalNgn)}</span></span>
        </div>
        <span className="funded">{pct.toFixed(0)}% funded</span>
      </div>
      <ProgressBar value={stats.raised} max={campaign.goal} />
    </div>
  );
}

function DonateTokenSelector({ selectedToken, onSelect }: { selectedToken: typeof SUPPORTED_TOKENS[0]; onSelect: (t: typeof SUPPORTED_TOKENS[0]) => void }) {
  return (
    <div className="donate-section">
      <label className="donate-label">Select Asset</label>
      <div className="token-row">
        {SUPPORTED_TOKENS.map((t) => (
          <button key={t.symbol} className={`token-btn${selectedToken.symbol === t.symbol ? " active" : ""}`} onClick={() => onSelect(t)}>
            <TokenIcon symbol={t.symbol} size={18} />
            {t.symbol}
          </button>
        ))}
      </div>
      {selectedToken.symbol !== "USDC" && (
        <p className="token-note">{selectedToken.symbol} will be automatically swapped to USDC via DEX.</p>
      )}
    </div>
  );
}

function DonateAmountInput({ amount, onChange, tokenSymbol, presets, activeAmount, rate }: { amount: string; onChange: (v: string) => void; tokenSymbol: string; presets: number[]; activeAmount: string; rate: number }) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    onChange(parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized);
  };
  const numericAmount = parseFloat(amount) || 0;
  const isNgn = tokenSymbol === "NGN";
  const isCrypto = !isNgn;
  return (
    <div className="donate-section">
      <label className="donate-label">Amount</label>
      <div className="amount-input-wrap">
        <input type="text" inputMode="decimal" value={amount} onChange={handle} placeholder={isNgn ? "0" : "0.00"} className="amount-input" aria-label="Donation amount" />
        <div className="amount-input-suffix">{isNgn ? "₦" : tokenSymbol}</div>
      </div>
      {isNgn && rate && numericAmount > 0 && (
        <p style={{ margin: "8px 4px 0", fontSize: 13, color: "var(--on-surface-variant)" }}>
          {"≈ $"}{formatUSD(numericAmount / rate)} USD
        </p>
      )}
      <div className="preset-row">
        {presets.map((p) => (
          <button key={p} className={`preset-btn${parseFloat(activeAmount) === p ? " active" : ""}`} onClick={() => onChange(p.toString())}>
            {isNgn ? `₦${new Intl.NumberFormat("en-NG").format(p)}` : isCrypto && (tokenSymbol === "ETH" || tokenSymbol === "WETH") ? p : `$${p}`}
            {isNgn && rate && (
              <span style={{ display: "block", fontSize: 10, color: "var(--on-surface-variant)", fontWeight: 400, marginTop: 2 }}>
                {"≈ $"}{formatUSD(p / rate, 0)}
              </span>
            )}
          </button>
        ))}
      </div>
      {isNgn && amount && numericAmount > 0 && numericAmount / rate < MIN_DONATION_USD && (
        <p style={{ color: "#fbbf24", fontSize: 12, margin: "8px 0 0" }}>
          Minimum donation is {"₦"}{new Intl.NumberFormat("en-NG").format(Math.ceil(MIN_DONATION_USD * rate))}
        </p>
      )}
    </div>
  );
}

function DonateSummaryCard({ amount, tokenSymbol, method, rate }: { amount: string; tokenSymbol: string; method: string; rate: number }) {
  const isFiat = method === "card";
  const rawNum = parseFloat(amount) || 0;
  const usdAmount = isFiat ? rawNum / rate : rawNum;
  const ngnAmount = isFiat ? rawNum : rawNum * rate;
  const feeUsd = isFiat ? usdAmount * 0.029 + 0.3 : 0.15;
  const feeNgn = feeUsd * rate;
  const netNgn = Math.max(ngnAmount - feeNgn, 0);
  const netUsd = Math.max(usdAmount - feeUsd, 0);
  return (
    <div className="summary-card">
      <div className="summary-row">
        <span className="l">You donate</span>
        {isFiat ? (
          <span className="v" style={{ fontWeight: 700 }}>{"₦"}{new Intl.NumberFormat("en-NG").format(Math.round(ngnAmount))} <span style={{ fontSize: 11, color: "var(--on-surface-variant)", fontWeight: 400 }}>{"≈ $"}{formatUSD(usdAmount)}</span></span>
        ) : (
          <Money usd={usdAmount} rate={rate} size="sm" decimals={2} />
        )}
      </div>
      <div className="summary-row muted">
        <span className="l">{isFiat ? "Processing fee (2.9% + ₦411)" : "Estimated gas"}</span>
        <span className="v fee">{isFiat ? `−₦${new Intl.NumberFormat("en-NG").format(Math.round(feeNgn))}` : `−$${formatUSD(feeUsd)}`}</span>
      </div>
      <div className="summary-row">
        <span className="l">Campaign receives</span>
        {isFiat ? (
          <span className="v" style={{ fontWeight: 700 }}>{"₦"}{new Intl.NumberFormat("en-NG").format(Math.round(netNgn))} <span style={{ fontSize: 11, color: "var(--on-surface-variant)", fontWeight: 400 }}>{"≈ $"}{formatUSD(netUsd)}</span></span>
        ) : (
          <Money usd={netUsd} rate={rate} size="sm" decimals={2} />
        )}
      </div>
      <div className="summary-row summary-divider">
        <span className="l" style={{ color: "rgba(195, 198, 215, .6)" }}>{isFiat ? "Settlement" : "Network"}</span>
        <span style={{ color: "var(--on-surface)", fontWeight: 700 }}>
          {isFiat ? (
            <><Icon name="bolt" size={12} style={{ verticalAlign: "middle", marginRight: 4, color: "var(--tertiary)" }} />Card {"→"} USDC on Base</>
          ) : (
            <><span className="summary-network-dot" />Base</>
          )}
        </span>
      </div>
    </div>
  );
}

function DonateCrossChainInfo() {
  const [open, setOpen] = useState(false);
  const chains = [
    { name: "Ethereum", icon: "ETH" },
    { name: "Arbitrum", icon: "ARBITRUM" },
    { name: "Optimism", icon: "OPTIMISM" },
  ];
  return (
    <div className="crosschain-collapse">
      <button className="crosschain-head" onClick={() => setOpen(!open)}>
        <div className="crosschain-head-l">
          <Icon name="swap_horiz" />
          Donating from another chain?
        </div>
        <Icon name="expand_more" className={`crosschain-chev${open ? " open" : ""}`} />
      </button>
      {open && (
        <div className="crosschain-body">
          <p>You can donate USDC directly from Ethereum, Arbitrum, or Optimism — no manual bridging needed. USDC is burned on your chain and natively minted on Base via <b>Circle CCTP</b>.</p>
          <div className="chain-chips">
            {chains.map((c) => (
              <span key={c.name} className="chain-chip">
                <TokenIcon symbol={c.icon} size={14} />
                {c.name}
              </span>
            ))}
          </div>
          <ol>
            <li><span className="num">1</span><span>Switch your wallet to Ethereum, Arbitrum, or Optimism.</span></li>
            <li><span className="num">2</span><span>This page auto-detects the switch and shows the cross-chain donation form.</span></li>
            <li><span className="num">3</span><span>Approve USDC, then confirm the burn. Takes ~2 min on L2, ~13 min on Ethereum.</span></li>
            <li><span className="num">4</span><span>Switch to Base and click &quot;Complete donation&quot; to mint USDC and credit your donation.</span></li>
          </ol>
          <div className="fee-note">
            <Icon name="check_circle" />
            <p>No bridge fee. You only pay source-chain gas — Circle&apos;s CCTP has no protocol fee.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function OPayLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14.137 6a11.475 11.475 0 0 0-6.802 2.203 11.38 11.38 0 0 0-4.156 5.792.211.211 0 0 0 .107.252c.03.015.063.023.096.023h4.399a.212.212 0 0 0 .19-.114 6.945 6.945 0 0 1 2.632-2.727 6.993 6.993 0 0 1 3.68-.946c3.72.067 6.6 3.112 6.735 6.62a6.869 6.869 0 0 1-1.347 4.352 6.93 6.93 0 0 1-3.78 2.566 6.96 6.96 0 0 1-4.564-.338 6.914 6.914 0 0 1-3.356-3.096.211.211 0 0 0-.188-.114h-4.4a.213.213 0 0 0-.204.275 11.368 11.368 0 0 0 3.391 5.186 11.455 11.455 0 0 0 5.618 2.652c2.083.351 4.222.12 6.182-.665a11.424 11.424 0 0 0 4.917-3.787A11.324 11.324 0 0 0 24.31 12.27a11.395 11.395 0 0 0-4.197-4.566A11.474 11.474 0 0 0 14.137 6" fill="#1DCF9F"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M7.62 19.517H2.229a.226.226 0 0 1-.211-.145.235.235 0 0 1-.017-.089v-3.692a.235.235 0 0 1 .14-.216.226.226 0 0 1 .088-.018h5.393a.226.226 0 0 1 .211.145.235.235 0 0 1 .017.089v3.692a.235.235 0 0 1-.14.216.226.226 0 0 1-.088.018" fill="#210F60"/>
    </svg>
  );
}

function BankTransferDetails() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [launchState, setLaunchState] = useState<"idle" | "copied" | "launched">("idle");

  const copy = (text: string, field: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAndOpen = () => {
    navigator.clipboard?.writeText("6557984463");
    setLaunchState("copied");

    setTimeout(() => {
      setLaunchState("launched");

      const isAndroid = /android/i.test(navigator.userAgent);
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

      if (isAndroid) {
        window.location.href = "intent://#Intent;scheme=opay;package=com.opay.pay;end";
      } else if (isIOS) {
        window.location.href = "opay://";
      }

      setTimeout(() => setLaunchState("idle"), 4000);
    }, 600);
  };

  return (
    <div className="donate-section">
      <label className="donate-label">Transfer to this account</label>
      <div className="bank-transfer-card">
        <div className="bank-transfer-header">
          <div className="bank-transfer-badge">
            <OPayLogo size={22} />
            <span>OPay</span>
          </div>
          <span className="bank-transfer-tag">Direct Transfer</span>
        </div>

        <div className="bank-transfer-fields">
          <div className="bank-transfer-row">
            <div className="bank-transfer-field">
              <span className="bank-transfer-label">Account Number</span>
              <span className="bank-transfer-value mono">6557984463</span>
            </div>
            <button
              type="button"
              className={`bank-copy-btn${copiedField === "number" ? " copied" : ""}`}
              onClick={() => copy("6557984463", "number")}
            >
              <Icon name={copiedField === "number" ? "check" : "content_copy"} size={16} />
              {copiedField === "number" ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="bank-transfer-row">
            <div className="bank-transfer-field">
              <span className="bank-transfer-label">Account Name</span>
              <span className="bank-transfer-value">PURITY EZEMWENGHIAN USIEMWANTA</span>
            </div>
            <button
              type="button"
              className={`bank-copy-btn${copiedField === "name" ? " copied" : ""}`}
              onClick={() => copy("PURITY EZEMWENGHIAN USIEMWANTA", "name")}
            >
              <Icon name={copiedField === "name" ? "check" : "content_copy"} size={16} />
              {copiedField === "name" ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="bank-transfer-row">
            <div className="bank-transfer-field">
              <span className="bank-transfer-label">Bank</span>
              <span className="bank-transfer-value">OPay (Opera Pay)</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={`bank-launch-btn${launchState !== "idle" ? " active" : ""}`}
          onClick={handleCopyAndOpen}
        >
          {launchState === "idle" && (
            <>
              <OPayLogo size={18} />
              <span>Copy account &amp; open OPay</span>
              <Icon name="open_in_new" size={16} />
            </>
          )}
          {launchState === "copied" && (
            <>
              <Icon name="check" size={18} />
              <span>Account number copied, opening OPay...</span>
            </>
          )}
          {launchState === "launched" && (
            <>
              <Icon name="check_circle" size={18} />
              <span>Copied! Paste in your banking app</span>
            </>
          )}
        </button>

        <p className="bank-transfer-footnote">
          Don{"'"}t have OPay? Copy the account number above and transfer from any Nigerian bank app.
        </p>
      </div>
    </div>
  );
}

function StepBanner({ step, total, label, sub }: { step: number; total: number; label: string; sub: string }) {
  return (
    <div className="step-banner">
      <Icon name="progress_activity" />
      <div>
        <div className="l1">Step {step}/{total}: {label}</div>
        <div className="l2">{sub}</div>
      </div>
    </div>
  );
}

export interface SuccessInfo {
  amount: string;
  tokenSymbol: string;
  method: string;
  recurring?: boolean;
  card?: { last4: string; brand: string | null };
  txHash: string;
}

interface DonateConfig {
  methods: { id: string; icon: string; label: string; sub?: string }[];
  title: string;
  sub: string;
  iconName: string;
}

interface DonatePageProps {
  campaign: { goal: number; title?: string };
  stats: { raised: number; donors: number };
  rate: number;
  donateConfig: DonateConfig;
  onBack: () => void;
  onSuccess: (info: SuccessInfo) => void;
}

function TransferSuccessScreen({ amount, rate, donors, onBack, onAnother }: { amount: string; rate: number; donors: number; onBack: () => void; onAnother: () => void }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const ngnAmt = parseFloat(amount) || 0;
  const usdAmt = rate > 0 ? ngnAmt / rate : 0;
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useGSAP(
    () => {
      if (!screenRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.fromTo(".ts-ring", { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.7, ease: "elastic.out(1, 0.55)" }, 0.15);
      tl.fromTo(".ts-check-path", { strokeDashoffset: 48 }, { strokeDashoffset: 0, duration: 0.5, ease: "power3.out" }, 0.55);
      tl.fromTo(".ts-headline", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.7);
      tl.fromTo(".ts-amount", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, 0.85);
      tl.fromTo(".ts-equiv", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, 1.0);
      tl.fromTo(".ts-divider", { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, 1.1);
      tl.fromTo(".ts-flow-item", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.1 }, 1.2);
      tl.fromTo(".ts-name-area", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 1.6);
      tl.fromTo(".ts-actions", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, 1.8);
    },
    { dependencies: [], scope: screenRef }
  );

  return (
    <div ref={screenRef} className="ts-screen">
      <SubPageNav onBack={onBack} />
      <main className="ts-main">
        <div className="ts-bg-glow" />
        <div className="ts-card">
          {/* Success ring + check SVG */}
          <div className="ts-ring">
            <svg width="88" height="88" viewBox="0 0 88 88" fill="none" className="ts-ring-svg">
              <circle cx="44" cy="44" r="40" stroke="url(#ring-grad)" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
              <circle cx="44" cy="44" r="40" stroke="url(#ring-grad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="251" strokeDashoffset="62.75" className="ts-ring-arc" />
              <defs>
                <linearGradient id="ring-grad" x1="0" y1="0" x2="88" y2="88">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="ts-check-svg">
              <path
                className="ts-check-path"
                d="M8 18.5L15 25.5L28 11"
                stroke="url(#check-grad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="48"
                strokeDashoffset="0"
              />
              <defs>
                <linearGradient id="check-grad" x1="8" y1="11" x2="28" y2="25.5">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="ts-headline">Thank you for your generosity</h1>

          <p className="ts-amount">₦{new Intl.NumberFormat("en-NG").format(Math.round(ngnAmt))}</p>
          <p className="ts-equiv">≈ ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(usdAmt)} USD</p>

          <div className="ts-divider" />

          {/* Fund flow */}
          <div className="ts-flow">
            <div className="ts-flow-item">
              <div className="ts-flow-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14.4A6.4 6.4 0 1110 3.6a6.4 6.4 0 010 12.8zM9.2 6h1.6v4.4l3.72 2.24-.84 1.36-4.48-2.68V6z" fill="var(--primary)" />
                </svg>
              </div>
              <div className="ts-flow-text">
                <span className="ts-flow-label">Status</span>
                <span className="ts-flow-value ts-pending">Pending verification</span>
              </div>
            </div>
            <div className="ts-flow-item">
              <div className="ts-flow-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16 4H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 10H4V6h12v8zm-6-1c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-4.8c.99 0 1.8.81 1.8 1.8s-.81 1.8-1.8 1.8-1.8-.81-1.8-1.8.81-1.8 1.8-1.8z" fill="var(--primary)" />
                </svg>
              </div>
              <div className="ts-flow-text">
                <span className="ts-flow-label">Destination</span>
                <span className="ts-flow-value">OPay · ****4463</span>
              </div>
            </div>
            <div className="ts-flow-item">
              <div className="ts-flow-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H9v-2h2v2zm0-4H9V5h2v6z" fill="var(--primary)" />
                </svg>
              </div>
              <div className="ts-flow-text">
                <span className="ts-flow-label">What happens next</span>
                <span className="ts-flow-value">We verify your transfer and add you to the donor wall</span>
              </div>
            </div>
          </div>

          {/* Optional name */}
          <div className="ts-name-area">
            {!submitted ? (
              <>
                <p className="ts-name-prompt">Leave your name for the family <span className="ts-optional">(optional)</span></p>
                <div className="ts-name-input-row">
                  <input
                    className="ts-name-input"
                    type="text"
                    placeholder="Your name or 'Anonymous'"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <button
                    className="ts-name-submit"
                    onClick={() => setSubmitted(true)}
                    disabled={!name.trim()}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2.01 16L17 9 2.01 2 2 7.5l10.5 1.5L2 10.5z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="ts-name-confirmed">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="rgba(16,185,129,.15)" />
                  <path d="M4.5 8.2L7 10.5L11.5 5.5" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Thank you, {name}. The family will see your name.</span>
              </div>
            )}
          </div>

          {/* Donor count */}
          <p className="ts-donor-count">
            You join <strong>{donors}</strong> other donor{donors !== 1 ? "s" : ""} supporting this family.
          </p>

          {/* Actions */}
          <div className="ts-actions">
            <button className="ts-btn-primary" onClick={onAnother}>Donate again</button>
            <button className="ts-btn-secondary" onClick={onBack}>Return to campaign</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function DonatePage({ campaign, stats, onBack, onSuccess, donateConfig, rate }: DonatePageProps) {
  const methods = donateConfig.methods;
  const [method, setMethod] = useState(methods[0]?.id || "card");
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("idle");
  const [recurring, setRecurring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [cardForm, setCardForm] = useState<CardForm>({ email: "", card: "", expiry: "", cvc: "", country: "NG", zip: "" });

  // Web3 state
  const { address, isConnected, chain } = useAccount();
  const donate = useDonate();
  const [isApprovalStep, setIsApprovalStep] = useState(false);
  const [hasPendingCctp, setHasPendingCctp] = useState(false);

  // Detect chain context
  const isOnForeignChain = !!chain && !isBaseChain(chain.id);

  // Parse amount to bigint for blockchain calls
  const contractToken = CONTRACT_TOKENS.find(t => t.symbol === selectedToken.symbol);
  const parsedCryptoAmount = (() => {
    if (!amount || parseFloat(amount) <= 0 || !contractToken) return 0n;
    try { return parseUnits(amount, contractToken.decimals); } catch { return 0n; }
  })();

  // Check for pending CCTP transfer on mount / address change
  useEffect(() => {
    if (!address) { setHasPendingCctp(false); return; }
    try {
      setHasPendingCctp(!!localStorage.getItem(`cctp_pending_${address.toLowerCase()}`));
    } catch {}
  }, [address]);

  // Reset crypto state when wallet disconnects
  useEffect(() => {
    if (!address) {
      donate.reset();
      setIsApprovalStep(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Track when we enter the approval step
  useEffect(() => {
    if (donate.step === "approving") setIsApprovalStep(true);
    if (donate.step === "success")   setIsApprovalStep(false);
  }, [donate.step]);

  // After ERC20 approval confirms, auto-proceed to donation
  useEffect(() => {
    if (donate.isSuccess && isApprovalStep && contractToken) {
      setIsApprovalStep(false);
      donate.proceedAfterApproval(
        contractToken.address as Address,
        parsedCryptoAmount,
        selectedToken.symbol === "USDC"
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donate.isSuccess]);

  // When crypto donation confirms, fire onSuccess with real txHash
  useEffect(() => {
    if (donate.step !== "success" || method !== "crypto") return;
    onSuccess({
      amount,
      tokenSymbol: selectedToken.symbol,
      method: "crypto",
      txHash: donate.txHash ?? "0x",
    });
    donate.reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donate.step]);

  const presets = method === "card" || method === "transfer"
    ? PRESET_NGN
    : (contractToken?.isNative || selectedToken.symbol === "WETH") ? PRESET_ETH : PRESET_USD;

  const handleDonate = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (method === "transfer") {
      setTransferAmount(amount);
      setTransferSuccess(true);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }
    if (method === "card") {
      const cardDigits = cardForm.card.replace(/\s/g, "");
      if (!cardForm.email || cardDigits.length < 12 || cardForm.expiry.replace(/\D/g, "").length < 4 || cardForm.cvc.length < 3) {
        setStep("error");
        setTimeout(() => setStep("idle"), 1800);
        return;
      }
      setStep("charging");
      setTimeout(() => setStep("processing"), 900);
      setTimeout(() => {
        const usdEquiv = (parseFloat(amount) / rate).toFixed(2);
        onSuccess({
          amount: usdEquiv,
          tokenSymbol: "NGN",
          method: "card",
          recurring,
          card: { last4: cardDigits.slice(-4), brand: detectCardBrand(cardForm.card) },
          txHash: "ch_" + Math.random().toString(36).slice(2, 14).toUpperCase(),
        });
      }, 2300);
      return;
    }
    // Crypto: real blockchain calls
    if (!isConnected || !contractToken || parsedCryptoAmount === 0n) return;
    if (contractToken.isNative) {
      donate.donateETH(parsedCryptoAmount);
    } else if (selectedToken.symbol === "USDC") {
      donate.donateUSDC(parsedCryptoAmount);
    } else {
      donate.donateERC20(contractToken.address as Address, parsedCryptoAmount);
    }
  };

  const cryptoProcessing = method === "crypto" && donate.isProcessing;
  const processing = (step !== "idle" && step !== "error") || cryptoProcessing;
  const tokenSymbolForUi = method === "card" ? "NGN" : selectedToken.symbol;

  const ctaLabel = (() => {
    if (step === "charging") return "Verifying card…";
    if (step === "processing") return "Processing payment…";
    if (step === "error") return "Check details and retry";
    if (method === "crypto") {
      if (donate.step === "approving") return "Approving…";
      if (donate.step === "donating") return "Donating…";
      if (donate.step === "confirming") return "Confirming…";
      if (!isConnected) return "Connect wallet to donate";
    }
    if (method === "transfer") {
      const ngnAmt = parseFloat(amount) || 0;
      return ngnAmt > 0 ? `I've sent ₦${new Intl.NumberFormat("en-NG").format(Math.round(ngnAmt))}` : "Confirm transfer";
    }
    if (method === "card") {
      const ngnAmt = parseFloat(amount) || 0;
      return ngnAmt > 0 ? `Donate ₦${new Intl.NumberFormat("en-NG").format(Math.round(ngnAmt))} with card` : "Donate with card";
    }
    const amt = amount ? `${parseFloat(amount).toFixed(4).replace(/\.?0+$/, "")}` : "";
    return `Donate ${amt} ${tokenSymbolForUi}`;
  })();

  if (transferSuccess) {
    return (
      <TransferSuccessScreen
        amount={transferAmount}
        rate={rate}
        donors={stats.donors}
        onBack={onBack}
        onAnother={() => { setTransferSuccess(false); setAmount(""); setTransferAmount(""); }}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-container-lowest)" }}>
      <SubPageNav onBack={onBack} />
      <main className="donate-main">
        <div className="donate-wrap">
          <DonateCampaignBanner campaign={campaign} stats={stats} rate={rate} />
          <div className="donate-title-area">
            <div className="donate-title-icon">
              <Icon name={donateConfig.iconName || "favorite"} size={36} fill={1} />
            </div>
            <h1 className="donate-title">{donateConfig.title || "Make a Donation"}</h1>
            <p className="donate-title-sub">{donateConfig.sub}</p>
          </div>
          <section className="donate-card">
            <div className="donate-card-glow1" />
            <div className="donate-card-glow2" />
            {methods.length > 1 && (
              <PayMethodTabs method={method} onChange={(m) => { setMethod(m); setAmount(""); }} methods={methods} />
            )}
            <AnimatePresence mode="wait">
              {method === "transfer" && (
                <motion.div
                  key="transfer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ display: "flex", flexDirection: "column", gap: 40 }}
                >
                  <BankTransferDetails />
                  <DonateAmountInput amount={amount} onChange={setAmount} tokenSymbol="NGN" presets={presets} activeAmount={amount} rate={rate} />
                </motion.div>
              )}
              {method === "card" && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ display: "flex", flexDirection: "column", gap: 40 }}
                >
                  <div className="donate-section">
                    <label className="donate-label">Quick pay</label>
                    <WalletPayRow onPay={handleDonate} />
                  </div>
                  <div className="divider-or">or pay with card</div>
                  <DonateAmountInput amount={amount} onChange={setAmount} tokenSymbol="NGN" presets={presets} activeAmount={amount} rate={rate} />
                  <div className="donate-section">
                    <label className="donate-label">Card details</label>
                    <FiatCardForm form={cardForm} setForm={setCardForm} />
                  </div>
                  <RecurringRow value={recurring} onChange={setRecurring} />
                </motion.div>
              )}
              {method === "crypto" && (
                <motion.div
                  key="crypto"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ display: "flex", flexDirection: "column", gap: 32 }}
                >
                  {/* ── Not connected: prompt to connect ── */}
                  {!isConnected && (
                    <div className="crypto-connect-gate">
                      <Icon name="account_balance_wallet" size={40} style={{ color: "var(--primary)", opacity: .7 }} />
                      <p>Connect your wallet to donate crypto.</p>
                      <ConnectButton />
                    </div>
                  )}

                  {/* ── Cross-chain: user on foreign chain or has pending CCTP ── */}
                  {isConnected && (isOnForeignChain || hasPendingCctp) && (
                    <CrossChainDonate
                      onSuccess={(txHash, xcAmount) => {
                        setHasPendingCctp(false);
                        onSuccess({ amount: xcAmount, tokenSymbol: "USDC", method: "crypto", txHash: txHash ?? "0x" });
                      }}
                      onPendingTransfer={() => setHasPendingCctp(true)}
                      onReset={() => setHasPendingCctp(false)}
                    />
                  )}

                  {/* ── Same-chain (Base): normal donation form ── */}
                  {isConnected && !isOnForeignChain && !hasPendingCctp && (
                    <>
                      <DonateTokenSelector
                        selectedToken={selectedToken}
                        onSelect={(t) => { setSelectedToken(t); setAmount(""); donate.reset(); }}
                      />
                      <DonateAmountInput amount={amount} onChange={setAmount} tokenSymbol={selectedToken.symbol} presets={presets} activeAmount={amount} rate={rate} />
                      <DonateCrossChainInfo />
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Summary card — shown for card/transfer, and for crypto when connected + same chain */}
            <AnimatePresence>
              {amount && parseFloat(amount) > 0 && (method !== "crypto" || (isConnected && !isOnForeignChain && !hasPendingCctp)) && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <DonateSummaryCard amount={amount} tokenSymbol={tokenSymbolForUi} method={method} rate={rate} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card / transfer step banners */}
            {method !== "crypto" && (
              <>
                {step === "charging" && <StepBanner step={1} total={2} label="Verifying card…" sub="Checking with your bank" />}
                {step === "processing" && <StepBanner step={2} total={2} label="Processing payment…" sub="Converting to USDC for the campaign" />}
                {step === "error" && (
                  <div className="step-banner" style={{ background: "rgba(220, 38, 38, .1)", borderColor: "rgba(220, 38, 38, .3)" }}>
                    <Icon name="error" style={{ animation: "none", color: "#f87171" }} />
                    <div>
                      <div className="l1">Couldn&apos;t process that</div>
                      <div className="l2">Double-check your card number, expiry, and CVC.</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Crypto step banners — only when connected and on same chain */}
            {method === "crypto" && isConnected && !isOnForeignChain && !hasPendingCctp && (
              <>
                {donate.step === "approving" && <StepBanner step={1} total={2} label="Approving token spend…" sub="Please confirm in your wallet" />}
                {donate.step === "donating"  && <StepBanner step={2} total={2} label="Submitting donation…" sub="Please confirm in your wallet" />}
                {donate.step === "confirming" && <StepBanner step={2} total={2} label="Confirming on chain…" sub="Waiting for block confirmation" />}
                {donate.errorMsg && donate.step === "error" && (
                  <div className="step-banner" style={{ background: "rgba(220, 38, 38, .1)", borderColor: "rgba(220, 38, 38, .3)" }}>
                    <Icon name="error" style={{ animation: "none", color: "#f87171" }} />
                    <div>
                      <div className="l1">Transaction failed</div>
                      <div className="l2">{donate.errorMsg}</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* CTA button — shown for card/transfer always; for crypto only when connected + same chain */}
            {(method !== "crypto" || (isConnected && !isOnForeignChain && !hasPendingCctp)) && (
              <button
                className="btn-tertiary-cta"
                onClick={handleDonate}
                disabled={!amount || parseFloat(amount) <= 0 || processing}
              >
                {processing ? (
                  <>
                    <Icon name="progress_activity" className="spin" />
                    {ctaLabel}
                  </>
                ) : (
                  <>
                    <Icon name={method === "card" ? "credit_card" : method === "crypto" ? "favorite" : "check"} fill={method === "card" ? 0 : 1} />
                    {ctaLabel}
                  </>
                )}
              </button>
            )}
            <TrustStrip method={method} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Success Screen
interface DonateSuccessScreenProps {
  amount: string;
  tokenSymbol: string;
  method: string;
  recurring?: boolean;
  card?: { last4: string; brand: string | null };
  txHash: string;
  donorNumber: number;
  beneficiaryNoun: string;
  beneficiaryCount: string;
  rate: number;
  onReset: () => void;
  onBack: () => void;
}

export function DonateSuccessScreen({ amount, tokenSymbol, method, recurring, card, txHash, donorNumber, beneficiaryNoun, beneficiaryCount, rate, onReset, onBack }: DonateSuccessScreenProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const isFiat = method === "card";
  const numericAmount = parseFloat(amount) || 0;
  const shareText = `I just donated ₦${formatNGN(numericAmount, rate)} to ${beneficiaryNoun || "people who need it"} — join me on FundBrave!`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  useGSAP(
    () => {
      if (!screenRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(".success-check-outer", { scale: 0 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }, 0.2);
      tl.fromTo(".success-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.5);
      tl.fromTo(".success-amount", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.7);
      tl.fromTo(".success-amount-sub", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 }, 0.9);
      tl.fromTo(".success-flow-node", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.15, ease: "back.out(2)" }, 1.0);
      tl.fromTo(".success-flow-line", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.3, stagger: 0.1 }, 1.1);
      tl.fromTo(".success-social", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 1.3);
      tl.fromTo(".success-actions", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 1.4);
      tl.fromTo(".success-share", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 1.6);
    },
    { dependencies: [], scope: screenRef }
  );

  return (
    <div ref={screenRef} style={{ minHeight: "100vh", background: "var(--surface-container-lowest)", display: "flex", flexDirection: "column" }}>
      <SubPageNav onBack={onBack} />
      <main className="success-main" style={{ flex: 1 }}>
        <div className="success-bg">
          <div className="success-glow1" />
          <div className="success-glow2" />
        </div>
        <div className="success-card">
          <div className="success-check-outer">
            <div className="success-check-inner">
              <Icon name="check" fill={1} />
            </div>
          </div>
          <h1 className="success-title">
            <span className="text-gradient-brand">You just made an impact</span>
          </h1>
          <p className="success-amount">{"₦"}{formatNGN(numericAmount, rate)}</p>
          <p className="success-amount-sub" style={{ marginBottom: 4 }}>
            {"≈"} ${formatUSD(numericAmount)} {isFiat ? "USD" : tokenSymbol}
          </p>
          <p className="success-amount-sub">
            {isFiat ? (recurring ? "Monthly donation started" : "Payment confirmed") : "Transaction confirmed"}
          </p>
          {isFiat && card && (
            <div style={{
              width: "100%", padding: "14px 16px", background: "var(--surface-container-low)",
              border: "1px solid var(--outline-variant)", borderRadius: 12,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 32, fontSize: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CardBrandChip brand={card.brand} />
                <span style={{ color: "var(--on-surface-variant)" }}>{"••••"} {card.last4}</span>
              </div>
              <div style={{ color: "var(--on-surface-variant)", fontFamily: "var(--f-mono)", fontSize: 12 }}>{txHash}</div>
            </div>
          )}
          <div className="success-flow">
            <div className="success-flow-inner">
              <div className="success-flow-node">
                <div className="success-flow-icon"><Icon name={isFiat ? "credit_card" : "account_balance_wallet"} /></div>
                <span>You</span>
              </div>
              <div className="success-flow-line l1" />
              <div className="success-flow-node">
                <div className="success-flow-icon center"><Icon name="favorite" fill={1} /></div>
                <span className="primary">Campaign</span>
              </div>
              <div className="success-flow-line l2" />
              <div className="success-flow-node">
                <div className="success-flow-icon right"><Icon name="groups" /></div>
                <span>{beneficiaryCount || ""} {beneficiaryNoun || ""}</span>
              </div>
            </div>
          </div>
          <p className="success-social">
            You&apos;re donor <b>#{donorNumber}</b>. Join {Math.max(donorNumber - 1, 0)} others
            {beneficiaryNoun ? <> supporting <b>{beneficiaryNoun}</b></> : null}.
          </p>
          <div className="success-actions">
            <button className="btn-tertiary-cta" onClick={onReset}>Donate again</button>
            <a href="#" className="success-explorer">
              {isFiat ? "View receipt" : "View on block explorer"}
              <Icon name="open_in_new" />
            </a>
          </div>
          <div className="success-share">
            <p className="success-share-label">Spread the word</p>
            <div className="success-share-row">
              <a className="share-btn" href={twitterUrl} target="_blank" rel="noopener noreferrer"><Icon name="share" />Twitter/X</a>
              <button className="share-btn" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Icon name="link" />Copy Link</button>
              <a className="share-btn" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><Icon name="chat" />WhatsApp</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
