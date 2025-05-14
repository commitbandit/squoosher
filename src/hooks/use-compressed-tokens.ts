import { useQuery } from "@tanstack/react-query";

import { useNetwork } from "@/contexts/network-context";
import { useWalletContext } from "@/contexts/wallet-context";
import { QUERY_KEYS } from "@/constants/query-keys";

export const useCompressedTokens = () => {
  const {
    config: { rpcConnection },
  } = useNetwork();
  const { state } = useWalletContext();

  return useQuery({
    enabled: !!state?.publicKey,
    queryKey: [QUERY_KEYS.COMPRESSED_TOKENS],
    queryFn: async () => {
      if (!state?.publicKey) throw new Error("No public key found");

      try {
        const compressedTokensResponse =
          await rpcConnection.getCompressedTokenAccountsByOwner(
            state.publicKey,
          );

        return compressedTokensResponse.items;
      } catch (e) {
        console.error("Error fetching compressed tokens:", e);

        return [];
      }
    },
  });
};
