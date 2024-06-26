import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { Inter } from "next/font/google";
import { getChain } from "../utils/viem";
import { useMemo } from "react";

const inter = Inter({ subsets: ["latin"] });

const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_VITE_INFURA_PROJECT_ID;

function initWagmi(networkId: string) {
    const id = parseInt(networkId);
    const chain = getChain(id);
    if (!chain) {
        throw new Error(`Chain with network id '${networkId}' found`);
    }

    const { chains, publicClient, webSocketPublicClient } = configureChains(
        [chain],
        [
            INFURA_PROJECT_ID
                ? infuraProvider({ apiKey: INFURA_PROJECT_ID })
                : publicProvider(),
        ]
    );

    const { connectors } = getDefaultWallets({
        appName: "Renown",
        projectId: process.env.NEXT_PUBLIC_VITE_WALLET_CONNECT_PROJECT_ID || "",
        chains,
    });

    const wagmiConfig = createConfig({
        autoConnect: true,
        connectors,
        publicClient,
        webSocketPublicClient,
    });

    return { wagmiConfig, chains } as const;
}

function MyApp({ Component, pageProps, router }: AppProps) {
    const networkId = router.query["network"]?.toString();
    const { wagmiConfig, chains } = useMemo(
        () => initWagmi(networkId ?? "1"),
        [networkId]
    );
    return (
        <main className={inter.className}>
            <WagmiConfig config={wagmiConfig}>
                <RainbowKitProvider chains={chains}>
                    <Component {...pageProps} />
                </RainbowKitProvider>
            </WagmiConfig>
        </main>
    );
}

export default MyApp;
