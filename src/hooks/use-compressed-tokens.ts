import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { ParsedAccountData, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

import { TokenType, WalletToken } from "./use-spl-tokens";

import { useNetwork } from "@/contexts/network-context";

interface TokenMetadataState {
  name?: string;
  symbol?: string;
  uri?: string;
}

interface TokenExtension {
  extension: string;
  state?: TokenMetadataState;
}

export const useCompressedTokens = (
  compressedBalances?: {
    mint: PublicKey;
    balance: BN;
  }[],
) => {
  const {
    config: { rpcConnection },
  } = useNetwork();
  const { publicKey } = useWallet();

  return useQuery<WalletToken[]>({
    enabled: !!publicKey && compressedBalances && compressedBalances.length > 0,
    queryKey: ["compressed-tokens"],
    queryFn: async () => {
      if (!publicKey || !compressedBalances)
        throw new Error("No public key or compressed balances found");

      try {
        const compressedTokens = await Promise.all(
          compressedBalances.map(async (el) => {
            const accountInfo = await rpcConnection.getParsedAccountInfo(
              el.mint,
            );

            let decimals = 0;
            let name = "Unknown";
            let symbol = "UNK";
            let url = "";
            let programId = "";

            if (accountInfo.value && "parsed" in accountInfo.value.data) {
              const parsedData = accountInfo.value.data as ParsedAccountData;

              decimals = parsedData.parsed?.info?.decimals || 0;
              programId = parsedData.program || "";

              const extensions =
                (parsedData.parsed?.info?.extensions as TokenExtension[]) || [];
              const tokenMetadata = extensions.find(
                (ext: TokenExtension) => ext.extension === "tokenMetadata",
              );

              if (tokenMetadata?.state) {
                name = tokenMetadata.state.name || "";
                symbol = tokenMetadata.state.symbol || "";
                url = tokenMetadata.state.uri || "";
              }
            }

            let type = TokenType.COMPRESSED;

            if (programId === "spl-token-2022") {
              type = TokenType.TOKEN_2022_COMPRESSED;
            } else if (programId === "spl-token") {
              type = TokenType.STANDARD_COMPRESSED;
            }

            return {
              mint: el.mint.toBase58(),
              accountAddress: el.mint.toBase58(),
              amount: el.balance
                .div(new BN(10).pow(new BN(decimals)))
                .toString(),
              decimals,
              name,
              symbol,
              url,
              programId,
              type,
            };
          }),
        );

        return compressedTokens;
      } catch (e) {
        console.error("Error fetching compressed tokens:", e);

        return [];
      }
    },
  });
};
