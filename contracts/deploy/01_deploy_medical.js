/**
 * Logos Circle Benin — Medical Emergency Campaign Deployment Script
 *
 * Deploys to Base / Base Sepolia:
 *   1. MedicalCampaign       — core fundraising contract
 *   2. MedicalStaking        — Aave yield → campaign donations
 *   3. AbeokutaCCTPReceiver  — receives CCTP cross-chain USDC transfers
 *
 * Campaign goal: ₦1,000,000 (~$625 USDC) min | $2,000 USDC max (allows overfunding for ongoing treatment)
 *
 * Usage:
 *   npm run deploy:testnet   (Base Sepolia)
 *   npm run deploy:mainnet   (Base Mainnet)
 */

const { ethers, network } = require("hardhat");
const fs   = require("fs");
const path = require("path");

// ─── Network configuration ───────────────────────────────────────────────────

const CONFIG = {
  // Base Sepolia (testnet)
  84532: {
    name:          "Base Sepolia",
    usdc:          "0xf269f54304f8DB2dB613341CC7E189B02BEf98dE", // FundBrave mock USDC on testnet
    aavePool:      "0xA14694B3a1788D22c660C837842B2d22E24983B4",
    aUsdc:         "0xCdF55352fa73B548d81E57f2Ebb691462bD4a95F",
    swapAdapter:   "0x5708A691d0242899Ae12dD8F47876319730F5987", // MockSwapAdapter on Base Sepolia
    bridgeAddress: process.env.BRIDGE_ADDRESS || ethers.ZeroAddress,
    goalMinUSDC:   625,    // ≈ ₦1,000,000 at 1600 NGN/USD
    goalMaxUSDC:   2_000,  // room for ongoing dialysis/treatment costs
    durationDays:  90,
  },
  // Base Mainnet
  8453: {
    name:          "Base Mainnet",
    usdc:          "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    aavePool:      "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
    aUsdc:         "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB",
    swapAdapter:   process.env.MAINNET_SWAP_ADAPTER || null,
    uniswapRouter: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
    weth:          "0x4200000000000000000000000000000000000006",
    bridgeAddress: process.env.BRIDGE_ADDRESS || ethers.ZeroAddress,
    goalMinUSDC:   625,
    goalMaxUSDC:   2_000,
    durationDays:  90,
  },
  // Hardhat localhost
  31337: {
    name:         "Hardhat",
    usdc:         null,
    aavePool:     null,
    aUsdc:        null,
    swapAdapter:  null,
    goalMinUSDC:  625,
    goalMaxUSDC:  2_000,
    durationDays: 90,
  },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId    = (await ethers.provider.getNetwork()).chainId;
  const cfg        = CONFIG[Number(chainId)];

  if (!cfg) throw new Error(`No config for chain ${chainId}`);

  console.log(`\n================================================`);
  console.log(` Logos Circle Benin — Medical Emergency Campaign`);
  console.log(` Network:  ${cfg.name}`);
  console.log(` Deployer: ${deployer.address}`);
  console.log(`================================================\n`);

  const treasury      = process.env.TREASURY_MULTISIG;
  if (!treasury) throw new Error("TREASURY_MULTISIG not set — create a Gnosis Safe first.");

  const platformWallet = process.env.PLATFORM_WALLET || deployer.address;
  console.log(`Treasury (Gnosis Safe): ${treasury}`);
  console.log(`Platform wallet:        ${platformWallet}\n`);

  const usdcAddress  = cfg.usdc       || process.env.USDC_ADDRESS;
  const aaveAddress  = cfg.aavePool   || process.env.AAVE_POOL_ADDRESS;
  const aUsdcAddress = cfg.aUsdc      || process.env.AUSDC_ADDRESS;
  const bridgeAddress = cfg.bridgeAddress;
  const isMainnet    = Number(chainId) === 8453;

  if (!usdcAddress || !aaveAddress || !aUsdcAddress) {
    throw new Error("Missing USDC/Aave addresses.");
  }

  if (bridgeAddress === ethers.ZeroAddress) {
    console.warn("⚠  BRIDGE_ADDRESS not set — cross-chain donations disabled until wired up.\n");
  }

  // ── Swap adapter (mainnet only deploys UniswapAdapterUSDC) ───────────────
  let finalSwapAdapter = cfg.swapAdapter;
  if (isMainnet && !finalSwapAdapter) {
    console.log("1a. Deploying UniswapAdapterUSDC...");
    const AdapterFactory = await ethers.getContractFactory("UniswapAdapterUSDC");
    const adapter = await AdapterFactory.deploy(
      cfg.uniswapRouter, usdcAddress, cfg.weth, deployer.address
    );
    await adapter.waitForDeployment();
    finalSwapAdapter = await adapter.getAddress();
    console.log(`    UniswapAdapterUSDC: ${finalSwapAdapter}`);
  } else if (!finalSwapAdapter) {
    finalSwapAdapter = ethers.ZeroAddress;
  }

  // ── Campaign parameters ───────────────────────────────────────────────────
  const USDC_DECIMALS = 6;
  const goalMin       = BigInt(cfg.goalMinUSDC) * BigInt(10 ** USDC_DECIMALS);
  const goalMax       = BigInt(cfg.goalMaxUSDC) * BigInt(10 ** USDC_DECIMALS);
  const deadlineTs    = Math.floor(Date.now() / 1000) + cfg.durationDays * 86400;

  console.log(`Goal: $${cfg.goalMinUSDC} – $${cfg.goalMaxUSDC} USDC  (≈ ₦${(cfg.goalMinUSDC * 1600).toLocaleString()} – ₦${(cfg.goalMaxUSDC * 1600).toLocaleString()})`);
  console.log(`Deadline: ${new Date(deadlineTs * 1000).toISOString()} (${cfg.durationDays} days)\n`);

  // ── 1. MedicalCampaign ────────────────────────────────────────────────────
  console.log("1. Deploying MedicalCampaign...");
  const CampaignFactory = await ethers.getContractFactory("MedicalCampaign");
  const campaign = await CampaignFactory.deploy(
    usdcAddress, finalSwapAdapter, treasury, goalMin, goalMax, deadlineTs
  );
  await campaign.waitForDeployment();
  const campaignAddress = await campaign.getAddress();
  console.log(`   MedicalCampaign deployed: ${campaignAddress}`);

  // ── 2. MedicalStaking ─────────────────────────────────────────────────────
  console.log("2. Deploying MedicalStaking...");
  const StakingFactory = await ethers.getContractFactory("MedicalStaking");
  const staking = await StakingFactory.deploy(
    aaveAddress, usdcAddress, aUsdcAddress, campaignAddress, platformWallet
  );
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log(`   MedicalStaking deployed: ${stakingAddress}`);

  // ── 3. AbeokutaCCTPReceiver ────────────────────────────────────────────────
  console.log("3. Deploying AbeokutaCCTPReceiver...");
  const ReceiverFactory = await ethers.getContractFactory("AbeokutaCCTPReceiver");
  const receiver = await ReceiverFactory.deploy(usdcAddress, campaignAddress);
  await receiver.waitForDeployment();
  const receiverAddress = await receiver.getAddress();
  console.log(`   AbeokutaCCTPReceiver deployed: ${receiverAddress}`);

  // ── 4. Wire contracts ─────────────────────────────────────────────────────
  console.log("4. Wiring contracts...");
  await (await campaign.setStakingPool(stakingAddress)).wait();
  console.log(`   setStakingPool(${stakingAddress}) ✓`);

  if (bridgeAddress && bridgeAddress !== ethers.ZeroAddress) {
    await (await campaign.setBridgeContract(bridgeAddress)).wait();
    console.log(`   setBridgeContract(${bridgeAddress}) ✓`);
  }

  const watcherAddress = process.env.WATCHER_ADDRESS;
  if (watcherAddress) {
    await (await campaign.setWatcher(watcherAddress)).wait();
    console.log(`   setWatcher(${watcherAddress}) ✓`);
  } else {
    console.warn("⚠  WATCHER_ADDRESS not set — fiat (Paystack) donations disabled until campaign.setWatcher() is called.");
  }

  // ── 5. Save deployment ────────────────────────────────────────────────────
  const output = {
    network: cfg.name, chainId: Number(chainId),
    deployedAt: new Date().toISOString(),
    MedicalCampaign:       campaignAddress,
    MedicalStaking:        stakingAddress,
    AbeokutaCCTPReceiver:  receiverAddress,
    USDC: usdcAddress, AavePool: aaveAddress, aUSDC: aUsdcAddress,
    SwapAdapter: finalSwapAdapter, Treasury: treasury,
    GoalMinUSDC: cfg.goalMinUSDC, GoalMaxUSDC: cfg.goalMaxUSDC,
    DeadlineTs: deadlineTs,
  };

  const outDir  = path.join(__dirname, "../deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${Number(chainId)}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

  console.log(`\n================================================`);
  console.log(` Deployment complete!`);
  console.log(`------------------------------------------------`);
  console.log(` MedicalCampaign:      ${campaignAddress}`);
  console.log(` MedicalStaking:       ${stakingAddress}`);
  console.log(` AbeokutaCCTPReceiver: ${receiverAddress}`);
  console.log(`================================================\n`);
  console.log(`Update frontend .env.local:`);
  console.log(`  NEXT_PUBLIC_CAMPAIGN_ADDRESS=${campaignAddress}`);
  console.log(`  NEXT_PUBLIC_STAKING_ADDRESS=${stakingAddress}`);
  console.log(`  NEXT_PUBLIC_CCTP_RECEIVER_ADDRESS=${receiverAddress}`);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
