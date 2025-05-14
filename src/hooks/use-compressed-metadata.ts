import { useQuery } from "@tanstack/react-query";
import { ParsedAccountData } from "@solana/web3.js";
import BN from "bn.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ParsedTokenAccount } from "@lightprotocol/stateless.js";

import { TokenType, WalletToken } from "./use-spl-metadata";

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

export const useCompressedMetadata = (
  compressedBalances?: ParsedTokenAccount[],
) => {
  const {
    config: { rpcConnection },
  } = useNetwork();

  return useQuery<WalletToken[]>({
    enabled: !!compressedBalances && compressedBalances.length > 0,
    queryKey: ["compressed-metadata"],
    queryFn: async () => {
      if (!compressedBalances)
        throw new Error("No public key or compressed balances found");

      try {
        const compressedTokens = await Promise.all(
          compressedBalances.map(async (el) => {
            const accountInfo = await rpcConnection.getParsedAccountInfo(
              el.parsed.mint,
            );

            let decimals = 0;
            let name = "Unknown";
            let symbol = "UNK";
            let url = "";
            let programId = TOKEN_PROGRAM_ID.toBase58();
            let customProgramId = "";

            if (accountInfo.value && "parsed" in accountInfo.value.data) {
              const parsedData = accountInfo.value.data as ParsedAccountData;

              decimals = parsedData.parsed?.info?.decimals || 0;
              programId = TOKEN_PROGRAM_ID.toBase58();
              customProgramId = parsedData.program || "";

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

            let type = TokenType.STANDARD_COMPRESSED;

            if (customProgramId === "spl-token-2022") {
              type = TokenType.TOKEN_2022_COMPRESSED;
              programId = TOKEN_2022_PROGRAM_ID.toBase58();
            }

            return {
              mint: el.parsed.mint.toBase58(),
              accountAddress: el.parsed.mint.toBase58(),
              amount: el.parsed.amount
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
