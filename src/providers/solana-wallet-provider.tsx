import { type Adapter } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { type FC, PropsWithChildren, useMemo } from "react";

import { useNetwork } from "@/contexts/network-context";

import "@solana/wallet-adapter-react-ui/styles.css";

export const SolanaWalletProvider: FC<PropsWithChildren> = ({ children }) => {
  const { config } = useNetwork();
  const endpoint = useMemo(
    () => config.rpcUrl || clusterApiUrl(config.network),
    [config],
  );

  const wallets = useMemo(() => {
    const walletAdapters: Adapter[] = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ];

    return walletAdapters;
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider autoConnect wallets={wallets}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
