export const CAMPAIGN_DEFAULTS = {
  campaignName: "Save a Family Fighting Cancer",
  location: "Benin City, Nigeria",
  goal: 1150,
  goalNGN: 1_500_000,
  endDate: "Jul 31",
  daysLeft: 68,
  headline1: "A family",
  headline2: "fighting to survive.",
  headline3: "They need you now.",
  subhead:
    "A father on dialysis, battling prostate cancer and a severe kidney infection. A mother diagnosed with Stage 3 ovarian cancer, awaiting surgery. Their children are watching both parents fight for their lives at the same time. This family cannot carry these bills alone.",
  initialRaised: 0,
  initialDonors: 0,
  primaryColor: "#7c3aed",
  secondaryColor: "#0d9488",
  tertiaryColor: "#b54e00",
  allowCard: false,
  allowTransfer: true,
  allowCrypto: true,
  showStake: true,
  showStats: true,
  showGallery: true,
  usdToNgn: 1600,
  beneficiaryNoun: "parents",
  beneficiaryCount: "2",

  impactTitle: "Two ways to help",
  impactSub:
    "A one-time donation or ongoing monthly support — both go directly toward their medical care.",
  donateCardTitle: "One-time donation",
  donateCardPill: "Instant",
  donateCardDesc:
    "Pay by card or crypto. 100% of your donation reaches the family — no platform fees taken.",
  donateCardFeatures: [
    "Receipt within 60 seconds",
    "Zero platform fees",
    "Every cent reaches the family",
  ],
  donateCardCta: "Give now",
  donateCardIcon: "volunteer_activism",
  stakeCardTitle: "Stake & Earn",
  stakeCardPill: "Variable APY",
  stakeCardDesc:
    "Stake USDC into Aave V3 and keep your principal. Yield is split between you and the campaign — passive impact without losing your funds.",
  stakeCardFeatures: [
    "Keep your initial capital",
    "Passive impact generation",
    "Adjustable yield split ratio",
  ],
  stakeCardCta: "Start Staking",
  stakeCardIcon: "savings",
  stakeCardFootTitle: "Powered by Aave V3",
  stakeCardFootSub: "Battle-tested DeFi yield on Base",
  stakeCardFootIcon: "shield",

  galleryTitle: "The family you're helping",
  gallerySub:
    "A Logos Circle Benin family fighting two cancer diagnoses at once. Their children could lose both parents. Your generosity is their lifeline.",
  statsTitle: "Where every dollar goes",
  statsSub:
    "Full transparency. Every transaction logged on-chain so you can see exactly how your donation is used.",
  stats: [
    {
      value: "2",
      unit: "",
      label: "Parents in treatment",
      sublabel: "prostate cancer & ovarian cancer",
      icon: "family_restroom",
    },
    {
      value: "3×",
      unit: "/wk",
      label: "Dialysis sessions",
      sublabel: "keeping the father stable",
      icon: "medical_services",
    },
    {
      value: "100",
      unit: "%",
      label: "Goes to care",
      sublabel: "no platform fees deducted",
      icon: "local_hospital",
    },
    {
      value: "100",
      unit: "%",
      label: "On-chain transparency",
      sublabel: "every transaction verifiable",
      icon: "shield_with_heart",
    },
  ],
  donateTitle: "Make a donation",
  donateSub:
    "Every naira goes directly to keeping this family alive — dialysis, surgery, medication, and recovery. No platform fees. No middlemen.",
  donateIcon: "health_and_safety",

  heroImage: "/images/woman-1.jpg",
  galleryItems: [
    {
      tag: "The Father",
      title: "Fighting to stay",
      description: "On dialysis three times a week to stay alive while fighting prostate cancer and a kidney infection.",
      src: "/images/man-1.jpg",
      objectPosition: "right center",
    },
    { tag: "The Mother", title: "Facing surgery", description: "Diagnosed with Stage 3 ovarian cancer. Needs surgery urgently.", src: "/images/woman-1.jpg" },
    { tag: "Community", title: "Standing together", description: "Logos Circle Benin standing with this family. No one fights alone.", src: "/images/woman-2.jpg" },
  ],

  transparency: {
    treasury: "0x4f2b1d8c7a3b9e5d2f8c7a3b9e5d2f8c7a3ba1c7",
    signers: [
      "Logos Circle Benin (community lead)",
      "FundBrave platform key",
      "Family representative",
      "Community treasurer (rotating)",
      "Logos foundation (oversight)",
    ],
    flows: [
      {
        tone: "primary",
        icon: "volunteer_activism",
        title: "Direct donations",
        steps: [
          "Donor card / wallet",
          "FundBrave campaign vault",
          "Multisig family fund",
        ],
        description:
          "100% of donations route through the multisig and disburse directly to the family's medical care fund. No middlemen, no cuts.",
      },
      {
        tone: "secondary",
        icon: "autorenew",
        title: "Monthly sustainers",
        steps: [
          "Sustainer wallet",
          "USDC stake",
          "Multisig family fund",
        ],
        description:
          "Sustainer charges are batched and forwarded to the multisig. Cancellation refunds the un-disbursed portion.",
      },
      {
        tone: "tertiary",
        icon: "medication_liquid",
        title: "Medical disbursements",
        steps: [
          "Multisig vote (3-of-5)",
          "Per-treatment release",
          "Hospital payment",
        ],
        description:
          "Each disbursement maps to a specific treatment — dialysis session, surgery cost, or medication purchase — with on-chain receipts for full accountability.",
      },
    ],
    contracts: [
      {
        label: "Campaign contract",
        address: "0x8b3a91d7f4c2e6b9a8d1c4f7b9e2a5c8d1f4b7e0",
      },
      {
        label: "Sustainer relayer",
        address: "0x2c8e91a4b7d3f6e9a1c4b7d0f3e6a9c2b5d8e1f4",
      },
      {
        label: "USDC token",
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      },
      {
        label: "NGN off-ramp adapter",
        address: "0x91a4b7d3f6e9a1c4b7d0f3e6a9c2b5d8e1f4a7b0",
      },
    ],
    feed: [
      {
        kind: "donate",
        usd: 100,
        hash: "0xf3a1…b2e1",
        time: "5m ago",
        detail: "from anonymous",
      },
      {
        kind: "donate",
        usd: 50,
        hash: "0xa72c…0987",
        time: "22m ago",
        detail: "from Logos Circle member",
      },
      {
        kind: "stake",
        usd: 75,
        hash: "0x4b78…11ac",
        time: "1h ago",
        detail: "Sustainer signup",
      },
      {
        kind: "donate",
        usd: 200,
        hash: "0xc02f…f8a4",
        time: "3h ago",
        detail: "from Sarah K.",
      },
      {
        kind: "disburse",
        usd: 320,
        hash: "0x91d8…44e3",
        time: "yesterday",
        detail: "Dialysis session × 2",
      },
      {
        kind: "donate",
        usd: 500,
        hash: "0x83e1…dd29",
        time: "yesterday",
        detail: "from David O.",
      },
    ],
  },

  impact: {
    title: "Stake to Support",
    sub: "Deposit USDC into Aave V3 on Base. Your principal stays yours — only the yield funds medical care.",
    accent: "Earn while you help.",
    tvl: 0,
    generatedImpact: 0,
    supporters: 0,
    demoPrincipal: 100,
    demoYield: 7.5,
    loopSteps: [
      {
        title: "Deposit USDC",
        desc: "Stake any amount of USDC. It's deposited into Aave V3 on Base and starts earning yield immediately.",
      },
      {
        title: "Earn yield",
        desc: "Aave generates variable APY on your deposit. The yield is split between you and the campaign based on your chosen ratio.",
      },
      {
        title: "Fund care",
        desc: "The campaign's share of yield is disbursed by the multisig to cover dialysis sessions, surgery costs, and medication — with on-chain receipts.",
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
