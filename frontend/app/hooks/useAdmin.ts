"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CAMPAIGN_ABI, STAKING_ABI, ERC20_ABI, CONTRACT_ADDRESSES } from "../lib/contracts";

export function useAdmin() {
  // ── Reads ──────────────────────────────────────────────────────────────────

  const { data: campaignStats, refetch: refetchStats } = useReadContract({
    address: CONTRACT_ADDRESSES.campaign,
    abi: CAMPAIGN_ABI,
    functionName: "getCampaignStats",
  });

  const { data: treasuryAddress } = useReadContract({
    address: CONTRACT_ADDRESSES.campaign,
    abi: CAMPAIGN_ABI,
    functionName: "treasury",
  });

  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESSES.campaign,
    abi: CAMPAIGN_ABI,
    functionName: "owner",
  });

  const { data: campaignUsdcBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.usdc,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [CONTRACT_ADDRESSES.campaign],
  });

  const { data: stakingStats, refetch: refetchStaking } = useReadContract({
    address: CONTRACT_ADDRESSES.staking,
    abi: STAKING_ABI,
    functionName: "getStakingStats",
  });

  const { data: offchainRaisedData, refetch: refetchOffchain } = useReadContract({
    address: CONTRACT_ADDRESSES.campaign,
    abi: CAMPAIGN_ABI,
    functionName: "offchainRaised",
  });

  // ── Withdraw to treasury ───────────────────────────────────────────────────

  const {
    writeContract: writeWithdraw,
    data: withdrawHash,
    isPending: withdrawSubmitting,
    error: withdrawError,
    reset: resetWithdraw,
  } = useWriteContract();

  const { isLoading: withdrawConfirming, isSuccess: withdrawSuccess } =
    useWaitForTransactionReceipt({ hash: withdrawHash });

  function withdrawToTreasury() {
    writeWithdraw({
      address: CONTRACT_ADDRESSES.campaign,
      abi: CAMPAIGN_ABI,
      functionName: "withdrawToTreasury",
    });
  }

  // ── Harvest & distribute staking yield ────────────────────────────────────

  const {
    writeContract: writeHarvest,
    data: harvestHash,
    isPending: harvestSubmitting,
    error: harvestError,
    reset: resetHarvest,
  } = useWriteContract();

  const { isLoading: harvestConfirming, isSuccess: harvestSuccess } =
    useWaitForTransactionReceipt({ hash: harvestHash });

  function harvestAndDistribute() {
    writeHarvest({
      address: CONTRACT_ADDRESSES.staking,
      abi: STAKING_ABI,
      functionName: "harvestAndDistribute",
    });
  }

  // ── Credit offchain donation ───────────────────────────────────────────────

  const {
    writeContract: writeCreditOffchain,
    data: creditOffchainHash,
    isPending: creditOffchainSubmitting,
    error: creditOffchainError,
    reset: resetCreditOffchain,
  } = useWriteContract();

  const { isLoading: creditOffchainConfirming, isSuccess: creditOffchainSuccess } =
    useWaitForTransactionReceipt({ hash: creditOffchainHash });

  function creditOffchainRaised(amount: bigint, note: string) {
    writeCreditOffchain({
      address: CONTRACT_ADDRESSES.campaign,
      abi: CAMPAIGN_ABI,
      functionName: "creditOffchainRaised",
      args: [amount, note],
    });
  }

  function refetchAll() {
    refetchStats();
    refetchBalance();
    refetchStaking();
    refetchOffchain();
  }

  // ─── Toast notifications ──────────────────────────────────────────────────

  const withdrawToastId       = useRef<string | number | undefined>(undefined);
  const harvestToastId        = useRef<string | number | undefined>(undefined);
  const creditOffchainToastId = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    if (withdrawSubmitting) {
      withdrawToastId.current = toast.loading("Confirm withdrawal in wallet…");
    }
  }, [withdrawSubmitting]);

  useEffect(() => {
    if (withdrawConfirming && withdrawToastId.current !== undefined) {
      toast.loading("Withdrawal submitted — confirming…", { id: withdrawToastId.current });
    }
  }, [withdrawConfirming]);

  useEffect(() => {
    if (withdrawSuccess) {
      toast.success("Funds withdrawn to treasury!", { id: withdrawToastId.current, duration: 6000 });
      withdrawToastId.current = undefined;
      refetchBalance();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawSuccess]);

  useEffect(() => {
    if (withdrawError) {
      toast.error("Withdrawal failed", { id: withdrawToastId.current, duration: 8000 });
      withdrawToastId.current = undefined;
    }
  }, [withdrawError]);

  useEffect(() => {
    if (harvestSubmitting) {
      harvestToastId.current = toast.loading("Confirm harvest in wallet…");
    }
  }, [harvestSubmitting]);

  useEffect(() => {
    if (harvestConfirming && harvestToastId.current !== undefined) {
      toast.loading("Harvest submitted — confirming…", { id: harvestToastId.current });
    }
  }, [harvestConfirming]);

  useEffect(() => {
    if (harvestSuccess) {
      toast.success("Yield harvested and distributed!", { id: harvestToastId.current, duration: 6000 });
      harvestToastId.current = undefined;
    }
  }, [harvestSuccess]);

  useEffect(() => {
    if (harvestError) {
      toast.error("Harvest failed", { id: harvestToastId.current, duration: 8000 });
      harvestToastId.current = undefined;
    }
  }, [harvestError]);

  useEffect(() => {
    if (creditOffchainSubmitting) {
      creditOffchainToastId.current = toast.loading("Confirm in wallet…");
    }
  }, [creditOffchainSubmitting]);

  useEffect(() => {
    if (creditOffchainConfirming && creditOffchainToastId.current !== undefined) {
      toast.loading("Transaction submitted — confirming…", { id: creditOffchainToastId.current });
    }
  }, [creditOffchainConfirming]);

  useEffect(() => {
    if (creditOffchainSuccess) {
      toast.success("Offchain donation recorded on-chain!", { id: creditOffchainToastId.current, duration: 6000 });
      creditOffchainToastId.current = undefined;
      refetchStats();
      refetchOffchain();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditOffchainSuccess]);

  useEffect(() => {
    if (creditOffchainError) {
      toast.error("Transaction failed", { id: creditOffchainToastId.current, duration: 8000 });
      creditOffchainToastId.current = undefined;
    }
  }, [creditOffchainError]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const totalRaised     = campaignStats?.[0] ?? 0n;  // combined (on + offchain)
  const goalMin         = campaignStats?.[1] ?? 0n;
  const goalMax         = campaignStats?.[2] ?? 0n;
  const deadline        = campaignStats?.[3] ?? 0n;
  const donorCount      = campaignStats?.[4] ?? 0n;
  const isActive        = campaignStats?.[6] ?? true;
  const minGoalReached  = campaignStats?.[7] ?? false;
  const onchainRaised   = campaignStats?.[8] ?? 0n;
  const offchainRaised  = offchainRaisedData ?? 0n;

  return {
    // Reads
    totalRaised,
    onchainRaised,
    offchainRaised,
    goalMin,
    goalMax,
    deadline,
    donorCount,
    isActive,
    minGoalReached,
    canWithdraw: true,   // GoalNotReached check removed — owner can withdraw at any time
    campaignUsdcBalance: campaignUsdcBalance ?? 0n,
    stakingStats,
    treasuryAddress,
    ownerAddress,

    // Withdraw
    withdrawToTreasury,
    withdrawHash,
    withdrawSubmitting,
    withdrawConfirming,
    withdrawSuccess,
    withdrawError,
    resetWithdraw,

    // Harvest
    harvestAndDistribute,
    harvestHash,
    harvestSubmitting,
    harvestConfirming,
    harvestSuccess,
    harvestError,
    resetHarvest,

    // Credit offchain
    creditOffchainRaised,
    creditOffchainHash,
    creditOffchainSubmitting,
    creditOffchainConfirming,
    creditOffchainSuccess,
    creditOffchainError,
    resetCreditOffchain,

    refetchAll,
  };
}
