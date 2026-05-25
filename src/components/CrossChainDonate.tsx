"use client";

/**
 * CrossChainDonate — Circle CCTP cross-chain donation.
 * Shown when the connected wallet is on Ethereum, Optimism, Arbitrum, or their testnets.
 *
 * Flow:
 *   Phase 1 (source chain): Approve USDC → depositForBurn → extract MessageSent
 *   Phase 2 (Circle API):   Poll iris-api.circle.com for attestation
 *   Phase 3 (Base):         Switch chain → completeTransfer → donation credited
 */

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { base, baseSepolia } from "wagmi/chains";
import type { Address } from "viem";
import { Icon } from "./Icon";
import { TokenIcon } from "./TokenIcon";
import { useCrossChainDonate } from "@/hooks/useCrossChainDonate";
import { ERC20_ABI, getSourceChain, getExplorerUrl, USDC_DECIMALS, TARGET_CHAIN_ID } from "@/lib/contracts";

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

interface CrossChainDonateProps {
  /** Called when the mint confirms on Base — parent navigates to success */
  onSuccess?: (txHash: `0x${string}` | undefined, amount: string) => void;
  /** Called when burn confirms — parent keeps this component mounted across chain switch */
  onPendingTransfer?: () => void;
  /** Called when user resets — parent can unmount safely */
  onReset?: () => void;
}

function StepRow({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  const color = done ? "#10b981" : active ? "var(--on-surface)" : "rgba(195, 198, 215, .3)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color }}>
      {done ? (
        <Icon name="check_circle" size={16} style={{ color: "#10b981", flexShrink: 0 }} />
      ) : active ? (
        <Icon name="progress_activity" size={16} className="spin" style={{ color: "var(--primary)", flexShrink: 0 }} />
      ) : (
        <span style={{
          width: 16, height: 16, borderRadius: "50%",
          border: "1.5px solid rgba(195, 198, 215, .2)",
          flexShrink: 0, display: "inline-block",
        }} />
      )}
      {label}
    </div>
  );
}

