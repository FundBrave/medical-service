# Save a Family Fighting Cancer

A fundraising campaign built on Base for a Logos Circle Benin family facing simultaneous cancer diagnoses — a father on dialysis with prostate cancer, and a mother with Stage 3 ovarian cancer awaiting surgery.

**Campaign goal:** ₦1,500,000 (~$1,150 USDC) · **Deadline:** 21 days from 26 May 2026 · **Network:** Base Mainnet

---

## How it works

Donors can give in three ways:

- **Direct crypto** — USDC, ETH, DAI, or any ERC20 (auto-swapped to USDC on-chain)
- **Cross-chain** — USDC from Ethereum, Optimism, or Arbitrum via Circle CCTP
- **Bank transfer** — NGN bank transfer tracked off-chain and attested on-chain by the admin

Supporters can also **stake USDC** into Aave V3 and route their yield to the campaign while keeping their principal.

---

## Repository structure

```
medical-service/
├── contracts/          Hardhat — Solidity smart contracts
├── frontend/           Next.js 15 — campaign website
├── watcher/            Node.js — monitors BTC/SOL deposit addresses
└── vercel.json         Vercel monorepo config (rootDirectory: frontend)
```

---

## Smart contracts

Deployed on **Base Mainnet** (chainId 8453) on 26 May 2026.

| Contract | Address |
|---|---|
| MedicalCampaign | `0x0bF9c75c449AB0F24C0dDE968524933c8cf43b77` |
| MedicalStaking | `0x4a57577D67394C1A17d4c0AF0BbeFa74CBA8a5a5` |
| AbeokutaCCTPReceiver | `0x9092C86AB900DCB292D2A5B0C28cdD3A22Ab791E` |
| Treasury (owner wallet) | `0x379739a949e5b2Afa2c9CB0555092727725f726C` |
| USDC (Base) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

### MedicalCampaign

Core fundraising contract. Accepts USDC, ERC20 tokens (swapped via Uniswap), and ETH.

Key functions:

| Function | Who | Description |
|---|---|---|
| `donateUSDC(amount)` | Anyone | Direct USDC donation |
| `donateERC20(token, amount, minOut)` | Anyone | Token → USDC swap then donate |
| `donateETH(minOut)` | Anyone | ETH → USDC swap then donate |
| `creditOffchainRaised(amount, note)` | Owner | Attest an offchain donation (NGN bank transfer, etc.) |
| `withdrawToTreasury()` | Owner | Transfer all USDC to the treasury wallet |
| `getCampaignStats()` | View | Returns 10 fields including onchain/offchain raised |
| `progressBps()` | View | Progress as basis points (0–10000) |
| `claimRefund()` | Donor | Reclaim USDC if campaign fails |

Circuit breakers: 5,000 USDC per transaction, 10,000/hour, 30,000/day.

### MedicalStaking

Deposits USDC into Aave V3. Yield is split between the staker and the campaign according to a configurable ratio.

Key functions: `stake`, `unstake`, `claimYield`, `compound`, `harvestAndDistribute`, `setYieldSplit`.

### AbeokutaCCTPReceiver

Receives natively minted USDC from Circle CCTP after a cross-chain burn on a source chain. Calls `creditDonation()` on the campaign.

---

## Frontend

**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, wagmi v2, viem, RainbowKit, GSAP, Sonner

### Pages

| Route | Description |
|---|---|
| `/` | Landing — hero, progress card, donation methods, stats |
| `/donate` | Full donation flow (USDC, ERC20, ETH, cross-chain, bank transfer) |
| `/stake` | Stake USDC and configure yield split |
| `/dashboard` | Campaign overview and recent donations |
| `/admin` | Owner-only: withdraw funds, record offchain donations, harvest yield |
| `/privacy` | Privacy policy |

### Key hooks

| Hook | Description |
|---|---|
| `useCampaignStats` | Reads live on-chain stats (totalRaised, donors, deadline, progress) |
| `useDonate` | Manages same-chain donation flow (approve → donate) |
| `useCrossChainDonate` | CCTP cross-chain flow (burn on source → relay on Base) |
| `useStaking` | Stake, unstake, claim yield, compound |
| `useAdmin` | Withdraw to treasury, harvest yield, credit offchain donations |
| `useNGNRate` | Live USD → NGN exchange rate |

---

## Local development

### Prerequisites

