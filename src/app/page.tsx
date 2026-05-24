"use client";

import { useState, useEffect } from "react";
import { CAMPAIGN_DEFAULTS } from "@/lib/constants";
import { useCampaignStats } from "@/hooks/useCampaignStats";
import { useNGNRate } from "@/hooks/useNGNRate";
import { TopNavBar } from "@/components/TopNavBar";
import { HeroSection } from "@/components/HeroSection";
import { ProgressCard } from "@/components/ProgressCard";
import { ImpactModels } from "@/components/ImpactModels";
import { StatsBar } from "@/components/StatsBar";
import { PhotoGallery } from "@/components/PhotoGallery";
import { Footer } from "@/components/Footer";
import { DonatePage, DonateSuccessScreen } from "@/components/DonatePage";
import type { SuccessInfo } from "@/components/DonatePage";
import { TransparencyPage } from "@/components/TransparencyPage";
import { ImpactPage } from "@/components/ImpactPage";
import { AdminPage } from "@/components/AdminPage";
import { PrivacyPage } from "@/components/PrivacyPage";

const t = CAMPAIGN_DEFAULTS;

export default function Home() {
  const [view, setView] = useState("home");
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

  const { rate } = useNGNRate();

  // Live on-chain stats — falls back to t.initialRaised/initialDonors while loading
  const { totalRaised, donorCount, deadline, isLoading: statsLoading } = useCampaignStats();

  const campaign = {
    title: t.campaignName,
    location: t.location,
    goal: t.goal,
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

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-container", t.primaryColor);
    document.documentElement.style.setProperty("--secondary-container", t.secondaryColor);
    document.documentElement.style.setProperty("--tertiary-container", t.tertiaryColor);
  }, []);

  const handleNavigate = (v: string) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const handleSuccess = (info: SuccessInfo) => {
    setSuccessInfo(info);
    setView("success");
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const resetDonate = () => {
    setSuccessInfo(null);
    setView("donate");
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const methods: { id: string; icon: string; label: string; sub?: string }[] = [];
  if (t.allowCard) methods.push({ id: "card", icon: "credit_card", label: "Card", sub: "Naira · Visa · MC" });
  if (t.allowCrypto) methods.push({ id: "crypto", icon: "currency_bitcoin", label: "Crypto", sub: "USDC · ETH" });

  const donateConfig = {
    methods,
    title: t.donateTitle,
    sub: t.donateSub,
    iconName: t.donateIcon,
  };

  const donateCard = {
    title: t.donateCardTitle,
    pill: t.donateCardPill,
    desc: t.donateCardDesc,
    features: t.donateCardFeatures,
    cta: t.donateCardCta,
    icon: t.donateCardIcon,
    multichainLabel: t.allowCard && t.allowCrypto ? "Payment methods" : t.allowCrypto ? "Multichain support" : "Payment methods",
    methods: (() => {
      const arr: { label: string; icon?: string; token?: string }[] = [];
      if (t.allowCard) {
        arr.push(
          { label: "Card", icon: "credit_card" },
          { label: "Bank", icon: "account_balance" },
          { label: "Apple Pay", icon: "phone_iphone" },
          { label: "Google Pay", icon: "smartphone" }
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
    multichainFoot: t.allowCard && t.allowCrypto
      ? "Naira via Paystack → USDC · Crypto direct to vault"
      : t.allowCrypto ? "Cross-chain via Circle CCTP" : "Paystack payment processing · PCI compliant",
  };

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

  return (
    <>
      {view === "home" && (
        <>
          <TopNavBar activeView={view} onNavigate={handleNavigate} />
          <main>
            <HeroSection
              campaign={campaign}
              heroImage={t.heroImage}
              onDonate={() => handleNavigate("donate")}
              onTransparency={() => handleNavigate("transparency")}
            />
            <ProgressCard campaign={campaign} stats={stats} rate={rate} />
            <ImpactModels
              title={t.impactTitle}
              sub={t.impactSub}
              showStake={t.showStake}
              donateCard={donateCard}
              stakeCard={stakeCard}
              onDonate={() => handleNavigate("donate")}
              onStake={() => handleNavigate("impact")}
            />
            {t.showStats && (
              <StatsBar sectionTitle={t.statsTitle} sectionSub={t.statsSub} data={t.stats} />
            )}
            {t.showGallery && (
              <PhotoGallery title={t.galleryTitle} sub={t.gallerySub} items={t.galleryItems} />
            )}
          </main>
          <Footer />
        </>
      )}

      {view === "donate" && (
        <DonatePage
          campaign={campaign}
          stats={stats}
          rate={rate}
          donateConfig={donateConfig}
          onBack={() => handleNavigate("home")}
          onSuccess={handleSuccess}
        />
      )}

      {view === "success" && successInfo && (
        <DonateSuccessScreen
          amount={successInfo.amount}
          tokenSymbol={successInfo.tokenSymbol}
          method={successInfo.method}
          recurring={successInfo.recurring}
          card={successInfo.card}
          txHash={successInfo.txHash}
          donorNumber={stats.donors}
          beneficiaryNoun={t.beneficiaryNoun}
          beneficiaryCount={t.beneficiaryCount}
          rate={rate}
          onReset={resetDonate}
          onBack={() => handleNavigate("home")}
        />
      )}

      {view === "transparency" && (
        <TransparencyPage
          campaign={campaign}
          stats={stats}
          rate={rate}
          transparency={t.transparency}
          beneficiaryNoun={t.beneficiaryNoun}
          beneficiaryCount={t.beneficiaryCount}
          activeView={view}
          onNavigate={handleNavigate}
        />
      )}

      {view === "impact" && (
        <ImpactPage
          campaign={campaign}
          stats={stats}
          rate={rate}
          impact={t.impact}
          activeView={view}
          onNavigate={handleNavigate}
        />
      )}

      {view === "admin" && (
        <AdminPage
          campaign={campaign}
          stats={stats}
          rate={rate}
          transparency={t.transparency}
          onBack={() => handleNavigate("home")}
        />
      )}

      {view === "privacy" && (
        <PrivacyPage
          activeView={view}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
}
