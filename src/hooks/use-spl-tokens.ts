import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import {
  getTokenMetadata,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { AccountInfo, ParsedAccountData } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export enum TokenType {
  STANDARD = "SPL",
  STANDARD_COMPRESSED = "SPL (Compressed)",
  TOKEN_2022 = "2022",
  TOKEN_2022_COMPRESSED = "2022 (Compressed)",
  COMPRESSED = "Compressed",
}
export interface WalletToken {
  mint: string;
  amount: string;
  decimals: number;
  programId: string;
  accountAddress: string;
  name?: string;
  symbol?: string;
  url?: string;
  type: TokenType;
}

const getTokenType = (programId: string): TokenType => {
  if (programId === TOKEN_PROGRAM_ID.toBase58()) {
    return TokenType.STANDARD;
  } else if (programId === TOKEN_2022_PROGRAM_ID.toBase58()) {
    return TokenType.TOKEN_2022;
  } else {
    return TokenType.STANDARD;
  }
};

const parseWalletTokens = (
  accounts: {
    pubkey: PublicKey;
    account: AccountInfo<ParsedAccountData>;
    programId: PublicKey;
  }[],
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
        type: getTokenType(programId.toBase58()),
      };
    })
    .filter((token): token is WalletToken => token !== null);
};

export const useSplTokens = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery({
    enabled: !!publicKey,
    queryKey: ["spl-tokens"],
    queryFn: async () => {
      if (!publicKey) throw new Error("No public key found");

      const [standardTokens, token2022Tokens] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        }),
        connection.getParsedTokenAccountsByOwner(publicKey, {
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
                  new PublicKey(token.mint),
                );

                return {
                  ...token,
                  symbol: metadata?.symbol,
                  name: metadata?.name,
                  url: metadata?.uri,
                };
              }
            } catch (e) {
              console.error("Error fetching token metadata:", e);

              return { ...token, symbol: "UNKNOWN", name: "UNKNOWN" };
            }
          }),
        );

        return metadataList;
      } else {
        return parsedTokens;
      }
    },
  });
};
