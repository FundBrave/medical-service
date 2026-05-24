export const CAMPAIGN_DEFAULTS = {
  campaignName: "Logos Circle Benin — Medical Emergency Fund",
  location: "Benin City, Nigeria",
  goal: 2000,        // max USDC goal; display ₦3,200,000 equivalent
  endDate: "Aug 22", // ~90 days from launch
  daysLeft: 90,
  headline1: "Urgent care",
  headline2: "for a family",
  headline3: "in crisis",
  subhead:
    "A Logos Circle Benin member's father is on dialysis fighting prostate cancer, and his mother faces Stage 3 ovarian cancer surgery. Help cover dialysis, surgery, medications, and post-op recovery.",
  initialRaised: 0,
  initialDonors: 0,
  primaryColor: "#DC2626",    // red — urgency
  secondaryColor: "#B45309",  // amber
  tertiaryColor: "#0369A1",   // blue
  allowCard: true,
  allowCrypto: true,
  showStake: true,
  showStats: true,
  showGallery: false,
  usdToNgn: 1600,
  beneficiaryNoun: "families",
  beneficiaryCount: "1",

  impactTitle: "Two ways to help",
  impactSub:
    "A direct gift or stake-and-donate — both go straight to the family's medical costs.",
  donateCardTitle: "One-time donation",
  donateCardPill: "Instant",
  donateCardDesc:
    "Pay by card (NGN) or crypto. 100% of your gift goes to the family — no platform fees.",
  donateCardFeatures: [
    "Receipt within 60 seconds",
    "Zero platform fees",
    "On-chain transparency",
  ],
  donateCardCta: "Donate now",
  donateCardIcon: "volunteer_activism",
  stakeCardTitle: "Stake & donate yield",
  stakeCardPill: "DeFi",
  stakeCardDesc:
    "Deposit USDC into Aave and let the yield flow to the campaign. Withdraw your principal any time.",
  stakeCardFeatures: [
    "Keep your principal",
    "Yield goes to the family",
    "Withdraw anytime",
  ],
  stakeCardCta: "Stake USDC",
  stakeCardIcon: "autorenew",
  stakeCardFootTitle: "Powered by Aave V3",
  stakeCardFootSub: "Non-custodial · Base mainnet",
  stakeCardFootIcon: "shield",

  galleryTitle: "The family's story",
  gallerySub: "Real context behind the campaign.",
  statsTitle: "Where every dollar goes",
  statsSub: "Every transaction is logged on-chain for full transparency.",
  stats: [
    {
      value: "₦1M",
      unit: "",
      label: "Minimum target",
      sublabel: "~$625 USDC for dialysis",
      icon: "medical_services",
    },
    {
      value: "2",
      unit: "",
      label: "Parents in treatment",
      sublabel: "dialysis + cancer surgery",
      icon: "family_restroom",
    },
    {
      value: "100",
      unit: "%",
      label: "Funds to family",
      sublabel: "zero platform cut",
      icon: "local_hospital",
    },
    {
      value: "100",
      unit: "%",
      label: "On-chain audit",
      sublabel: "every tx publicly verifiable",
      icon: "shield_with_heart",
    },
  ],
  donateTitle: "Make a donation",
  donateSub:
    "Every gift goes directly to the family. Pay in Naira by card or donate crypto — both are converted to USDC and disbursed on-chain.",
  donateIcon: "health_and_safety",

  galleryItems: [],

  transparency: {
    // No multisig — deployer wallet is the sole withdrawer
    treasury: process.env.NEXT_PUBLIC_CAMPAIGN_ADDRESS || "0x0000000000000000000000000000000000000000",
    signers: [
      "Campaign owner (deployer wallet)",
    ],
    flows: [
      {
        tone: "primary",
        icon: "volunteer_activism",
        title: "Direct donations",
        steps: [
          "Donor card / wallet",
          "MedicalCampaign vault (Base)",
          "Owner wallet → NGN off-ramp",
        ],
        description:
          "100% of donations are held in the on-chain campaign vault. The campaign owner calls withdrawToTreasury() after the goal is reached to transfer funds for off-ramping to Naira.",
      },
      {
        tone: "secondary",
        icon: "autorenew",
        title: "Yield staking",
        steps: [
          "Staker deposits USDC",
          "MedicalStaking → Aave V3",
          "Yield credited to campaign",
        ],
        description:
          "Stakers deposit USDC which earns Aave yield. The campaign's share of yield flows automatically into the campaign vault and is counted toward the goal.",
      },
      {
        tone: "tertiary",
        icon: "medication_liquid",
        title: "Fiat (Naira) donations",
        steps: [
          "Donor pays via Paystack",
          "Float wallet buys USDC",
          "donateUSDCFor() → vault",
        ],
        description:
          "Naira card and bank transfer payments are processed via Paystack. The platform converts NGN to USDC and attributes the donation on-chain to the original donor's derived address.",
      },
    ],
    contracts: [
      {
        label: "Campaign contract",
        address: process.env.NEXT_PUBLIC_CAMPAIGN_ADDRESS || "0x0000000000000000000000000000000000000000",
      },
      {
        label: "Staking contract",
        address: process.env.NEXT_PUBLIC_STAKING_ADDRESS || "0x0000000000000000000000000000000000000000",
      },
      {
        label: "USDC token",
        address: process.env.NEXT_PUBLIC_USDC_ADDRESS || "0xf269f54304f8DB2dB613341CC7E189B02BEf98dE",
      },
    ],
    feed: [],
  },

  impact: {
    title: "Stake to fund ongoing care",
    sub: "Deposit USDC and let the Aave yield support the family's dialysis and recovery costs.",
    accent: "Keep your principal. The yield does the work.",
    tvl: 0,
    generatedImpact: 0,
    supporters: 0,
    demoPrincipal: 100,
    demoYield: 4.5,
    loopSteps: [
      {
        title: "Deposit USDC",
        desc: "Stake any amount of USDC via the DeFi tab. Your principal stays yours.",
      },
      {
        title: "Yield flows to the campaign",
        desc: "Aave generates yield on your deposit. The campaign's share (~79%) goes directly to the medical vault.",
      },
      {
        title: "Withdraw anytime",
        desc: "Unstake and reclaim your full principal whenever you want. Only the yield is donated.",
      },
    ],
  },
};

export const SUPPORTED_TOKENS = [
  { symbol: "USDC", name: "USD Coin", decimals: 6, native: false },
  { symbol: "ETH", name: "Ether", decimals: 18, native: true },
  { symbol: "DAI", name: "Dai", decimals: 18, native: false },
  { symbol: "WETH", name: "Wrapped Ether", decimals: 18, native: false },
];

export const TOKEN_COLORS: Record<string, string> = {
  USDC: "#2775CA",
  ETH: "#627EEA",
  DAI: "#F4B731",
  WETH: "#FF007A",
  POLYGON: "#8247E5",
  ARBITRUM: "#28A0F0",
  OPTIMISM: "#FF0420",
  BTC: "#F7931A",
  SOL: "#14F195",
  BASE: "#0052FF",
};

export const PRESET_USD = [10, 25, 50, 100, 250];
export const PRESET_NGN = [5000, 10000, 25000, 50000, 100000];
export const PRESET_ETH = [0.01, 0.05, 0.1, 0.25];
export const MIN_DONATION_USD = 1;
