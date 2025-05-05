"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { useCallback, useMemo } from "react";

import {
  getSolanaNativeBalance,
  getSolanaSplBalance,
} from "@/services/balance-service";

export const useSolanaWallet = () => {
  const { setVisible } = useWalletModal();
  const wallet = useWallet();
  const { connection } = useConnection();
  const { disconnect } = useWallet();

  const handleSignIn = useCallback(async () => {
    setVisible(true);
  }, [setVisible]);

  const handleSignOut = useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  const handleSendTransaction = useCallback(
    async (tx: Transaction | VersionedTransaction) =>
      wallet.sendTransaction(tx, connection),
    [wallet, connection],
  );

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
      sendTransaction: handleSendTransaction,
      getBalance: handleGetBalance,
      state: wallet.publicKey
        ? {
            publicKey: wallet.publicKey,
            address: wallet.publicKey.toBase58(),
            shortAddress: `${wallet.publicKey.toBase58().slice(0, 4)}...${wallet.publicKey.toBase58().slice(-4)}`,
          }
        : null,
    }),
    [
      handleSignIn,
      handleSignOut,
      handleSendTransaction,
      handleGetBalance,
      wallet.publicKey,
    ],
  );
};
