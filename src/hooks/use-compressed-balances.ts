import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

import { useNetwork } from "@/contexts/network-context";

export const useCompressedBalances = () => {
  const {
    config: { rpcConnection },
  } = useNetwork();
  const { publicKey } = useWallet();

  return useQuery({
    enabled: !!publicKey,
    queryKey: ["compressed-balances"],
    queryFn: async () => {
      if (!publicKey) throw new Error("No public key found");

      try {
        const compressedTokensResponse =
          await rpcConnection.getCompressedTokenBalancesByOwnerV2(publicKey);

        return compressedTokensResponse.value.items;
      } catch (e) {
        console.error("Error fetching compressed balances:", e);

        return [];
      }
    },
  });
};
