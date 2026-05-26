"use client";

import { useReadContract, useReadContracts } from "wagmi";
import {
  CAMPAIGN_ABI,
  STAKING_ABI,
  CONTRACT_ADDRESSES,
  TARGET_CHAIN_ID,
  formatUSDC,
  CAMPAIGN_GOAL_MAX_USDC,
} from "../lib/contracts";

/**
 * useCampaignStats — reads live on-chain campaign and staking data.
 *
 * This is the single source of truth for the dashboard and progress bar.
 * Both reads happen in one multicall round-trip via useReadContracts.
 */
export function useCampaignStats() {
  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        address:      CONTRACT_ADDRESSES.campaign,
        abi:          CAMPAIGN_ABI,
        functionName: "getCampaignStats",
        chainId:      TARGET_CHAIN_ID,
      },
      {
        address:      CONTRACT_ADDRESSES.campaign,
        abi:          CAMPAIGN_ABI,
        functionName: "progressBps",
        chainId:      TARGET_CHAIN_ID,
      },
      {
        address:      CONTRACT_ADDRESSES.staking,
        abi:          STAKING_ABI,
        functionName: "getStakingStats",
        chainId:      TARGET_CHAIN_ID,
      },
    ],
    // Refetch every 60 s; staleTime=45s means multiple components share one
    // in-flight request rather than each firing their own RPC call.
    query: {
      refetchInterval: 60_000,
      staleTime:       45_000,
    },
  });

  // getCampaignStats now returns 10 values:
  // [totalRaised(combined), goalMin, goalMax, deadline, donorCount,
  //  donationsCount, isActive, minGoalReached, onchainRaised, offchainRaised]
  const campaignStats = data?.[0]?.result as
    | [bigint, bigint, bigint, bigint, bigint, bigint, boolean, boolean, bigint, bigint]
    | undefined;

  const progressBps   = data?.[1]?.result as bigint | undefined;
  const stakingStats  = data?.[2]?.result as
    | [bigint, bigint, bigint, bigint, bigint]
    | undefined;

  const combinedRaised  = campaignStats?.[0] ?? 0n;  // totalRaised + offchainRaised
  const onchainRaised   = campaignStats?.[8] ?? 0n;
  const offchainRaised  = campaignStats?.[9] ?? 0n;

  return {
    isLoading,
    error,
    refetch,

    // Campaign fields — totalRaised is the unified display total
    totalRaised:      combinedRaised,
    onchainRaised,
    offchainRaised,
    goalMin:          campaignStats?.[1] ?? 0n,
    goalMax:          campaignStats?.[2] ?? 0n,
    deadline:         campaignStats?.[3] ?? 0n,
    donorCount:       campaignStats?.[4] ?? 0n,
    donationsCount:   campaignStats?.[5] ?? 0n,
    isActive:         campaignStats?.[6] ?? false,
    minGoalReached:   campaignStats?.[7] ?? false,
    maxGoalReached:   campaignStats ? combinedRaised >= campaignStats[2] : false,

    progressPercent:  progressBps ? Number(progressBps) / 100 : 0,

    // Staking fields
    totalStaked:          stakingStats?.[0] ?? 0n,
    totalYieldGenerated:  stakingStats?.[1] ?? 0n,
    lastHarvest:          stakingStats?.[2] ?? 0n,
    unrealizedYield:      stakingStats?.[4] ?? 0n,

    // Formatted helpers
    totalRaisedFormatted:       formatUSDC(combinedRaised),
    goalMinFormatted:           formatUSDC(BigInt(CAMPAIGN_GOAL_MAX_USDC) * 1_000_000n),
    goalMaxFormatted:           formatUSDC(BigInt(CAMPAIGN_GOAL_MAX_USDC) * 1_000_000n),
    totalStakedFormatted:       formatUSDC(stakingStats?.[0] ?? 0n),
    totalYieldGeneratedFormatted: formatUSDC(stakingStats?.[1] ?? 0n),
  };
}
