import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

import { useWalletContext } from "@/contexts/wallet-context";

export const useSplTokens = () => {
  const { connection } = useConnection();
  const { state } = useWalletContext();

  return useQuery({
    enabled: !!state?.publicKey,
    queryKey: ["spl-tokens"],
    queryFn: async () => {
      if (!state?.publicKey) throw new Error("No public key found");

      const [standardTokens, token2022Tokens] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(state.publicKey, {
          programId: TOKEN_PROGRAM_ID,
        }),
        connection.getParsedTokenAccountsByOwner(state.publicKey, {
          programId: TOKEN_2022_PROGRAM_ID,
        }),
      ]);

      return [
        ...standardTokens.value.map((acc) => ({
          ...acc,
          programId: TOKEN_PROGRAM_ID,
        })),
        ...token2022Tokens.value.map((acc) => ({
          ...acc,
          programId: TOKEN_2022_PROGRAM_ID,
        })),
      ];
    },
  });
};
