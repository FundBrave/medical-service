"use client";

import { useReadContracts } from "wagmi";
import {
  CAMPAIGN_ABI,
  STAKING_ABI,
  CONTRACT_ADDRESSES,
  TARGET_CHAIN_ID,
  formatUSDC,
  CAMPAIGN_GOAL_MAX_USDC,
} from "@/lib/contracts";

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
    query: {
      refetchInterval: 60_000,
      staleTime:       45_000,
    },
  });

  const campaignStats = data?.[0]?.result as
    | [bigint, bigint, bigint, bigint, bigint, bigint, boolean, boolean]
    | undefined;

  const progressBps  = data?.[1]?.result as bigint | undefined;
  const stakingStats = data?.[2]?.result as
    | [bigint, bigint, bigint, bigint, bigint]
    | undefined;

  return {
    isLoading,
    error,
    refetch,

    totalRaised:    campaignStats?.[0] ?? 0n,
    goalMin:        campaignStats?.[1] ?? 0n,
    goalMax:        campaignStats?.[2] ?? 0n,
    deadline:       campaignStats?.[3] ?? 0n,
    donorCount:     campaignStats?.[4] ?? 0n,
    donationsCount: campaignStats?.[5] ?? 0n,
    isActive:       campaignStats?.[6] ?? false,
    minGoalReached: campaignStats?.[7] ?? false,
    maxGoalReached: campaignStats ? campaignStats[0] >= campaignStats[2] : false,

    progressPercent: progressBps ? Number(progressBps) / 100 : 0,

    totalStaked:         stakingStats?.[0] ?? 0n,
    totalYieldGenerated: stakingStats?.[1] ?? 0n,
    lastHarvest:         stakingStats?.[2] ?? 0n,
    unrealizedYield:     stakingStats?.[4] ?? 0n,

    totalRaisedFormatted:         formatUSDC(campaignStats?.[0] ?? 0n),
    goalMinFormatted:             formatUSDC(BigInt(CAMPAIGN_GOAL_MAX_USDC) * 1_000_000n),
    goalMaxFormatted:             formatUSDC(BigInt(CAMPAIGN_GOAL_MAX_USDC) * 1_000_000n),
    totalStakedFormatted:         formatUSDC(stakingStats?.[0] ?? 0n),
    totalYieldGeneratedFormatted: formatUSDC(stakingStats?.[1] ?? 0n),
  };
}
