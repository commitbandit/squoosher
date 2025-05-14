import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { QueryClient } from "@tanstack/react-query";

import { TokenType, WalletToken } from "@/hooks/use-spl-metadata";
import { useWalletContext } from "@/contexts/wallet-context";
import {
  regularTransferSplToken,
  compressedTransferSplToken,
} from "@/services/transfer-token";
import { useNetwork } from "@/contexts/network-context";
import {
  webCompressedTransferSplToken,
  webRegularTransferSplToken,
} from "@/services/transfer-token/web-confirm";
import { useCompressedTokens } from "@/hooks/use-compressed-tokens";

export const useTransferForm = (queryClient: QueryClient) => {
  const { data: compressedBalances } = useCompressedTokens();
  const { state } = useWalletContext();
  const {
    config: { rpcConnection },
  } = useNetwork();

  const { sendTransaction } = useWallet();

  const [selectedToken, setSelectedToken] = useState<WalletToken | undefined>(
    undefined,
  );
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const setMaxAmount = () => {
    if (selectedToken) {
      setAmount(selectedToken.amount);
    }
  };

  const clearForm = () => {
    setSelectedToken(undefined);
    setAmount("");
    setRecipient("");
    setTransactionHash(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!state) throw new Error("Wallet not connected");
      if (!selectedToken || !amount || !recipient) {
        throw new Error("Please fill all fields");
      }

      setIsLoading(true);
      const { publicKey, keypair } = state;
      let hash: string = "";

      switch (selectedToken.type) {
        case TokenType.STANDARD:
        case TokenType.TOKEN_2022:
          // for wallet with private key
          if (keypair) {
            hash = await regularTransferSplToken({
              payer: keypair,
              recipient: new PublicKey(recipient),
              transferAmount: parseFloat(amount),
              decimals: selectedToken.decimals,
              rpcConnection,
              mint: new PublicKey(selectedToken.mint),
              tokenProgramId: new PublicKey(selectedToken.programId),
            });
          } else {
            // for wallet with public key
            hash = await webRegularTransferSplToken({
              payer: publicKey,
              recipient: new PublicKey(recipient),
              transferAmount: parseFloat(amount),
              decimals: selectedToken.decimals,
              rpcConnection,
              mint: new PublicKey(selectedToken.mint),
              sendTransaction,
              tokenProgramId: new PublicKey(selectedToken.programId),
            });
          }
          queryClient.invalidateQueries({
            queryKey: ["spl-balances"],
          });
          break;
        case TokenType.STANDARD_COMPRESSED:
        case TokenType.TOKEN_2022_COMPRESSED:
          const isMaintenance = true;

          if (isMaintenance) {
            throw new Error("Maintenance mode is enabled");
          }
          // for wallet with private key
          if (keypair) {
            hash = await compressedTransferSplToken({
              payer: keypair,
              recipient: new PublicKey(recipient),
              transferAmount: parseFloat(amount),
              decimals: selectedToken.decimals,
              rpcConnection,
              mint: new PublicKey(selectedToken.mint),
              tokenProgramId: new PublicKey(selectedToken.programId),
            });
          } else {
            // for wallet with public key
            const compressedToken = compressedBalances?.find(
              (token) => token.parsed.mint.toBase58() === selectedToken.mint,
            );

            if (!compressedToken) throw new Error("Compressed token not found");
            hash = await webCompressedTransferSplToken({
              payer: publicKey,
              recipient: new PublicKey(recipient),
              transferAmount: parseFloat(amount),
              decimals: selectedToken.decimals,
              rpcConnection,
              mint: new PublicKey(selectedToken.mint),
              sendTransaction,
              tokenProgramId: new PublicKey(selectedToken.programId),
              parsedAccount: compressedToken,
            });
          }
          queryClient.invalidateQueries({
            queryKey: ["compressed-metadata"],
          });
          break;
        default:
          break;
      }

      setTransactionHash(hash);
      console.log("Transaction hash:", hash);
    } catch (error) {
      console.error("Error sending token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !!selectedToken && !!amount && !!recipient;

  return {
    selectedToken,
    amount,
    recipient,
    isLoading,
    transactionHash,
    setSelectedToken,
    setAmount,
    setRecipient,
    setMaxAmount,
    clearForm,
    handleSubmit,
    isFormValid,
  };
};
