"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { getSolanaNativeBalance } from "@/services/balance-service";
import { getAirdropSol } from "@/services/airdrop-sol";
import { generateWalletState } from "@/utils/wallet";
import { useNetwork } from "@/contexts/network-context";

const LS_WALLET_KEY = "squoosher-wallet";
const LS_AUTH_TYPE_KEY = "squoosher-auth-type";

const saveWalletToLocalStorage = (keypair: Keypair) => {
  if (typeof window !== "undefined") {
    const secretKeyString = bs58.encode(keypair.secretKey);

    localStorage.setItem(LS_WALLET_KEY, secretKeyString);
  }
};

const saveAuthTypeToLocalStorage = (authType: AuthType) => {
  if (typeof window !== "undefined" && authType !== null) {
    localStorage.setItem(LS_AUTH_TYPE_KEY, authType);
  }
};

const clearWalletFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LS_WALLET_KEY);
    localStorage.removeItem(LS_AUTH_TYPE_KEY);
  }
};

const getWalletFromLocalStorage = (): Keypair | null => {
  if (typeof window !== "undefined") {
    const secretKeyString = localStorage.getItem(LS_WALLET_KEY);

    if (secretKeyString) {
      try {
        const secretKey = bs58.decode(secretKeyString);

        return Keypair.fromSecretKey(secretKey);
      } catch (error) {
        console.error("Error loading wallet from localStorage:", error);

        return null;
      }
    }
  }

  return null;
};

const getAuthTypeFromLocalStorage = (): AuthType => {
  if (typeof window !== "undefined") {
    const authType = localStorage.getItem(LS_AUTH_TYPE_KEY) as AuthType;

    return authType || null;
  }

  return null;
};

type Balance = {
  readable: number;
  big: bigint;
};

type ConnectedWallet = {
  publicKey: PublicKey;
  address: string;
  shortAddress: string;
  keypair?: Keypair;
};

type AuthType = "connect" | "create" | "import" | null;

export type WalletContextType = {
  authType: AuthType;
  state: ConnectedWallet | null;
  balance: Balance | null;
  isConnecting: boolean;

  openModalAdapter: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  createNewWallet: () => void;
  importWalletFromPrivateKey: (privateKey: string) => Keypair | null;

  fetchBalance: (publicKey?: PublicKey) => Promise<Balance>;
  requestAirdrop: () => Promise<string | null>;
};

const initialBalance = {
  readable: 0,
  big: 0n,
};

const WalletContext = createContext<WalletContextType | null>(null);

export const useWalletContext = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }

  return context;
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { config } = useNetwork();
  const [authType, setAuthType] = useState<AuthType>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [state, setState] = useState<ConnectedWallet | null>(null);
  const { publicKey: walletPublicKey, signIn, signOut } = useSolanaWallet();

  useEffect(() => {
    if (!state) {
      const savedKeypair = getWalletFromLocalStorage();
      const savedAuthType = getAuthTypeFromLocalStorage();

      if (savedKeypair) {
        setState(generateWalletState(savedKeypair.publicKey, savedKeypair));
        setAuthType(savedAuthType);

        return;
      }
      if (walletPublicKey) {
        setState(generateWalletState(walletPublicKey));
      }
    }
  }, [state, walletPublicKey]);

  const fetchBalance = useCallback(
    async (publicKeyOverride?: PublicKey): Promise<Balance> => {
      try {
        const pubKey = publicKeyOverride || state?.publicKey;

        if (!pubKey) {
          return initialBalance;
        }

        const fetchedBalance = await getSolanaNativeBalance({
          publicKey: pubKey,
          rpcConnection: config.rpcConnection,
        });

        if (!fetchedBalance) throw new Error("Balance is null");

        const balanceObj = {
          readable: Number(fetchedBalance) / LAMPORTS_PER_SOL,
          big: fetchedBalance,
        };

        setBalance(balanceObj);

        return balanceObj;
      } catch (error) {
        console.error("Error fetching balance:", error);

        return initialBalance;
      }
    },
    [state?.publicKey, config.rpcConnection],
  );

  const createNewWallet = useCallback(() => {
    const newPayer = Keypair.generate();

    setState(generateWalletState(newPayer.publicKey, newPayer));
    setAuthType("create");
    setBalance(initialBalance);
    fetchBalance(newPayer.publicKey);

    // Save to localStorage
    saveWalletToLocalStorage(newPayer);
    saveAuthTypeToLocalStorage("create");
  }, [fetchBalance]);

  const importWalletFromPrivateKey = useCallback(
    (privateKeyString: string) => {
      try {
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

        const importedKeypair = Keypair.fromSecretKey(secretKey);

        setState(
          generateWalletState(importedKeypair.publicKey, importedKeypair),
        );
        setAuthType("import");

        fetchBalance(importedKeypair.publicKey);

        // Save to localStorage
        saveWalletToLocalStorage(importedKeypair);
        saveAuthTypeToLocalStorage("import");

        return importedKeypair;
      } catch (error) {
        console.error("Error importing private key:", error);

        return null;
      }
    },
    [fetchBalance],
  );

  const openModalAdapter = useCallback(async () => {
    setIsConnecting(true);
    try {
      await signIn();
      setAuthType("connect");
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [signIn]);

  const disconnectWallet = useCallback(async () => {
    try {
      await signOut();
      setAuthType(null);
      setState(null);
      setBalance(null);

      // Clear localStorage
      clearWalletFromLocalStorage();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  }, [signOut]);

  const requestAirdrop = useCallback(async () => {
    try {
      const publicKey = state?.publicKey;

      if (!publicKey) {
        throw new Error("No wallet connected");
      }

      const signature = await getAirdropSol(publicKey, config.rpcConnection);

      if (signature) {
        await fetchBalance(publicKey);
      }

      return signature;
    } catch (error) {
      console.error("Error during airdrop:", error);

      return null;
    }
  }, [fetchBalance, state?.publicKey, config.rpcConnection]);

  useEffect(() => {
    if (state?.publicKey) {
      fetchBalance();
    }
  }, [fetchBalance, state?.publicKey]);

  const value = useMemo(
    () => ({
      authType,
      state,
      balance,
      isConnecting,
      openModalAdapter,
      disconnectWallet,
      createNewWallet,
      importWalletFromPrivateKey,
      fetchBalance,
      requestAirdrop,
    }),
    [
      authType,
      state,
      balance,
      isConnecting,
      openModalAdapter,
      disconnectWallet,
      createNewWallet,
      importWalletFromPrivateKey,
      fetchBalance,
      requestAirdrop,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
