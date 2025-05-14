"use client";

import { createRpc, Rpc } from "@lightprotocol/stateless.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { DEVNET_RPC_URL, MAINNET_RPC_URL } from "@/config";

interface NetworkContextType {
  config: {
    network: WalletAdapterNetwork;
    rpcConnection: Rpc;
    rpcUrl: string;
  };
  toggleNetwork: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState({
    network: WalletAdapterNetwork.Devnet,
    rpcConnection: createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL),
    rpcUrl: DEVNET_RPC_URL,
  });

  const getRpcUrlForNetwork = useCallback((network: WalletAdapterNetwork) => {
    return network === WalletAdapterNetwork.Devnet
      ? DEVNET_RPC_URL
      : MAINNET_RPC_URL;
  }, []);

  const toggleNetwork = useCallback(() => {
    const newNetwork =
      config.network === WalletAdapterNetwork.Devnet
        ? WalletAdapterNetwork.Mainnet
        : WalletAdapterNetwork.Devnet;

    const rpcUrl = getRpcUrlForNetwork(newNetwork);
    const newRpcConnection = createRpc(rpcUrl, rpcUrl, rpcUrl);

    setConfig({
      network: newNetwork,
      rpcConnection: newRpcConnection,
      rpcUrl,
    });
  }, [config, getRpcUrlForNetwork]);

  const value = useMemo(
    () => ({
      config,
      toggleNetwork,
    }),
    [config, toggleNetwork],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);

  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }

  return context;
}
