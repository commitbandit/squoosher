"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

import { getSolanaNativeBalance } from "@/services/balance-service";
import { getAirdropSol } from "@/services/airdrop-sol";

type Balance = {
  readable: number;
  big: bigint;
};

export type PayerContextType = {
  payer: Keypair;
  generateNewPayer: () => void;
  importPrivateKey: (privateKey: string) => Keypair | null;
  airdropSol: () => Promise<string | null>;
  balance: Balance;
  fetchSolBalance: (publicKey: PublicKey) => Promise<Balance>;
};

const PayerContext = createContext<PayerContextType | null>(null);

export const usePayerContext = () => {
  const context = useContext(PayerContext);

  if (!context) {
    throw new Error("usePayerContext must be used within a PayerProvider");
  }

  return context;
};

const initialBalance = {
  readable: 0,
  big: 0n,
};

export const PayerProvider = ({ children }: { children: ReactNode }) => {
  const [payer, setPayer] = useState<Keypair>(Keypair.generate());
  const [balance, setBalance] = useState<Balance>(initialBalance);

  const generateNewPayer = useCallback(() => {
    setPayer(Keypair.generate());
    setBalance(initialBalance);
  }, []);

  const fetchSolBalance = useCallback(async (publicKey: PublicKey) => {
    try {
      const balance = await getSolanaNativeBalance({
        publicKey,
      });

      if (!balance) throw new Error("Balance is null");
      const obj = {
        readable: Number(balance) / LAMPORTS_PER_SOL,
        big: balance,
      };

      setBalance(obj);

      return obj;
    } catch (error) {
      console.error("Error fetching payer balance:", error);

      return initialBalance;
    }
  }, []);

  const importPrivateKey = useCallback((privateKeyString: string) => {
    try {
      // Try to decode the base58 private key
      let secretKey: Uint8Array;

      try {
        // Attempt to decode the key as base58
        secretKey = bs58.decode(privateKeyString);
      } catch (error) {
        console.error("Error decoding private key:", error);

        // If it fails, check if it's a raw array representation
        try {
          const parsedArray = JSON.parse(privateKeyString);

          if (Array.isArray(parsedArray) && parsedArray.length === 64) {
            secretKey = Uint8Array.from(parsedArray);
          } else {
            throw new Error("Invalid key format");
          }
        } catch (parseError) {
          console.error("Error parsing private key:", parseError);
          throw new Error("Invalid private key format");
        }
      }

      // Create keypair from secret key
      const importedKeypair = Keypair.fromSecretKey(secretKey);

      setPayer(importedKeypair);

      return importedKeypair;
    } catch (error) {
      console.error("Error importing private key:", error);

      return null;
    }
  }, []);

  const airdropSol = useCallback(async () => {
    try {
      const signature = await getAirdropSol(payer.publicKey);

      return signature;
    } catch (error) {
      console.error("Error during airdrop:", error);

      return null;
    }
  }, [payer.publicKey]);

  const value = useMemo(
    () => ({
      payer,
      generateNewPayer,
      importPrivateKey,
      airdropSol,
      balance,
      fetchSolBalance,
    }),
    [
      payer,
      generateNewPayer,
      importPrivateKey,
      airdropSol,
      balance,
      fetchSolBalance,
    ],
  );

  return (
    <PayerContext.Provider value={value}>{children}</PayerContext.Provider>
  );
};
