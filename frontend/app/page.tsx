"use client";
import { useRouter } from "next/navigation";
import { TopNavBar } from "./components/sections/TopNavBar";
import { CAMPAIGN_DEFAULTS } from "@/app/lib/constants";
import { useCampaignStats } from "../app/hooks/useCampaignStats";
import { useNGNRate } from "../app/hooks/useNGNRate";
import { HeroSection } from "./components/sections/HeroSection";
import { ProgressCard } from "./components/sections/ProgressCard";
import { ImpactModels } from "./components/sections/ImpactModels";
import { StatsBar } from "./components/sections/StatsBar";
import { PhotoGallery } from "./components/sections/PhotoGallery";
import { ActivityFeed } from "./components/sections/ActivityFeed";
import { Footer } from "./components/sections/Footer";

const t = CAMPAIGN_DEFAULTS;

export default function CampaignPage() {
  const router = useRouter();

  const { rate } = useNGNRate();
   
  const donateCard = {
    title: t.donateCardTitle,
    pill: t.donateCardPill,
    desc: t.donateCardDesc,
    features: t.donateCardFeatures,
    cta: t.donateCardCta,
    icon: t.donateCardIcon,
    multichainLabel: t.allowTransfer && t.allowCrypto ? "Payment methods" : t.allowCrypto ? "Multichain support" : "Payment methods",
    methods: (() => {
      const arr: { label: string; icon?: string; token?: string }[] = [];
      if (t.allowTransfer) {
        arr.push(
          { label: "Bank Transfer", icon: "account_balance" },
        );
      }
      if (t.allowCrypto) {
        arr.push(
          { label: "USDC", token: "USDC" },
          { label: "ETH", token: "ETH" },
          { label: "DAI", token: "DAI" }
        );
      }
      return arr;
    })(),
    multichainFoot: t.allowTransfer && t.allowCrypto
      ? "Bank transfer in Naira · Crypto direct to vault"
      : t.allowCrypto ? "Cross-chain via Circle CCTP" : "Direct bank transfer",
  };

  const { totalRaised, donorCount, deadline, isLoading: statsLoading } = useCampaignStats();

  const stakeCard = t.showStake ? {
    title: t.stakeCardTitle,
    pill: t.stakeCardPill,
    desc: t.stakeCardDesc,
    features: t.stakeCardFeatures,
    cta: t.stakeCardCta,
    icon: t.stakeCardIcon,
    footTitle: t.stakeCardFootTitle,
    footSub: t.stakeCardFootSub,
    footIcon: t.stakeCardFootIcon,
  } : null;

  const handleNavigate = (v: string) => router.push(`/${v}`);

  const campaign = {
    title: t.campaignName,
    location: t.location,
    goal: t.goal,
    goalNGN: t.goalNGN,
    currency: "USDC",
    endDate: t.endDate,
    headlineParts: [
      { text: t.headline1 },
      { text: t.headline2, gradient: true },
      { text: t.headline3 },
    ].filter((p) => p.text),
    subhead: t.subhead,
  };

  // Compute daysLeft from on-chain deadline when available
  const daysLeft = deadline > 0n
    ? Math.max(0, Math.ceil((Number(deadline) - Date.now() / 1000) / 86400))
    : t.daysLeft;

  const stats = {
    raised:   statsLoading ? t.initialRaised : Number(totalRaised) / 1e6,
    donors:   statsLoading ? t.initialDonors : Number(donorCount),
    daysLeft,
  };


  return (
    <>
      <TopNavBar />
      <main>
        <HeroSection />
        <ProgressCard campaign={campaign} stats={stats} rate={rate} />
        <ImpactModels
          title={t.impactTitle}
          sub={t.impactSub}
          showStake={t.showStake}
          donateCard={donateCard}
          stakeCard={stakeCard}
          onDonate={() => handleNavigate("donate")}
          onStake={() => handleNavigate("stake")}
        />
        <StatsBar sectionTitle={t.statsTitle} sectionSub={t.statsSub} data={t.stats} />
        <PhotoGallery title={t.galleryTitle} sub={t.gallerySub} items={t.galleryItems} />
        <ActivityFeed />
      </main>
      <Footer />
    </>
  );
}