export function CrossChainDonate({ onSuccess, onPendingTransfer, onReset }: CrossChainDonateProps) {
  const xc = useCrossChainDonate();
  const { address, chain } = useAccount();
  const [amount, setAmount] = useState("");

  // Keep parent mounted across mandatory chain switch in Phase 3
  useEffect(() => {
    if (xc.step === "waiting_attestation" || xc.step === "switch_to_base") {
      onPendingTransfer?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xc.step]);

  useEffect(() => {
    if (xc.step === "success") onSuccess?.(xc.txHash, amount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xc.step]);

  // USDC balance on the current source chain
  const srcUsdcAddress = chain ? getSourceChain(chain.id)?.usdcAddress : undefined;
  const { data: usdcBalanceRaw } = useReadContract({
    address:  srcUsdcAddress,
    abi:      ERC20_ABI,
    functionName: "balanceOf",
    args:     address ? [address] : undefined,
    chainId:  chain?.id,
    query:    { enabled: !!address && !!srcUsdcAddress, refetchInterval: 10_000 },
  });
  const usdcBalance = usdcBalanceRaw !== undefined
    ? (Number(usdcBalanceRaw as bigint) / 10 ** USDC_DECIMALS).toFixed(2)
    : null;

  const parsedAmount = (() => {
    if (!amount || parseFloat(amount) <= 0) return 0n;
    try { return parseUnits(amount, USDC_DECIMALS); } catch { return 0n; }
  })();

  const isBurning = xc.step === "approving" || xc.step === "burning";
  const targetBase = TARGET_CHAIN_ID === 84532 ? baseSepolia : base;

  // ─── Success ──────────────────────────────────────────────────────────────────
  if (xc.step === "success") {
    return (
      <div className="crosschain-panel">
        <div className="crosschain-success">
          <Icon name="check_circle" size={48} style={{ color: "#10b981" }} />
          <h3>Cross-chain donation complete!</h3>
          <p>Your <strong>{amount} USDC</strong> donation has been credited on Base.</p>
          <p className="crosschain-note">Powered by Circle CCTP — native USDC, no bridges.</p>
          {xc.txHash && (
            <a href={getExplorerUrl(xc.txHash)} target="_blank" rel="noopener noreferrer" className="crosschain-explorer">
              <Icon name="open_in_new" size={14} />
              View on Base explorer
            </a>
          )}
          <button className="btn-tertiary-cta" onClick={() => { xc.reset(); setAmount(""); onReset?.(); }} style={{ width: "100%" }}>
            <Icon name="favorite" fill={1} />
            Donate again
          </button>
        </div>
      </div>
    );
  }

  // ─── Waiting for attestation / Switch to Base ─────────────────────────────────
  if (xc.step === "waiting_attestation" || xc.step === "switch_to_base") {
    const attestationReady = xc.step === "switch_to_base";
    const sourceIsEthereum = chain?.id === 1 || chain?.id === 11155111;

    return (
      <div className="crosschain-panel">
        {!attestationReady ? (
          <>
            <div className="step-banner">
              <Icon name="schedule" className="spin" />
              <div>
                <div className="l1">Waiting for Circle attestation</div>
                <div className="l2">
                  Takes {sourceIsEthereum ? "~13 minutes" : "~2 minutes"} for {xc.sourceChainName}
                </div>
              </div>
            </div>

            <div className="crosschain-progress-wrap">
              <div className="crosschain-progress-labels">
                <span>Polling for attestation…</span>
                <span>{xc.attestationProgress}%</span>
              </div>
              <div className="crosschain-progress-track">
                <div className="crosschain-progress-bar" style={{ width: `${xc.attestationProgress}%` }} />
              </div>
            </div>

            <div className="crosschain-meta">
              <div className="crosschain-meta-row">
                <span>Amount burned</span>
                <strong>{amount} USDC on {xc.sourceChainName}</strong>
              </div>
              <div className="crosschain-meta-row">
                <span>Will be minted on</span>
                <strong>Base</strong>
              </div>
            </div>

            {xc.txHash && (
              <a href={getExplorerUrl(xc.txHash)} target="_blank" rel="noopener noreferrer" className="crosschain-explorer muted">
                <Icon name="open_in_new" size={12} />
                View burn transaction
              </a>
            )}
          </>
        ) : (
          <>
            <div className="step-banner" style={{ background: "rgba(16,185,129,.08)", borderColor: "rgba(16,185,129,.25)" }}>
              <Icon name="check_circle" style={{ animation: "none", color: "#10b981" }} />
              <div>
                <div className="l1" style={{ color: "#10b981" }}>Attestation confirmed by Circle</div>
                <div className="l2">Switch to Base in your wallet, then click below.</div>
              </div>
            </div>

            <button className="btn-tertiary-cta" onClick={xc.completeMint}>
              {chain?.id === targetBase.id ? (
                <>
                  <Icon name="check_circle" fill={1} />
                  Complete donation on Base
                </>
              ) : (
                <>
                  <Icon name="swap_horiz" />
                  Switch to Base &amp; Complete
                </>
              )}
            </button>

            <button
              className="crosschain-reset-btn"
              onClick={() => { xc.reset(); onReset?.(); }}
            >
              Cancel and start over
            </button>
          </>
        )}
      </div>
    );
  }

  // ─── Main form ────────────────────────────────────────────────────────────────
  return (
    <div className="crosschain-panel">
      {/* Chain banner */}
      <div className="crosschain-chain-banner">
        <div className="crosschain-chain-from">
          <span>{xc.sourceChainIcon}</span>
          <span>{xc.sourceChainName}</span>
        </div>
        <Icon name="arrow_forward" size={18} style={{ color: "var(--on-surface-variant)" }} />
        <div className="crosschain-chain-to">
          <TokenIcon symbol="BASE" size={18} />
          <span>Base</span>
        </div>
        <span className="crosschain-badge">CCTP</span>
      </div>

      {/* Info note */}
      <div className="crosschain-info-note">
        <Icon name="info" size={14} style={{ flexShrink: 0, opacity: .5 }} />
        <p>
          USDC is burned on {xc.sourceChainName} and natively minted on Base by Circle.
          No bridge fee — just source-chain gas. Ethereum takes ~13 min; L2s ~2 min.
        </p>
      </div>

      {/* Bridge not configured */}
      {!xc.bridgeConfigured && (
        <div className="step-banner" style={{ background: "rgba(251,191,36,.08)", borderColor: "rgba(251,191,36,.25)" }}>
          <Icon name="warning" style={{ animation: "none", color: "#fbbf24" }} />
          <div>
            <div className="l1" style={{ color: "#fbbf24" }}>CCTP not configured for {xc.sourceChainName}</div>
            <div className="l2">Switch to Ethereum, Optimism, or Arbitrum, or donate directly on Base.</div>
          </div>
        </div>
      )}

      {/* USDC balance */}
      {usdcBalance !== null && (
        <div className="crosschain-balance">
          <span>Your USDC balance on {xc.sourceChainName}</span>
          <strong>{usdcBalance} USDC</strong>
        </div>
      )}

      {/* Amount input */}
      <div className="donate-section">
        <label className="donate-label">Amount (USDC)</label>
        <div className="amount-input-wrap">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              const s = e.target.value.replace(/[^0-9.]/g, "");
              const p = s.split(".");
              setAmount(p.length > 2 ? p[0] + "." + p.slice(1).join("") : s);
            }}
            placeholder="0.00"
            disabled={isBurning || xc.step === "minting"}
            className="amount-input"
            aria-label="USDC amount"
          />
          <div className="amount-input-suffix">USDC</div>
        </div>
        <div className="preset-row">
          {PRESET_AMOUNTS.map((p) => (
            <button
              key={p}
              className={`preset-btn${parseFloat(amount) === p ? " active" : ""}`}
              onClick={() => setAmount(p.toString())}
              disabled={isBurning}
            >
              ${p}
            </button>
          ))}
        </div>
      </div>

      {/* Cost summary */}
      {parsedAmount > 0n && (
        <div className="summary-card">
          <div className="summary-row">
            <span className="l">Donation amount</span>
            <span className="v" style={{ fontWeight: 700 }}>{amount} USDC</span>
          </div>
          <div className="summary-row muted">
            <span className="l">Bridge fee</span>
            <span className="v" style={{ color: "#10b981" }}>None (CCTP is free)</span>
          </div>
          <div className="summary-row muted">
            <span className="l">Gas (source chain)</span>
            <span className="v">~$0.10–$2 in {xc.nativeCurrency}</span>
          </div>
          <div className="summary-row summary-divider">
            <span className="l">Campaign receives</span>
            <span className="v" style={{ fontWeight: 700 }}>{amount} USDC</span>
          </div>
        </div>
      )}

      {/* Step indicators while burning */}
      {isBurning && (
        <div className="step-banner" style={{ flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
          <StepRow done={xc.step === "burning"} active={xc.step === "approving"} label={xc.step === "approving" ? "Approving USDC spend…" : "USDC approved"} />
          <StepRow done={false} active={xc.step === "burning"} label={xc.step === "burning" ? "Burning USDC on source chain…" : "Burn pending"} />
          <StepRow done={false} active={false} label="Waiting for Circle attestation" />
          <StepRow done={false} active={false} label="Complete mint on Base" />
        </div>
      )}

      {/* Minting step */}
      {xc.step === "minting" && (
        <div className="step-banner" style={{ flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
          <StepRow done={true} active={false} label="USDC burned on source chain" />
          <StepRow done={true} active={false} label="Circle attestation received" />
          <StepRow done={false} active={true} label="Minting USDC on Base…" />
        </div>
      )}

      {/* Error */}
      {xc.errorMsg && (
        <div className="step-banner" style={{ background: "rgba(220, 38, 38, .1)", borderColor: "rgba(220, 38, 38, .3)" }}>
          <Icon name="error" style={{ animation: "none", color: "#f87171" }} />
          <div>
            <div className="l1">Transaction failed</div>
            <div className="l2">{xc.errorMsg}</div>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        className="btn-tertiary-cta"
        onClick={() => xc.execute(parsedAmount)}
        disabled={!amount || parsedAmount === 0n || xc.isProcessing || !xc.bridgeConfigured}
      >
        {xc.isProcessing ? (
          <>
            <Icon name="progress_activity" className="spin" />
            {xc.step === "approving" ? "Approving USDC…" :
             xc.step === "burning"   ? "Burning USDC…"  :
             xc.step === "minting"   ? "Minting on Base…" : "Processing…"}
          </>
        ) : (
          <>
            <Icon name="swap_horiz" />
            Donate {amount ? `${amount} USDC` : ""} via CCTP
          </>
        )}
      </button>

      <p className="crosschain-footer">
        Circle CCTP · burned on {xc.sourceChainName || "source chain"}, minted on Base · 100% to campaign
      </p>
    </div>
  );
}
