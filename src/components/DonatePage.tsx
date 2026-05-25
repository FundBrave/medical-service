"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import { Icon } from "./Icon";
import { Money } from "./Money";
import { ProgressBar } from "./ProgressBar";
import { TokenIcon } from "./TokenIcon";
import { CardBrandIcons, CardBrandChip } from "./CardBrandIcon";
import { SubPageNav } from "./SubPageNav";
import { Footer } from "./Footer";
import { formatNGN, formatUSD } from "@/lib/format";
import { SUPPORTED_TOKENS, PRESET_USD, PRESET_NGN, PRESET_ETH, MIN_DONATION_USD } from "@/lib/constants";

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
        <div className="card-field">
          <label className="card-field-label">Country</label>
          <select style={{ flex: 1, background: "transparent", border: 0, outline: "none", color: "var(--on-surface)", fontSize: 15 }} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="NG">Nigeria</option>
            <option value="CA">Canada</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="IN">India</option>
            <option value="KE">Kenya</option>
            <option value="ZA">South Africa</option>
          </select>
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

function DonateCampaignBanner({ campaign, stats, rate }: { campaign: { goal: number }; stats: { raised: number }; rate: number }) {
  const pct = (stats.raised / campaign.goal) * 100;
  return (
    <div className="donate-banner">
      <div className="donate-banner-row">
        <div className="raised">
          <span className="raised-amount">{"₦"}{formatNGN(stats.raised, rate)}</span>
          raised of <Money usd={campaign.goal} rate={rate} size="sm" hideUsd decimals={0} />
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

export function DonatePage({ campaign, stats, onBack, onSuccess, donateConfig, rate }: DonatePageProps) {
  const methods = donateConfig.methods;
  const [method, setMethod] = useState(methods[0]?.id || "card");
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("idle");
  const [recurring, setRecurring] = useState(false);
  const [cardForm, setCardForm] = useState<CardForm>({ email: "", card: "", expiry: "", cvc: "", country: "US", zip: "" });

  const presets = method === "card" ? PRESET_NGN : selectedToken.native || selectedToken.symbol === "WETH" ? PRESET_ETH : PRESET_USD;

  const handleDonate = () => {
    if (!amount || parseFloat(amount) <= 0) return;
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
    } else {
      if (selectedToken.symbol === "USDC" || selectedToken.native) {
        setStep("donating");
        setTimeout(() => setStep("confirming"), 900);
        setTimeout(() => onSuccess({
          amount, tokenSymbol: selectedToken.symbol, method: "crypto",
          txHash: "0x9f3a" + Math.random().toString(16).slice(2, 10) + "…b2e1",
        }), 2200);
      } else {
        setStep("approving");
        setTimeout(() => setStep("donating"), 1200);
        setTimeout(() => setStep("confirming"), 2100);
        setTimeout(() => onSuccess({
          amount, tokenSymbol: selectedToken.symbol, method: "crypto",
          txHash: "0x9f3a" + Math.random().toString(16).slice(2, 10) + "…b2e1",
        }), 3300);
      }
    }
  };

  const processing = step !== "idle" && step !== "error";
  const tokenSymbolForUi = method === "card" ? "NGN" : selectedToken.symbol;

  const ctaLabel = (() => {
    if (step === "charging") return "Verifying card…";
    if (step === "processing") return "Processing payment…";
    if (step === "approving") return "Approving…";
    if (step === "donating") return "Donating…";
    if (step === "confirming") return "Confirming…";
    if (step === "error") return "Check details and retry";
    if (method === "card") {
      const ngnAmt = parseFloat(amount) || 0;
      return ngnAmt > 0 ? `Donate ₦${new Intl.NumberFormat("en-NG").format(Math.round(ngnAmt))} with card` : "Donate with card";
    }
    const amt = amount ? `${parseFloat(amount).toFixed(4).replace(/\.?0+$/, "")}` : "";
    return `Donate ${amt} ${tokenSymbolForUi}`;
  })();

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
                  style={{ display: "flex", flexDirection: "column", gap: 40 }}
                >
                  <DonateTokenSelector selectedToken={selectedToken} onSelect={(t) => { setSelectedToken(t); setAmount(""); }} />
                  <DonateAmountInput amount={amount} onChange={setAmount} tokenSymbol={selectedToken.symbol} presets={presets} activeAmount={amount} rate={rate} />
                  <DonateCrossChainInfo />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {amount && parseFloat(amount) > 0 && (
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
            {step === "charging" && <StepBanner step={1} total={2} label="Verifying card…" sub="Checking with your bank" />}
            {step === "processing" && <StepBanner step={2} total={2} label="Processing payment…" sub="Converting to USDC for the campaign" />}
            {step === "approving" && <StepBanner step={1} total={2} label="Approving token spend…" sub="Please confirm in your wallet" />}
            {step === "donating" && <StepBanner step={2} total={2} label="Submitting donation…" sub="Please confirm in your wallet" />}
            {step === "confirming" && <StepBanner step={2} total={2} label="Confirming on chain…" sub="Waiting for block confirmation" />}
            {step === "error" && (
              <div className="step-banner" style={{ background: "rgba(220, 38, 38, .1)", borderColor: "rgba(220, 38, 38, .3)" }}>
                <Icon name="error" style={{ animation: "none", color: "#f87171" }} />
                <div>
                  <div className="l1">Couldn&apos;t process that</div>
                  <div className="l2">Double-check your card number, expiry, and CVC.</div>
                </div>
              </div>
            )}
            <button className="btn-tertiary-cta" onClick={handleDonate} disabled={!amount || parseFloat(amount) <= 0 || processing}>
              {processing ? (
                <>
                  <Icon name="progress_activity" className="spin" />
                  {ctaLabel}
                </>
              ) : (
                <>
                  <Icon name={method === "card" ? "credit_card" : "favorite"} fill={method === "card" ? 0 : 1} />
                  {ctaLabel}
                </>
              )}
            </button>
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
