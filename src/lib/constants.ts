export const CAMPAIGN_DEFAULTS = {
  campaignName: "Mwanza Children's Hospital",
  location: "Mwanza, Tanzania",
  goal: 51000,
  endDate: "Mar 15",
  daysLeft: 42,
  headline1: "Surgery",
  headline2: "for 60 children",
  headline3: "this winter",
  subhead:
    "Fund pediatric heart surgeries for 60 children at Mwanza Children's Hospital. Each procedure costs $850 and saves a child's life — fully funded by our donor pool.",
  initialRaised: 28420,
  initialDonors: 312,
  primaryColor: "#2563eb",
  secondaryColor: "#0d9488",
  tertiaryColor: "#b54e00",
  allowCard: true,
  allowCrypto: true,
  showStake: true,
  showStats: true,
  showGallery: true,
  usdToNgn: 1370,
  beneficiaryNoun: "children",
  beneficiaryCount: "60",

  impactTitle: "Two ways to fund",
  impactSub:
    "A one-time donation, or recurring monthly support — both go directly to the hospital.",
  donateCardTitle: "One-time gift",
  donateCardPill: "Instant",
  donateCardDesc:
    "Pay by card or crypto. 100% of your gift reaches the hospital — no platform fees.",
  donateCardFeatures: [
    "Receipt within 60 seconds",
    "Zero platform fees",
    "Tax-deductible (501(c)(3))",
  ],
  donateCardCta: "Donate now",
  donateCardIcon: "volunteer_activism",
  stakeCardTitle: "Monthly sustainer",
  stakeCardPill: "Recurring",
  stakeCardDesc:
    "Become a monthly sustainer. We'll bill your card on the same day each month — cancel anytime.",
  stakeCardFeatures: [
    "Fund one child per quarter",
    "Quarterly impact report",
    "Invite to annual donor call",
  ],
  stakeCardCta: "Become a sustainer",
  stakeCardIcon: "autorenew",
  stakeCardFootTitle: "Powered by Stripe",
  stakeCardFootSub: "PCI-compliant recurring billing",
  stakeCardFootIcon: "shield",

  galleryTitle: "Patients we're helping",
  gallerySub:
    "Real stories from the families on the waiting list. Add photos and the grid will adapt to however many you upload.",
  statsTitle: "Where every dollar goes",
  statsSub:
    "Audited annually. Every transaction logged on-chain for full transparency.",
  stats: [
    {
      value: "60",
      unit: "",
      label: "Surgeries to fund",
      sublabel: "pediatric cardiac procedures",
      icon: "surgical",
    },
    {
      value: "$850",
      unit: "",
      label: "Cost per child",
      sublabel: "inclusive of post-op care",
      icon: "pediatrics",
    },
    {
      value: "94",
      unit: "¢/$",
      label: "Direct to hospital",
      sublabel: "after Stripe & gas fees",
      icon: "local_hospital",
    },
    {
      value: "100",
      unit: "%",
      label: "Audit transparency",
      sublabel: "every tx publicly verifiable",
      icon: "shield_with_heart",
    },
  ],
  donateTitle: "Make a donation",
  donateSub:
    "Every gift goes directly to surgical care at Mwanza Children's Hospital. Pick card or crypto — both are converted to USDC and disbursed on-chain.",
  donateIcon: "health_and_safety",

  galleryItems: [
    {
      tag: "Patient Story",
      title: "Add a photo",
      description:
        "Drop in images of patients, ward life, or care team members. The grid adapts to however many you provide.",
    },
    { tag: "Care Team", title: "Surgical staff" },
    { tag: "Recovery", title: "Post-op ward" },
    { tag: "Outreach", title: "Mobile clinic" },
  ],

  transparency: {
    treasury: "0x4f2b1d8c7a3b9e5d2f8c7a3b9e5d2f8c7a3ba1c7",
    signers: [
      "Dr. Adaeze Okafor (Hospital director)",
      "Eze Audit & Compliance, LLP",
      "FundBrave platform key",
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
          "Multisig hospital treasury",
        ],
        description:
          "100% of donations route through the multisig and disburse to the hospital's USDC account, off-ramped to NGN by the hospital's custodian.",
      },
      {
        tone: "secondary",
        icon: "autorenew",
        title: "Monthly sustainers",
        steps: [
          "Sustainer card",
          "Stripe → USDC bridge",
          "Multisig hospital treasury",
        ],
        description:
          "Sustainer charges are batched daily and forwarded to the multisig. Cancellation refunds the un-disbursed portion.",
      },
      {
        tone: "tertiary",
        icon: "medication_liquid",
        title: "Hospital disbursements",
        steps: [
          "Multisig vote (3-of-5)",
          "Per-surgery release",
          "Local NGN off-ramp",
        ],
        description:
          "Each $850 release maps to one named surgery. The hospital files an on-chain receipt with anonymized patient ID after the procedure.",
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
        usd: 50,
        hash: "0xf3a1…b2e1",
        time: "2m ago",
        detail: "from anonymous",
      },
      {
        kind: "donate",
        usd: 250,
        hash: "0xa72c…0987",
        time: "14m ago",
        detail: "from David O.",
      },
      {
        kind: "disburse",
        usd: 850,
        hash: "0x91d8…44e3",
        time: "1h ago",
        detail: "Surgery #28 · Amina T.",
      },
      {
        kind: "stake",
        usd: 200,
        hash: "0x4b78…11ac",
        time: "3h ago",
        detail: "Sustainer signup",
      },
      {
        kind: "donate",
        usd: 100,
        hash: "0xc02f…f8a4",
        time: "5h ago",
        detail: "from Sarah K.",
      },
      {
        kind: "disburse",
        usd: 850,
        hash: "0x83e1…dd29",
        time: "yesterday",
        detail: "Surgery #27 · Tomi B.",
      },
    ],
  },

  impact: {
    title: "Support to fund care",
    sub: "Become a monthly sustainer and your contribution funds care every month.",
    accent: "Choose your impact share.",
    tvl: 41200,
    generatedImpact: 8742,
    supporters: 64,
    demoPrincipal: 250,
    demoYield: 18.42,
    loopSteps: [
      {
        title: "Become a sustainer",
        desc: "Set up a recurring monthly gift via card or USDC. Cancel any time.",
      },
      {
        title: "Funds pool & disburse",
        desc: "All sustainer payments are batched and disbursed by the multisig to the hospital's USDC account.",
      },
      {
        title: "Care delivered",
        desc: "Each $850 maps to one named pediatric heart surgery, with an on-chain receipt after the procedure.",
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
