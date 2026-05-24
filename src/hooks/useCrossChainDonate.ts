"use client";

/**
 * useCrossChainDonate — CCTP (Circle Cross-Chain Transfer Protocol)
 *
 * Phase 1 (source chain): approve → depositForBurn → extract MessageSent bytes
 * Phase 2 (off-chain): poll iris-api.circle.com until attestation is complete
 * Phase 3 (Base): completeTransfer on AbeokutaCCTPReceiver → donation credited
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi";
import { keccak256 } from "viem";
import type { Address, Log } from "viem";
import { base } from "wagmi/chains";
import {
  ERC20_ABI,
  getSourceChain,
  CCTP_RECEIVER_ABI,
  TOKEN_MESSENGER_ABI,
  CCTP_BASE_RECEIVER_ADDRESS,
  CCTP_BASE_DOMAIN,
} from "@/lib/contracts";

// ─── localStorage persistence ─────────────────────────────────────────────────

interface PersistedTransfer {
  messageBytes: `0x${string}`;
  attestation:  `0x${string}` | null;
  txHash:       `0x${string}`;
}

function storageKey(address: string) {
  return `cctp_pending_${address.toLowerCase()}`;
}
function saveTransfer(address: string, data: PersistedTransfer) {
  try { localStorage.setItem(storageKey(address), JSON.stringify(data)); } catch {}
}
function loadTransfer(address: string): PersistedTransfer | null {
  try {
    const raw = localStorage.getItem(storageKey(address));
    return raw ? (JSON.parse(raw) as PersistedTransfer) : null;
  } catch { return null; }
}
function clearTransfer(address: string) {
  try { localStorage.removeItem(storageKey(address)); } catch {}
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type CrossChainStep =
  | "idle"
  | "approving"
  | "burning"
  | "waiting_attestation"
  | "switch_to_base"
  | "minting"
  | "success"
  | "error";

export interface CrossChainDonateState {
  step:                CrossChainStep;
  txHash:              `0x${string}` | undefined;
  errorMsg:            string;
  isProcessing:        boolean;
  attestationProgress: number;
  execute:             (amountUsdc: bigint) => void;
  completeMint:        () => void;
  reset:               () => void;
  sourceChainName:     string;
  sourceChainIcon:     string;
  nativeCurrency:      string;
  bridgeConfigured:    boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ATTESTATION_POLL_INTERVAL_MS = 10_000;
const ATTESTATION_MAX_POLLS        = 90;

function attestationUrl(messageHash: string): string {
  return `https://iris-api.circle.com/v1/attestations/${messageHash}`;
}

const MESSAGE_TRANSMITTER_ABI = [
  {
    name:   "MessageSent",
    type:   "event",
    inputs: [{ name: "message", type: "bytes", indexed: false }],
  },
] as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCrossChainDonate(): CrossChainDonateState {
  const { address, chain } = useAccount();
  const { switchChain }    = useSwitchChain();

  const srcChain         = chain ? getSourceChain(chain.id) : undefined;
  const bridgeConfigured = !!srcChain?.tokenMessengerAddress &&
    srcChain.tokenMessengerAddress !== "0x0000000000000000000000000000000000000000";

  const [step,          setStep]          = useState<CrossChainStep>("idle");
  const [txHash,        setTxHash]        = useState<`0x${string}` | undefined>(undefined);
  const [errorMsg,      setErrorMsg]      = useState("");
  const [pendingAmount, setPendingAmount] = useState<bigint>(0n);
  const [phase,         setPhase]         = useState<"approve" | "burn" | "mint">("approve");
  const [messageBytes,  setMessageBytes]  = useState<`0x${string}` | undefined>(undefined);
  const [attestation,   setAttestation]   = useState<`0x${string}` | undefined>(undefined);
  const [pollCount,     setPollCount]     = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Restore pending transfer on mount
  useEffect(() => {
    if (!address) return;
    const saved = loadTransfer(address);
    if (!saved) return;

    setTxHash(saved.txHash);
    setMessageBytes(saved.messageBytes);

    if (saved.attestation) {
      setAttestation(saved.attestation);
      setStep("switch_to_base");
    } else {
      setStep("waiting_attestation");
      setPollCount(0);
      _startAttestationPolling(saved.messageBytes);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const usdcAddress           = srcChain?.usdcAddress           ?? ("0x0000000000000000000000000000000000000000" as Address);
  const tokenMessengerAddress = srcChain?.tokenMessengerAddress ?? ("0x0000000000000000000000000000000000000000" as Address);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address:      usdcAddress,
    abi:          ERC20_ABI,
    functionName: "allowance",
    args:         [address ?? "0x0000000000000000000000000000000000000000", tokenMessengerAddress],
    query:        { enabled: !!address && bridgeConfigured },
  });

  const {
    writeContract,
    data:      writeTxHash,
    isPending: isWritePending,
    error:     writeError,
    reset:     resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isTxSuccess, data: txReceipt } =
    useWaitForTransactionReceipt({ hash: writeTxHash });

  useEffect(() => {
    if (writeTxHash) setTxHash(writeTxHash);
  }, [writeTxHash]);

  useEffect(() => {
    if (!isTxSuccess || !txReceipt) return;

    if (phase === "approve") {
      refetchAllowance().then(() => { _sendBurn(pendingAmount); });
    } else if (phase === "burn") {
      _extractMessageAndPoll(txReceipt.logs, txReceipt.transactionHash);
    } else if (phase === "mint") {
      if (address) clearTransfer(address);
      setStep("success");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxSuccess, txReceipt]);

  useEffect(() => {
    if (writeError) {
      setErrorMsg(writeError.message?.split("\n")[0] ?? "Transaction failed");
      setStep("error");
    }
  }, [writeError]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const _extractMessageAndPoll = useCallback((logs: readonly Log[], burnTxHash?: `0x${string}`) => {
    const MESSAGE_SENT_TOPIC = "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036" as `0x${string}`;

    let rawMessage: `0x${string}` | undefined;
    for (const log of logs) {
      if (log.topics[0] === MESSAGE_SENT_TOPIC && log.data) {
        const dataHex = log.data.slice(2);
        const lengthOffset = 64;
        const length = parseInt(dataHex.slice(lengthOffset, lengthOffset + 64), 16);
        if (length < 100 || length * 2 > dataHex.length - (lengthOffset + 64)) break;
        const msgHex = dataHex.slice(lengthOffset + 64, lengthOffset + 64 + length * 2);
        rawMessage = ("0x" + msgHex) as `0x${string}`;
        break;
      }
    }

    if (!rawMessage) {
      setErrorMsg("Could not find MessageSent event in burn transaction. Try again.");
      setStep("error");
      return;
    }

    setMessageBytes(rawMessage);
    setStep("waiting_attestation");
    setPollCount(0);
    if (address) {
      saveTransfer(address, { messageBytes: rawMessage, attestation: null, txHash: burnTxHash ?? "0x" });
    }
    _startAttestationPolling(rawMessage);
  }, [address]);

  const _startAttestationPolling = useCallback((rawMessage: `0x${string}`) => {
    if (pollRef.current) clearInterval(pollRef.current);
    const messageHash = keccak256(rawMessage);

    const poll = async () => {
      setPollCount((c) => {
        if (c >= ATTESTATION_MAX_POLLS) {
          clearInterval(pollRef.current);
          setErrorMsg("Attestation timed out after 15 minutes. Please try completing the mint manually.");
          setStep("error");
          return c;
        }
        return c + 1;
      });

      try {
        const res = await fetch(attestationUrl(messageHash));
        if (!res.ok) return;

        const json = await res.json();
        if (typeof json !== "object" || json === null) return;
        if (json?.status === "complete" && json?.attestation) {
          clearInterval(pollRef.current);
          const raw = json.attestation;
          if (typeof raw !== "string" || !/^0x[0-9a-fA-F]+$/.test(raw)) return;
          const att = raw as `0x${string}`;
          setAttestation(att);
          setStep("switch_to_base");
          if (address) {
            const saved = loadTransfer(address);
            if (saved) saveTransfer(address, { ...saved, attestation: att });
          }
        }
      } catch {
        // network error — continue polling
      }
    };

    pollRef.current = setInterval(poll, ATTESTATION_POLL_INTERVAL_MS);
    poll();
  }, []);

  const _sendBurn = useCallback((amount: bigint) => {
    if (!address || !bridgeConfigured) return;
    setPhase("burn");
    setStep("burning");
    resetWrite();

    writeContract({
      address:      tokenMessengerAddress,
      abi:          TOKEN_MESSENGER_ABI,
      functionName: "depositForBurn",
      args: [
        amount,
        CCTP_BASE_DOMAIN,
        ("0x000000000000000000000000" + CCTP_BASE_RECEIVER_ADDRESS.slice(2)) as `0x${string}`,
        usdcAddress,
      ],
    });
  }, [address, bridgeConfigured, tokenMessengerAddress, usdcAddress, writeContract, resetWrite]);

  const execute = useCallback((amountUsdc: bigint) => {
    if (!address || amountUsdc === 0n || !bridgeConfigured) return;
    setPendingAmount(amountUsdc);
    setErrorMsg("");
    setAttestation(undefined);
    setMessageBytes(undefined);

    const currentAllowance = (allowance as bigint | undefined) ?? 0n;
    if (currentAllowance >= amountUsdc) {
      _sendBurn(amountUsdc);
    } else {
      setPhase("approve");
      setStep("approving");
      resetWrite();
      writeContract({
        address:      usdcAddress,
        abi:          ERC20_ABI,
        functionName: "approve",
        args:         [tokenMessengerAddress, amountUsdc],
      });
    }
  }, [address, allowance, bridgeConfigured, tokenMessengerAddress, usdcAddress, writeContract, resetWrite, _sendBurn]);

  const completeMint = useCallback(() => {
    if (!address || !messageBytes || !attestation) {
      setErrorMsg("Missing attestation data. Please wait for the attestation to complete.");
      return;
    }

    if (chain?.id !== base.id) {
      switchChain({ chainId: base.id });
      return;
    }

    setPhase("mint");
    setStep("minting");
    resetWrite();

    writeContract({
      address:      CCTP_BASE_RECEIVER_ADDRESS,
      abi:          CCTP_RECEIVER_ABI,
      functionName: "completeTransfer",
      args:         [messageBytes, attestation, address],
    });
  }, [address, attestation, chain, messageBytes, switchChain, writeContract, resetWrite]);

  const reset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (address) clearTransfer(address);
    setStep("idle");
    setTxHash(undefined);
    setErrorMsg("");
    setPendingAmount(0n);
    setPhase("approve");
    setMessageBytes(undefined);
    setAttestation(undefined);
    setPollCount(0);
    resetWrite();
  }, [address, resetWrite]);

  const attestationProgress = Math.min(100, Math.round((pollCount / ATTESTATION_MAX_POLLS) * 100));

  return {
    step,
    txHash,
    errorMsg,
    isProcessing: ["approving", "burning", "minting"].includes(step),
    attestationProgress,
    execute,
    completeMint,
    reset,
    sourceChainName:  srcChain?.name ?? "Unknown",
    sourceChainIcon:  srcChain?.icon ?? "🔗",
    nativeCurrency:   srcChain?.nativeCurrency ?? "ETH",
    bridgeConfigured,
  };
}
