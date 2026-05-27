"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useBalance,
  useReadContract,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDonate } from "../hooks/useDonate";
import { useCampaignStats } from "../hooks/useCampaignStats";
import { TopNavBar } from "../components/sections/TopNavBar";
import { Footer } from "../components/sections/Footer";
import { CrossChainDonate } from "../components/CrossChainDonate";
import { DonateCampaignBanner } from "../components/sections/DonateCampaignBanner";
import { DonateManualSection } from "../components/sections/DonateManualSection";
import { DonateTransparencyNote } from "../components/sections/DonateTransparencyNote";
import { DonateSuccessScreen } from "../components/sections/DonateSuccessScreen";
import {
  SUPPORTED_TOKENS,
  SOURCE_CHAINS,
  isBaseChain,
  PRESET_AMOUNTS,
  PRESET_AMOUNTS_ETH,
  MIN_DONATION_USD,
  MAX_DONATION_USD,
  HIGH_VALUE_USD,
  CONTRACT_ADDRESSES,
  TARGET_CHAIN_ID,
  ERC20_ABI,
  type TokenInfo,
} from "../lib/contracts";
import type { Address } from "viem";

// ─── Config ───────────────────────────────────────────────────────────────

// NGN/USD rate — TODO: replace with live rate (CoinGecko, openexchangerates, etc.)
const NGN_USD_RATE = 1600;
const PRESET_NGN = [1000, 5000, 10000, 25000];

