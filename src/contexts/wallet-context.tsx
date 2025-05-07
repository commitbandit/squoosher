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
import {
  AccountInfo,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
} from "@solana/web3.js";
import bs58 from "bs58";
import { Metaplex } from "@metaplex-foundation/js";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { getSolanaNativeBalance } from "@/services/balance-service";
import { getAirdropSol } from "@/services/airdrop-sol";
import { generateWalletState } from "@/utils/wallet";

import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getTokenMetadata,
} from "@solana/spl-token";

import { useConnection } from "@solana/wallet-adapter-react";

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
  userTokens: WalletToken[];

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

interface WalletToken {
  mint: string;
  amount: string;
  decimals: number;
  programId: string;
  accountAddress: string;
  name?: string;
  symbol?: string;
}

const parseWalletTokens = (
  accounts: {
    pubkey: PublicKey;
    account: AccountInfo<ParsedAccountData>;
    programId: PublicKey;
  }[]
): WalletToken[] => {
  return accounts
    .map(({ pubkey, account, programId }) => {
      const info = account.data.parsed?.info;
      if (!info || info.tokenAmount.uiAmount === 0) return null;

      return {
        mint: info.mint,
        amount: info.tokenAmount.uiAmountString,
        decimals: info.tokenAmount.decimals,
        programId: programId.toBase58(),
        accountAddress: pubkey.toBase58(),
      };
    })
    .filter((token): token is WalletToken => token !== null);
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [authType, setAuthType] = useState<AuthType>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [state, setState] = useState<ConnectedWallet | null>(null);
  const [userTokens, setUserTokens] = useState<WalletToken[]>([]);
  const { publicKey: walletPublicKey, signIn, signOut } = useSolanaWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (walletPublicKey && !state) {
      setState(generateWalletState(walletPublicKey));
    }
  }, [walletPublicKey, state]);

  const fetchTokens = useCallback(async () => {
    if (!walletPublicKey) return;

    try {
      const [standardTokens, token2022Tokens] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(walletPublicKey, {
          programId: TOKEN_PROGRAM_ID,
        }),
        connection.getParsedTokenAccountsByOwner(walletPublicKey, {
          programId: TOKEN_2022_PROGRAM_ID,
        }),
      ]);
      const metaplex = new Metaplex(connection, { cluster: "devnet" });
      const allAccounts = [
        ...standardTokens.value.map((acc) => ({
          ...acc,
          programId: TOKEN_PROGRAM_ID,
        })),
        ...token2022Tokens.value.map((acc) => ({
          ...acc,
          programId: TOKEN_2022_PROGRAM_ID,
        })),
      ];

      const parsedTokens = parseWalletTokens(allAccounts);
      if (!parsedTokens.length) {
        setUserTokens([]);
        return;
      }

      if (metaplex) {
        const metadataList = await Promise.all(
          parsedTokens.map(async (token) => {
            try {
              if (token.programId === TOKEN_PROGRAM_ID.toBase58()) {
                const metadata = await metaplex.nfts().findByMint({
                  mintAddress: new PublicKey(token.mint),
                });
                return {
                  ...token,
                  symbol: metadata.symbol,
                  name: metadata.name,
                };
              } else {
                const metadata = await getTokenMetadata(
                  connection,
                  new PublicKey(token.mint)
                );
                return {
                  ...token,
                  symbol: metadata?.symbol,
                  name: metadata?.name,
                };
              }
            } catch (e) {
              return { ...token, symbol: "UNKNOWN", name: "UNKNOWN" };
            }
          })
        );

        setUserTokens(metadataList);
      } else {
        setUserTokens(parsedTokens);
      }
    } catch (e) {
      console.error("Error fetching tokens:", e);
    }
  }, [walletPublicKey]);

  const fetchBalance = useCallback(
    async (publicKeyOverride?: PublicKey): Promise<Balance> => {
      try {
        const pubKey = publicKeyOverride || state?.publicKey;

        if (!pubKey) {
          return initialBalance;
        }

        const fetchedBalance = await getSolanaNativeBalance({
          publicKey: pubKey,
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
    [state?.publicKey]
  );

  const createNewWallet = useCallback(() => {
    const newPayer = Keypair.generate();

    setState(generateWalletState(newPayer.publicKey, newPayer));
    setAuthType("create");
    setBalance(initialBalance);
    fetchBalance(newPayer.publicKey);
  }, [fetchBalance]);

  const importWalletFromPrivateKey = useCallback(
    (privateKeyString: string) => {
      try {
        let secretKey: Uint8Array;

        try {
          // Attempt to decode the key as base58
          secretKey = bs58.decode(privateKeyString);
        } catch (error) {
          // If it fails, check if it's a raw array representation
          try {
            const parsedArray = JSON.parse(privateKeyString);

            if (Array.isArray(parsedArray) && parsedArray.length === 64) {
              secretKey = Uint8Array.from(parsedArray);
            } else {
              throw new Error("Invalid key format");
            }
          } catch (parseError) {
            throw new Error("Invalid private key format");
          }
        }

        const importedKeypair = Keypair.fromSecretKey(secretKey);

        setState(
          generateWalletState(importedKeypair.publicKey, importedKeypair)
        );
        setAuthType("import");

        fetchBalance(importedKeypair.publicKey);

        return importedKeypair;
      } catch (error) {
        console.error("Error importing private key:", error);

        return null;
      }
    },
    [fetchBalance]
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
      if (authType === "connect") {
        await signOut();
      }
      setAuthType(null);
      setState(null);
      setBalance(null);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  }, [signOut, authType]);

  const requestAirdrop = useCallback(async () => {
    try {
      const publicKey = state?.publicKey;

      if (!publicKey) {
        throw new Error("No wallet connected");
      }

      const signature = await getAirdropSol(publicKey);

      if (signature) {
        await fetchBalance(publicKey);
      }

      return signature;
    } catch (error) {
      console.error("Error during airdrop:", error);

      return null;
    }
  }, [fetchBalance, state?.publicKey]);

  useEffect(() => {
    if (state?.publicKey) {
      fetchBalance();
      fetchTokens();
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
      userTokens,
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
      userTokens,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
