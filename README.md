# medical-service

FundBrave medical donation campaign template — a reusable, multi-page donation platform with card + crypto payments, multisig governance, and on-chain transparency.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4** + custom Material 3 "Stitch" dark design system
- **Manrope** (headlines) + **Inter** (body) + **Material Symbols Outlined** (icons)

## Pages

| Route | Description |
|-------|-------------|
| `/` (Landing) | Hero, progress card, impact models, stats bar, photo gallery |
| Donate | Card (Stripe-style) + crypto (USDC/ETH/DAI) payment flow |
| Success | Post-donation confirmation with share buttons |
| Transparency | Fund flow dashboard, multisig, contracts, live activity feed |
| Support | Sustainer position, yield split configurator, deposit/withdraw |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Currency

NGN primary, USD secondary. Exchange rate configurable in `src/lib/constants.ts`.