const METHODS = [
  { id: "transfer", icon: "account_balance",        label: "Transfer" },
  { id: "crypto",   icon: "account_balance_wallet", label: "Crypto" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

const fmtNGN = (n: number) =>
  new Intl.NumberFormat("en-NG").format(Math.round(n));
const fmtUSD = (n: number, decimals = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

// ─── Main Page ────────────────────────────────────────────────────────────

export default function DonatePage() {
  const { address, isConnected, chain } = useAccount();
  const stats = useCampaignStats();
  const donate = useDonate();

  // Method tab state
  const [method, setMethod] = useState<"transfer" | "crypto">("transfer");
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNgnAmount, setTransferNgnAmount] = useState("");

  // Return prompt (visibility-aware transfer confirmation)
  const [showReturnPrompt, setShowReturnPrompt] = useState(false);
  const departedAt = useRef<number>(0);
  const opayArmed = useRef(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const promptDismissed = useRef(false);

  const armOPayTracking = useCallback(() => {
    opayArmed.current = true;
    departedAt.current = 0;
    promptDismissed.current = false;
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    fallbackTimer.current = setTimeout(() => {
      if (opayArmed.current && !promptDismissed.current && parseFloat(transferNgnAmount) > 0) {
        setShowReturnPrompt(true);
      }
    }, 150_000);
  }, [transferNgnAmount]);

  useEffect(() => {
    const handler = () => {
      if (!opayArmed.current) return;
      if (document.visibilityState === "hidden") {
        departedAt.current = Date.now();
      } else if (departedAt.current > 0) {
        const awayMs = Date.now() - departedAt.current;
        departedAt.current = 0;
        if (awayMs >= 30_000 && !promptDismissed.current && parseFloat(transferNgnAmount) > 0) {
          setTimeout(() => setShowReturnPrompt(true), 2000);
          opayArmed.current = false;
          if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
        }
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => {
      document.removeEventListener("visibilitychange", handler);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, [transferNgnAmount]);

  const handleReturnConfirm = () => {
    setShowReturnPrompt(false);
    opayArmed.current = false;
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    setTransferAmount(transferNgnAmount);
    setTransferSuccess(true);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const handleReturnDismiss = () => {
    setShowReturnPrompt(false);
    promptDismissed.current = true;
    opayArmed.current = true;
    departedAt.current = 0;
  };

  // Crypto state (from file 1)
  const [selectedToken, setSelectedToken] = useState<TokenInfo>(SUPPORTED_TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [isApprovalStep, setIsApprovalStep] = useState(false);
  const [showHighValueWarning, setShowHighValueWarning] = useState(false);
  const [hasPendingCctp, setHasPendingCctp] = useState(false);

  useEffect(() => {
    if (!address) { setHasPendingCctp(false); return; }
    try {
      setHasPendingCctp(!!localStorage.getItem(`cctp_pending_${address.toLowerCase()}`));
    } catch {}
  }, [address]);

  // ── Testnet faucet ──
  const publicClient = usePublicClient({ chainId: TARGET_CHAIN_ID });
  const { writeContract: mintToken, data: mintTxHash, isPending: isMinting, reset: resetMint } = useWriteContract();
  const { isSuccess: mintSuccess } = useWaitForTransactionReceipt({
    hash: mintTxHash, chainId: TARGET_CHAIN_ID,
  });

  const { data: tokenBalanceData, refetch: refetchTokenBalance } = useReadContract({
    address:      selectedToken.isNative ? undefined : selectedToken.address as Address,
    abi:          ERC20_ABI,
    functionName: "balanceOf",
    args:         address ? [address] : undefined,
    chainId:      TARGET_CHAIN_ID,
    query:        { enabled: !!address && !selectedToken.isNative, refetchInterval: 10_000 },
  });

  useEffect(() => {
    if (mintSuccess) {
      donate.refetchBalance();
      donate.refetchAllowance();
      refetchTokenBalance();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintSuccess]);

  const handleMintTestToken = async (tokenAddress: Address, mintAmount: bigint) => {
    if (!address) return;
    const params = {
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "mint" as const,
      args: [address, mintAmount] as const,
      chainId: TARGET_CHAIN_ID,
    };
    let gas: bigint | undefined;
    if (publicClient) {
      try {
        const { request } = await publicClient.simulateContract({ ...params, account: address });
        if (request.gas && request.gas <= 1_000_000n) gas = request.gas;
      } catch { /* fall through */ }
    }
    mintToken({ ...params, gas: gas ?? 100_000n });
  };

  const { data: ethBalance } = useBalance({
    address, chainId: TARGET_CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const [ethPriceUSD, setEthPriceUSD] = useState<number | null>(null);
  useEffect(() => {
    if (!selectedToken.isNative && selectedToken.symbol !== "WETH") return;
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
      .then((r) => r.json())
      .then((d) => setEthPriceUSD(d?.ethereum?.usd ?? null))
      .catch(() => {});
  }, [selectedToken.symbol]);

  const usdcDecimals = selectedToken.decimals;
  const parsedAmount = (() => {
    if (!amount) return 0n;
    const parts = amount.split(".");
    const whole = parts[0] || "0";
    const frac = (parts[1] || "").padEnd(usdcDecimals, "0").slice(0, usdcDecimals);
    try {
      const result = BigInt(whole) * BigInt(10 ** usdcDecimals) + BigInt(frac);
      // FE-H2: Cap only applies to 6-decimal tokens (USDC).
      if (selectedToken.decimals === 6) {
        const cap = BigInt(MAX_DONATION_USD) * 1_000_000n;
        return result > cap ? 0n : result;
      }
      return result;
    } catch {
      return 0n;
    }
  })();

  const isOnForeignChain = !!chain && !isBaseChain(chain.id);
  const isOnUnknownChain = !!chain && !SOURCE_CHAINS.find((c) => c.chainId === chain.id);
  const displaySymbol = selectedToken.symbol;

  // FE-H1: Watch `address` so state resets on disconnect AND wallet switch.
  useEffect(() => {
    if (!address) {
      setAmount("");
      setIsApprovalStep(false);
      setShowHighValueWarning(false);
      donate.reset();
    } else {
      donate.refetchBalance();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    if (donate.isSuccess && isApprovalStep) {
      setIsApprovalStep(false);
      donate.proceedAfterApproval(
        selectedToken.address as Address,
        parsedAmount,
        selectedToken.symbol === "USDC"
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donate.isSuccess]);

  useEffect(() => {
    if (donate.step === "approving") setIsApprovalStep(true);
    if (donate.step === "success")   setIsApprovalStep(false);
  }, [donate.step]);

  // ── Handlers ──
  const handleMethodChange = (m: string) => {
    setMethod(m as typeof method);
    setAmount("");
    setShowHighValueWarning(false);
  };

  const handleTokenSelect = (token: TokenInfo) => {
    setSelectedToken(token);
    setAmount("");
    resetMint();
  };

  const handleDonate = () => {
    // ── Transfer ──
    if (method === "transfer") {
      if (!amount || parseFloat(amount) <= 0) return;
      setTransferAmount(amount);
      setTransferSuccess(true);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }

    // ── Crypto (file 1's logic) ──
    if (!parsedAmount || parsedAmount === 0n) return;
    if (!showHighValueWarning && parseFloat(amount) >= HIGH_VALUE_USD) {
      setShowHighValueWarning(true);
      return;
    }
    setShowHighValueWarning(false);

    if (selectedToken.isNative) {
      donate.donateETH(parsedAmount);
    } else if (selectedToken.address === SUPPORTED_TOKENS[0].address) {
      donate.donateUSDC(parsedAmount);
    } else {
      donate.donateERC20(selectedToken.address as Address, parsedAmount);
    }
  };

  // ── Success screens ──
  if (donate.step === "success") {
    return (
      <DonateSuccessScreen
        txHash={donate.txHash}
        amount={amount}
        token={selectedToken.symbol}
        onReset={donate.reset}
      />
    );
  }

  if (transferSuccess) {
    return (
      <TransferSuccessScreen
        amount={transferAmount}
        rate={NGN_USD_RATE}
        onBack={() => { setTransferSuccess(false); setTransferAmount(""); setAmount(""); }}
        onAnother={() => { setTransferSuccess(false); setTransferAmount(""); setAmount(""); }}
      />
    );
  }

  // ── Derived UI state ──
  const processing = method === "crypto" && donate.isProcessing;

  const presets =
    method === "transfer"
      ? PRESET_NGN
      : selectedToken.isNative || selectedToken.symbol === "WETH"
        ? PRESET_AMOUNTS_ETH
        : PRESET_AMOUNTS;

  const ctaLabel = (() => {
    if (method === "transfer") {
      const ngnAmt = parseFloat(amount) || 0;
      return ngnAmt > 0 ? `I've sent ₦${fmtNGN(ngnAmt)}` : "Confirm transfer";
    }
    // Crypto
    if (donate.step === "approving")  return "Approving…";
    if (donate.step === "donating")   return "Donating…";
    if (donate.step === "confirming") return "Confirming…";
    const amt = amount ? parseFloat(amount).toFixed(4).replace(/\.?0+$/, "") : "";
    return amt ? `Donate ${amt} ${displaySymbol}` : "Donate Now";
  })();

  const showCTA =
    method !== "crypto" ||
    (isConnected && !isOnForeignChain && !hasPendingCctp && !isOnUnknownChain && !isApprovalStep);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-container-lowest)" }}>
      <TopNavBar />

      <main className="donate-main">
        <div className="donate-wrap">
          {/* 1. Campaign Banner */}
          <DonateCampaignBanner />

          {/* 2. Title */}
          <div className="donate-title-area">
            <div className="donate-title-icon">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
            </div>
            <h1 className="donate-title">Make a Donation</h1>
            <p className="donate-title-sub">
               Every naira goes directly to keeping this family alive, dialysis, surgery, medication, and recovery. No platform fees. No middlemen.
            </p>
          </div>

          {/* Goal reached */}
          {stats.maxGoalReached && (
            <div
              className="step-banner"
              style={{
                background: "rgba(16, 185, 129, .1)",
                borderColor: "rgba(16, 185, 129, .3)",
                flexDirection: "column",
                textAlign: "center",
                padding: 24, gap: 12,
              }}
            >
              <div style={{ fontSize: 32 }}>🎉</div>
              <div>
                <div className="l1" style={{ color: "#10b981" }}>Campaign Goal Reached!</div>
                <div className="l2">
                  The campaign has raised its full goal of ${stats.goalMaxFormatted} USDC.
                  No further donations are being accepted. Thank you to everyone who contributed!
                </div>
              </div>
            </div>
          )}

          {/* 3. Main donation card with tabs */}
          {!stats.maxGoalReached && (
            <section className="donate-card">
              <div className="donate-card-glow1" />
              <div className="donate-card-glow2" />

              <PayMethodTabs method={method} onChange={handleMethodChange} methods={METHODS} />

              {/* ── Transfer Tab ── */}
              {method === "transfer" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                  {/*<div className="donate-section">
                    <label className="donate-label">How much are you sending?</label>
                    <div className="amount-input-wrap">
                      <span style={{ fontSize: 18, fontWeight: 700, color: "var(--on-surface-variant)", padding: "0 0 0 16px" }}>₦</span>
                      <input type="text" inputMode="decimal" value={transferNgnAmount} onChange={(e) => setTransferNgnAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" className="amount-input" aria-label="Amount in Naira" />
                    </div>
                    <div className="preset-row" style={{ marginTop: 12 }}>
                      {PRESET_NGN.map((p) => (
                        <button key={p} className={`preset-btn${parseFloat(transferNgnAmount) === p ? " active" : ""}`} onClick={() => setTransferNgnAmount(p.toString())}>
                          ₦{fmtNGN(p)}
                        </button>
                      ))}
                    </div>
                  </div>*/}
                  <BankTransferDetails onOPayLaunched={armOPayTracking} />
                  {parseFloat(transferNgnAmount) > 0 && (
                    <button
                      className="btn-tertiary-cta"
                      onClick={() => { setTransferAmount(transferNgnAmount); setTransferSuccess(true); window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }}
                    >
                      I{"'"}ve sent ₦{fmtNGN(parseFloat(transferNgnAmount))}
                    </button>
                  )}
                </div>
              )}

              {/* ── Crypto Tab (file 1's full flow) ── */}
              {method === "crypto" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  {/* Unknown chain */}
                  {isConnected && isOnUnknownChain && (
                    <div className="step-banner" style={{ background: "rgba(245, 158, 11, .1)", borderColor: "rgba(245, 158, 11, .3)" }}>
                      <span className="material-symbols-outlined" style={{ color: "#fbbf24", animation: "none" }}>warning</span>
                      <div>
                        <div className="l1" style={{ color: "#fbbf24" }}>Unsupported network</div>
                        <div className="l2">Switch to Base Sepolia, Ethereum, Polygon, Arbitrum, or Optimism.</div>
                      </div>
                    </div>
                  )}

                  {/* Not connected */}
                  {!isConnected && (
                    <div className="crypto-connect-gate" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 0" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 40, color: "var(--primary)", opacity: 0.7 }}>account_balance_wallet</span>
                      <p style={{ color: "var(--on-surface-variant)", margin: 0 }}>Connect your wallet to donate crypto.</p>
                      <ConnectButton />
                    </div>
                  )}

                  {/* Cross-chain mode */}
                  {isConnected && (isOnForeignChain || hasPendingCctp) && !isOnUnknownChain && (
                    <CrossChainDonate
                      onSuccess={() => { donate.reset(); setHasPendingCctp(false); }}
                      onPendingTransfer={() => setHasPendingCctp(true)}
                      onReset={() => setHasPendingCctp(false)}
                    />
                  )}

                  {/* Same-chain mode */}
                  {isConnected && !isOnForeignChain && !hasPendingCctp && !isOnUnknownChain && (
                    <>
                      <TokenSelector selectedToken={selectedToken} onSelect={handleTokenSelect} />
                      <AmountInput
                        amount={amount} onChange={setAmount}
                        tokenSymbol={selectedToken.symbol} presets={presets} rate={NGN_USD_RATE}
                      />

                      {/* ETH/WETH USD equiv */}
                      {(selectedToken.isNative || selectedToken.symbol === "WETH") && amount && ethPriceUSD && (
                        <p style={{ margin: "-16px 4px 0", fontSize: 13, color: "var(--on-surface-variant)" }}>
                          ≈ ${(parseFloat(amount) * ethPriceUSD).toFixed(2)} USD
                        </p>
                      )}

                      {/* Token balance */}
                      {address && !selectedToken.isNative && tokenBalanceData !== undefined && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--on-surface-variant)", marginTop: -16 }}>
                          <span>
                            Balance: {(Number(tokenBalanceData) / 10 ** selectedToken.decimals).toFixed(selectedToken.decimals === 6 ? 2 : 4)} {displaySymbol}
                          </span>
                          {/* Testnet faucet  
                          <button
                            onClick={() => handleMintTestToken(selectedToken.address as Address, BigInt(1000) * BigInt(10 ** selectedToken.decimals))}
                            disabled={isMinting}
                            style={{ color: "var(--primary)", cursor: "pointer", background: "none", border: "none" }}
                          >
                            {isMinting ? "Minting…" : `Mint 1,000 ${displaySymbol} (testnet)`}
                          </button>*/}
                          <div></div>
                        </div>
                      )}

                      {/* ETH balance */}
                      {address && selectedToken.isNative && ethBalance && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--on-surface-variant)", marginTop: -16 }}>
                          <span>Balance: {parseFloat(ethBalance.formatted).toFixed(4)} ETH</span>
                        </div>
                      )}

                      {/* Summary */}
                      {amount && parseFloat(amount) > 0 && (
                        <SummaryCard amount={amount} tokenSymbol={selectedToken.symbol} method="crypto" rate={NGN_USD_RATE} />
                      )}

                      <CrossChainInfo />

                      {/* High-value warning */}
                      {showHighValueWarning && !donate.isProcessing && (
                        <div className="step-banner" style={{ background: "rgba(245, 158, 11, .1)", borderColor: "rgba(245, 158, 11, .3)", flexDirection: "column", alignItems: "stretch", gap: 12, padding: 16 }}>
                          <div>
                            <div className="l1" style={{ color: "#fbbf24" }}>Confirm large donation</div>
                            <div className="l2">
                              You are about to donate <strong style={{ color: "var(--on-surface)" }}>{amount} {displaySymbol}</strong>. This transaction is permanent and non-refundable. Are you sure?
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={handleDonate}
                              style={{ flex: 1, background: "var(--tertiary-container)", color: "var(--on-tertiary-container)", fontWeight: 500, padding: "10px 12px", borderRadius: 12, cursor: "pointer", border: "none", fontSize: 14 }}
                            >
                              Yes, donate {amount} {displaySymbol}
                            </button>
                            <button
                              onClick={() => setShowHighValueWarning(false)}
                              style={{ flex: 1, border: "1px solid var(--outline-variant)", background: "var(--surface-container-high)", color: "var(--on-surface)", fontWeight: 500, padding: "10px 12px", borderRadius: 12, cursor: "pointer", fontSize: 14 }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      {donate.errorMsg && (
                        <div className="step-banner" style={{ background: "rgba(220, 38, 38, .1)", borderColor: "rgba(220, 38, 38, .3)" }}>
                          <span className="material-symbols-outlined" style={{ color: "#f87171", animation: "none" }}>error</span>
                          <div>
                            <div className="l1" style={{ color: "#f87171" }}>Transaction failed</div>
                            <div className="l2">{donate.errorMsg}</div>
                          </div>
                        </div>
                      )}

                      {/* Step indicators */}
                      {donate.step === "approving"  && <StepBanner step={1} total={2} label="Approving token spend…"  sub="Please confirm in your wallet" />}
                      {donate.step === "donating"   && <StepBanner step={2} total={2} label="Submitting donation…"     sub="Please confirm in your wallet" />}
                      {donate.step === "confirming" && <StepBanner step={2} total={2} label="Confirming on chain…"     sub="Waiting for block confirmation" />}
                      {donate.isSuccess && isApprovalStep && <StepBanner step={2} total={2} label="Submitting donation…" sub="Approval confirmed — sending donation now" />}
                    </>
                  )}
                </div>
              )}

              {/* Shared CTA */}
              {showCTA && (
                <button
                  onClick={handleDonate}
                  disabled={
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    processing ||
                    (method === "crypto" && (
                      (!selectedToken.isNative &&
                        selectedToken.symbol !== "WETH" &&
                        (parseFloat(amount) < MIN_DONATION_USD ||
                          parseFloat(amount) > MAX_DONATION_USD)) ||
                      showHighValueWarning
                    ))
                  }
                  className="btn-tertiary-cta"
                  aria-label={ctaLabel}
                >
                  {processing ? (
                    <>
                      <span className="material-symbols-outlined spin">progress_activity</span>
                      {ctaLabel}
                    </>
                  ) : (
                    <>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {method === "crypto" ? "favorite" : "check"}
                      </span>
                      {ctaLabel}
                    </>
                  )}
                </button>
              )}

              <TrustStrip method={method} />
            </section>
          )}

          {/* 4. Manual + Transparency — crypto context only */}
          {!stats.maxGoalReached && method === "crypto" && (
            <>
              <DonateManualSection />
              <DonateTransparencyNote />
            </>
          )}
        </div>
      </main>

      <Footer />

      {showReturnPrompt && (
        <div className="rp-backdrop" onClick={handleReturnDismiss}>
          <div className="rp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="rp-handle" />
            <div className="rp-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <p className="rp-title">Welcome back</p>
            <p className="rp-sub">
              Did you complete your{" "}
              {parseFloat(transferNgnAmount) > 0
                ? `₦${fmtNGN(parseFloat(transferNgnAmount))}`
                : ""}{" "}
              transfer?
            </p>
            <div className="rp-actions">
              <button className="rp-btn secondary" onClick={handleReturnDismiss}>Not yet</button>
              <button className="rp-btn primary" onClick={handleReturnConfirm}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
                Yes, I sent it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

function PayMethodTabs({
  method, onChange, methods,
}: {
  method: string;
  onChange: (m: string) => void;
  methods: { id: string; icon: string; label: string }[];
}) {
  const activeIdx = methods.findIndex((m) => m.id === method);
  return (
    <div className="method-tabs" style={{ position: "relative" }}>
      <div
        className="method-tab-indicator"
        style={{
          position: "absolute",
          top: 4, bottom: 4,
          left: `calc(${activeIdx} * (100% - 8px) / ${methods.length} + 4px)`,
          width: `calc((100% - 8px) / ${methods.length})`,
          borderRadius: 10,
          background: "var(--surface-container-high)",
          boxShadow: "0 1px 0 rgba(255,255,255,.06) inset",
          transition: "left 200ms cubic-bezier(.4,0,.2,1)",
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
          <span className="material-symbols-outlined">{m.icon}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}

function TrustStrip({ method }: { method: string }) {
  return (
    <div className="trust-strip">
      {method === "transfer" ? (
        <>
          <span><span className="material-symbols-outlined">verified_user</span>Bank-verified transfer</span>
          <span><span className="material-symbols-outlined">receipt_long</span>Receipt by SMS</span>
          <span><span className="material-symbols-outlined">support_agent</span>Support 24/7</span>
        </>
      ) : (
        <>
          <span><span className="material-symbols-outlined">link</span>Non-custodial</span>
          <span><span className="material-symbols-outlined">verified_user</span>On-chain receipt NFT</span>
          <span><span className="material-symbols-outlined">public</span>Public ledger</span>
        </>
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

function BankTransferDetails({ onOPayLaunched }: { onOPayLaunched?: () => void }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [launchState, setLaunchState] = useState<"idle" | "copied" | "launched">("idle");

  const copy = (text: string, field: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    onOPayLaunched?.();
  };

  const handleCopyAndOpen = () => {
    navigator.clipboard?.writeText("6557984463");
    setLaunchState("copied");
    onOPayLaunched?.();
    setTimeout(() => {
      setLaunchState("launched");
      const isAndroid = /android/i.test(navigator.userAgent);
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isAndroid) {
        window.location.href =
          "intent://business#Intent;scheme=opay;package=team.opay.pay;" +
          "S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dteam.opay.pay;end";
      } else if (isIOS) {
        window.location.href = "opay://";
        setTimeout(() => {
          if (document.visibilityState !== "hidden") {
            window.location.href = "https://apps.apple.com/app/id1463776084";
          }
        }, 2500);
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
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {copiedField === "number" ? "check" : "content_copy"}
              </span>
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
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {copiedField === "name" ? "check" : "content_copy"}
              </span>
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
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
            </>
          )}
          {launchState === "copied" && (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
              <span>Account number copied, opening OPay...</span>
            </>
          )}
          {launchState === "launched" && (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
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

function TokenSelector({
  selectedToken, onSelect,
}: {
  selectedToken: TokenInfo;
  onSelect: (t: TokenInfo) => void;
}) {
  return (
    <div className="donate-section">
      <label className="donate-label">Select Asset</label>
      <div className="token-row">
        {SUPPORTED_TOKENS.map((t) => (
          <button
            key={t.symbol}
            className={`token-btn${selectedToken.symbol === t.symbol ? " active" : ""}`}
            onClick={() => onSelect(t)}
          >
            {t.symbol}
          </button>
        ))}
      </div>
      {selectedToken.symbol !== "USDC" && (
        <p className="token-note">
          {selectedToken.symbol} will be automatically swapped to USDC via DEX.
        </p>
      )}
    </div>
  );
}

function AmountInput({
  amount, onChange, tokenSymbol, presets, rate,
}: {
  amount: string;
  onChange: (v: string) => void;
  tokenSymbol: string;
  presets: readonly number[];
  rate: number;
}) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    onChange(parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized);
  };
  const numericAmount = parseFloat(amount) || 0;
  const isNgn = tokenSymbol === "NGN";
  const isEthLike = tokenSymbol === "ETH" || tokenSymbol === "WETH";
  return (
    <div className="donate-section">
      <label className="donate-label">Amount</label>
      <div className="amount-input-wrap">
        <input
          type="text" inputMode="decimal"
          value={amount} onChange={handle}
          placeholder={isNgn ? "0" : "0.00"}
          className="amount-input"
          aria-label="Donation amount"
        />
        <div className="amount-input-suffix">{isNgn ? "₦" : tokenSymbol}</div>
      </div>
      {isNgn && rate && numericAmount > 0 && (
        <p style={{ margin: "8px 4px 0", fontSize: 13, color: "var(--on-surface-variant)" }}>
          ≈ ${fmtUSD(numericAmount / rate)} USD
        </p>
      )}
      <div className="preset-row">
        {presets.map((p) => (
          <button
            key={p}
            className={`preset-btn${parseFloat(amount) === p ? " active" : ""}`}
            onClick={() => onChange(p.toString())}
          >
            {isNgn ? `₦${fmtNGN(p)}` : isEthLike ? p : `$${p}`}
            {isNgn && rate && (
              <span style={{ display: "block", fontSize: 10, color: "var(--on-surface-variant)", fontWeight: 400, marginTop: 2 }}>
                ≈ ${fmtUSD(p / rate, 0)}
              </span>
            )}
          </button>
        ))}
      </div>
      {isNgn && amount && numericAmount > 0 && numericAmount / rate < MIN_DONATION_USD && (
        <p style={{ color: "#fbbf24", fontSize: 12, margin: "8px 0 0" }}>
          Minimum donation is ₦{fmtNGN(Math.ceil(MIN_DONATION_USD * rate))}
        </p>
      )}
    </div>
  );
}

function SummaryCard({
  amount, tokenSymbol, method, rate,
}: {
  amount: string;
  tokenSymbol: string;
  method: string;
  rate: number;
}) {
  const isTransfer = method === "transfer";
  const rawNum = parseFloat(amount) || 0;
  const usdAmount = isTransfer ? rawNum / rate : rawNum;
  const ngnAmount = isTransfer ? rawNum : rawNum * rate;
  const feeUsd = isTransfer ? 0 : 0.15;
  const netUsd = Math.max(usdAmount - feeUsd, 0);
  const netNgn = isTransfer ? ngnAmount : Math.max(ngnAmount - feeUsd * rate, 0);

  return (
    <div className="summary-card">
      <div className="summary-row">
        <span className="l">You donate</span>
        {isTransfer ? (
          <span className="v" style={{ fontWeight: 700 }}>
            ₦{fmtNGN(ngnAmount)}{" "}
            <span style={{ fontSize: 11, color: "var(--on-surface-variant)", fontWeight: 400 }}>
              ≈ ${fmtUSD(usdAmount)}
            </span>
          </span>
        ) : (
          <span className="v" style={{ fontWeight: 700 }}>${fmtUSD(usdAmount)} {tokenSymbol}</span>
        )}
      </div>
      {feeUsd > 0 && (
        <div className="summary-row muted">
          <span className="l">Estimated gas</span>
          <span className="v fee">−${fmtUSD(feeUsd)}</span>
        </div>
      )}
      <div className="summary-row">
        <span className="l">Campaign receives</span>
        {isTransfer ? (
          <span className="v" style={{ fontWeight: 700 }}>
            ₦{fmtNGN(netNgn)}{" "}
            <span style={{ fontSize: 11, color: "var(--on-surface-variant)", fontWeight: 400 }}>
              ≈ ${fmtUSD(netUsd)}
            </span>
          </span>
        ) : (
          <span className="v" style={{ fontWeight: 700 }}>${fmtUSD(netUsd)} {tokenSymbol}</span>
        )}
      </div>
      <div className="summary-row summary-divider">
        <span className="l" style={{ color: "rgba(195, 198, 215, .6)" }}>
          {isTransfer ? "Settlement" : "Network"}
        </span>
        <span style={{ color: "var(--on-surface)", fontWeight: 700 }}>
          {isTransfer ? (
            <>
              <OPayLogo size={12} />
              <span style={{ marginLeft: 4 }}>OPay → USDC on Base</span>
            </>
          ) : (
            <>
              <span className="summary-network-dot" />Base
            </>
          )}
        </span>
      </div>
    </div>
  );
}

function CrossChainInfo() {
  const [open, setOpen] = useState(false);
  const chains = ["Ethereum", "Arbitrum", "Optimism"];
  return (
    <div className="crosschain-collapse">
      <button className="crosschain-head" onClick={() => setOpen(!open)}>
        <div className="crosschain-head-l">
          <span className="material-symbols-outlined">swap_horiz</span>
          Donating from another chain?
        </div>
        <span className={`material-symbols-outlined crosschain-chev${open ? " open" : ""}`}>
          expand_more
        </span>
      </button>
      {open && (
        <div className="crosschain-body">
          <p>
            You can donate USDC directly from Ethereum, Arbitrum, or Optimism — no
            manual bridging needed. USDC is burned on your chain and natively
            minted on Base via <b>Circle CCTP</b>.
          </p>
          <div className="chain-chips">
            {chains.map((c) => <span key={c} className="chain-chip">{c}</span>)}
          </div>
          <ol>
            <li><span className="num">1</span><span>Switch your wallet to Ethereum, Arbitrum, or Optimism.</span></li>
            <li><span className="num">2</span><span>This page auto-detects the switch and shows the cross-chain donation form.</span></li>
            <li><span className="num">3</span><span>Approve USDC, then confirm the burn. Takes ~2 min on L2, ~13 min on Ethereum.</span></li>
            <li><span className="num">4</span><span>Switch to Base and click &quot;Complete donation&quot; to mint USDC and credit your donation.</span></li>
          </ol>
          <div className="fee-note">
            <span className="material-symbols-outlined">check_circle</span>
            <p>No bridge fee. You only pay source-chain gas — Circle&apos;s CCTP has no protocol fee.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StepBanner({
  step, total, label, sub,
}: {
  step: number; total: number; label: string; sub: string;
}) {
  return (
    <div className="step-banner">
      <span className="material-symbols-outlined spin">progress_activity</span>
      <div>
        <div className="l1">Step {step}/{total}: {label}</div>
        <div className="l2">{sub}</div>
      </div>
    </div>
  );
}

function TransferSuccessScreen({
  amount, rate, onBack, onAnother,
}: {
  amount: string;
  rate: number;
  onBack: () => void;
  onAnother: () => void;
}) {
  const ngnAmt = parseFloat(amount) || 0;
  const usdAmt = rate > 0 ? ngnAmt / rate : 0;
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="ts-screen" style={{ minHeight: "100vh", background: "var(--surface-container-lowest)" }}>
      <TopNavBar />
      <main className="ts-main">
        <div className="ts-bg-glow" />
        <div className="ts-card">
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
              <path className="ts-check-path" d="M8 18.5L15 25.5L28 11" stroke="url(#check-grad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="check-grad" x1="8" y1="11" x2="28" y2="25.5">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="ts-headline">Thank you for your generosity</h1>
          <p className="ts-amount">₦{fmtNGN(ngnAmt)}</p>
          <p className="ts-equiv">≈ ${fmtUSD(usdAmt)} USD</p>

          <div className="ts-divider" />

          <div className="ts-flow">
            <div className="ts-flow-item">
              <div className="ts-flow-icon">
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>schedule</span>
              </div>
              <div className="ts-flow-text">
                <span className="ts-flow-label">Status</span>
                <span className="ts-flow-value ts-pending">Pending verification</span>
              </div>
            </div>
            <div className="ts-flow-item">
              <div className="ts-flow-icon">
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>account_balance</span>
              </div>
              <div className="ts-flow-text">
                <span className="ts-flow-label">Destination</span>
                <span className="ts-flow-value">OPay · ****4463</span>
              </div>
            </div>
            <div className="ts-flow-item">
              <div className="ts-flow-icon">
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>info</span>
              </div>
              <div className="ts-flow-text">
                <span className="ts-flow-label">What happens next</span>
                <span className="ts-flow-value">We verify your transfer and add you to the donor wall</span>
              </div>
            </div>
          </div>

          <div className="ts-name-area">
            {!submitted ? (
              <>
                <p className="ts-name-prompt">
                  Leave your name for the family <span className="ts-optional">(optional)</span>
                </p>
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
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                    
                  </button>
                </div>
              </>
            ) : (
              <div className="ts-name-confirmed">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#10b981" }}>check_circle</span>
                <span>Thank you, {name}. The family will see your name.</span>
              </div>
            )}
          </div>

          <div className="ts-actions">
            <button className="ts-btn-primary"  onClick={onAnother}>Donate again</button>
            <button className="ts-btn-secondary" onClick={onBack}>Return to campaign</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}