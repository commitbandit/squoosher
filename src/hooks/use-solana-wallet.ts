"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useMemo } from "react";

import {
  getSolanaNativeBalance,
  getSolanaSplBalance,
} from "@/services/balance-service";

export const useSolanaWallet = () => {
  const { setVisible } = useWalletModal();
  const { publicKey, disconnect } = useWallet();

  const handleSignIn = useCallback(async () => {
    setVisible(true);
  }, [setVisible]);

  const handleSignOut = useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  const handleGetBalance = useCallback(
    async ({
      userAddress,
      tokenAddress,
    }: {
      userAddress: string;
      tokenAddress?: string;
    }) => {
      const publicKey = new PublicKey(userAddress);

      if (tokenAddress) {
        const balance = await getSolanaSplBalance({
          publicKey,
          tokenAddress: new PublicKey(tokenAddress),
        });

        return balance ?? 0n;
      }

      const balance = await getSolanaNativeBalance({ publicKey });

      return balance ?? 0n;
    },
    [],
  );

  return useMemo(
    () => ({
      signIn: handleSignIn,
      signOut: handleSignOut,
      getBalance: handleGetBalance,
      publicKey,
    }),
    [handleSignIn, handleSignOut, handleGetBalance, publicKey],
  );
};
