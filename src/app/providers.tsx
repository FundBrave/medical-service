"use client";

import { WagmiProvider, http } from "wagmi";
import { baseSepolia, sepolia, optimismSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "sonner";
import "@rainbow-me/rainbowkit/styles.css";

// Remove expired WalletConnect v2 pairings before wagmi initializes to prevent
// endless WebSocket retry loops on stale relay subscriptions.
if (typeof window !== "undefined") {
  try {
    const wcKeys = Object.keys(localStorage).filter((k) => k.startsWith("wc@2:"));
    if (wcKeys.length > 0) {
      const pairingKey = wcKeys.find((k) => k.includes("pairing"));
      if (pairingKey) {
        const pairings = JSON.parse(localStorage.getItem(pairingKey) ?? "{}") as Record<
          string,
          { expiry?: number }
        >;
        const now = Math.floor(Date.now() / 1000);
        const anyExpired = Object.values(pairings).some((p) => p.expiry && p.expiry < now);
        if (anyExpired) {
          wcKeys.forEach((k) => localStorage.removeItem(k));
        }
      }
    }
  } catch {
    // never crash the app over storage cleanup
  }
}

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const rpc = {
  baseSepolia: alchemyKey
    ? `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`
    : "https://sepolia.base.org",
  sepolia: alchemyKey
    ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`
    : "https://ethereum-sepolia-rpc.publicnode.com",
  optimismSepolia: "https://sepolia.optimism.io",
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://medical.fundbrave.com";

const config = getDefaultConfig({
  appName: "Logos Circle Benin — Medical Emergency",
  // "PLACEHOLDER" satisfies RainbowKit's non-empty check during SSR/build.
  // Replace with a real project ID from cloud.walletconnect.com for WalletConnect to work.
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "PLACEHOLDER",
  appUrl,
  appDescription: "Raise funds for urgent medical care for a Logos Circle Benin family in crisis.",
  chains: [baseSepolia, sepolia, optimismSepolia],
  transports: {
    [baseSepolia.id]:      http(rpc.baseSepolia),
    [sepolia.id]:          http(rpc.sepolia),
    [optimismSepolia.id]:  http(rpc.optimismSepolia),
  },
  ssr: false,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#DC2626",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
          modalSize="compact"
        >
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "#1F2937",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                borderRadius: "14px",
              },
              duration: 5000,
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