- Node.js 18+
- An Alchemy API key (for RPC)

### Contracts

```bash
cd contracts
cp .env.example .env        # fill in PRIVATE_KEY, ALCHEMY_API_KEY, TREASURY_MULTISIG
npm install

npm run compile             # compile Solidity
npm test                    # run test suite
npm run deploy:testnet      # deploy to Base Sepolia
npm run deploy:mainnet      # deploy to Base Mainnet
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local    # fill in contract addresses
npm install

npm run dev                 # dev server on :3002
npm run build               # production build
npm run type-check          # tsc --noEmit
npm run lint                # ESLint
```

---

## Environment variables

### `contracts/.env`

```env
PRIVATE_KEY=0x...                   # deployer wallet private key
ALCHEMY_API_KEY=                    # Alchemy API key
BASESCAN_API_KEY=                   # for contract verification
TREASURY_MULTISIG=0x...             # wallet that receives withdrawn funds
PLATFORM_WALLET=0x...               # receives platform fee from staking yield
WATCHER_ADDRESS=0x...               # hot wallet authorised to call creditDonation()
MAINNET_SWAP_ADAPTER=               # pre-deployed UniswapAdapterUSDC (leave empty to deploy new)
```

### `frontend/.env.local`

```env
NEXT_PUBLIC_CAMPAIGN_ADDRESS=0x0bF9c75c449AB0F24C0dDE968524933c8cf43b77
NEXT_PUBLIC_STAKING_ADDRESS=0x4a57577D67394C1A17d4c0AF0BbeFa74CBA8a5a5
NEXT_PUBLIC_CCTP_RECEIVER_ADDRESS=0x9092C86AB900DCB292D2A5B0C28cdD3A22Ab791E
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_TREASURY_ADDRESS=0x379739a949e5b2Afa2c9CB0555092727725f726C
NEXT_PUBLIC_DAI_ADDRESS=0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb
NEXT_PUBLIC_WETH_ADDRESS=0x4200000000000000000000000000000000000006
NEXT_PUBLIC_BTC_ADDRESS=                        # BTC deposit address for manual donations
NEXT_PUBLIC_SOL_ADDRESS=                        # SOL deposit address for manual donations
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=           # from cloud.walletconnect.com
NEXT_PUBLIC_BRIDGE_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BRIDGE_ETHEREUM_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BRIDGE_ARBITRUM_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BRIDGE_OPTIMISM_ADDRESS=0x0000000000000000000000000000000000000000
```

---

## Deployment

### Vercel (frontend)

`vercel.json` sets `rootDirectory: frontend`. First deploy:

```bash
vercel login
vercel --prod
```

Add all `NEXT_PUBLIC_*` env vars in **Project Settings → Environment Variables**, then redeploy. Subsequent pushes to `main` auto-deploy.

### Contracts

```bash
cd contracts
npm run deploy:mainnet
# Deployed addresses are saved to contracts/deployments/8453.json
# Update frontend/.env.local with the new addresses
```

To verify on Basescan:

```bash
npx hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## Architecture notes

- **`offchainRaised` counter** — Admin calls `creditOffchainRaised(amount, note)` to record NGN bank transfers and other fiat donations. This increments a separate counter without moving any USDC, so the on-chain USDC balance remains correct for refund calculations. The frontend displays the combined total.

- **No GoalNotReached restriction** — The owner can withdraw at any time. The refund mechanism (`claimRefund`) is still available to donors if the campaign ends before reaching the goal.

- **CCTP cross-chain flow** — Source chain burns USDC → Circle's attestation service → `AbeokutaCCTPReceiver.completeTransfer()` on Base → funds credited to campaign.

- **Staking yield split** — Default: 79% to campaign, 19% to staker, 2% platform fee. Each staker can customise their split via `setYieldSplit()`.

- **Watcher service** — A separate Node.js service monitors BTC and SOL deposit addresses. On detection, it converts the amount to USDC using live CoinGecko prices and calls `donateUSDCFor()` from a pre-approved float wallet.

---

## Security

- Circuit breaker rate limits on all donations (per-tx, hourly, daily caps)
- OpenZeppelin `Ownable`, `ReentrancyGuard`, `Pausable`, `SafeERC20`
- CSP headers set per-request with a cryptographic nonce (`frontend/middleware.ts`)
- All secrets in environment variables — never committed
- `contracts/.env` is gitignored; see `.env.example` for required variables
