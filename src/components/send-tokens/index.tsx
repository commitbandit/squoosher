"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Form } from "@heroui/form";
import { motion } from "framer-motion";
import { cn } from "@heroui/react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";

import { CopyIcon, LinkIcon } from "../icons";

import TokenSelector from "./TokenSelector";

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
import { truncateAddress } from "@/utils/string";

export default function TransferForm() {
  const { data: compressedBalances } = useCompressedTokens();
  const queryClient = useQueryClient();
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

  const isFormValid = selectedToken && amount && recipient;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95">
        <div className="h-3 bg-gradient-to-r from-secondary via-primary to-secondary animate-gradient-x" />
        <CardHeader className="flex gap-3 p-8 pb-4">
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
            initial={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
              Send Tokens
            </h3>
            <p className="text-gray-500">
              Transfer tokens to another wallet with style
            </p>
          </motion.div>
        </CardHeader>
        <Form onSubmit={handleSubmit}>
          <CardBody className="px-8 py-4 space-y-2 grid grid-cols-1">
            <TokenSelector
              selectedToken={selectedToken}
              onTokenSelect={setSelectedToken}
            />

            <div>
              <label
                className="block text-base font-semibold mb-3"
                htmlFor="amount-input"
              >
                Amount
              </label>
              <div className="relative">
                <Input
                  isRequired
                  classNames={{
                    base: "mb-2",
                    label: "text-default-700 font-semibold",
                  }}
                  description={
                    selectedToken
                      ? `Balance: ${Number(selectedToken.amount).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: selectedToken.decimals,
                          },
                        )}`
                      : "Select a token first"
                  }
                  endContent={
                    selectedToken && (
                      <Button
                        className="h-6 px-4 w-fit min-w-[auto]"
                        color="secondary"
                        variant="flat"
                        onPress={setMaxAmount}
                      >
                        MAX
                      </Button>
                    )
                  }
                  id="amount-input"
                  labelPlacement="outside"
                  placeholder="0.00"
                  startContent={
                    <div className="text-secondary pointer-events-none flex items-center">
                      <span className="text-base">💰</span>
                    </div>
                  }
                  type="number"
                  validate={(value) => {
                    if (!selectedToken) return "Select a token first";
                    if (!value) return "Amount is required";
                    if (parseFloat(value) <= 0)
                      return "Amount must be greater than 0";
                    if (parseFloat(value) > parseFloat(selectedToken.amount))
                      return "Amount must be less than or equal to the token balance";

                    return null;
                  }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-base font-semibold mb-3"
                htmlFor="recipient-input"
              >
                Recipient Address
              </label>
              <Input
                isRequired
                classNames={{
                  base: "mb-2",
                  label: "text-default-700 font-semibold",
                }}
                description="Enter the Solana wallet address of the recipient"
                id="recipient-input"
                labelPlacement="outside"
                placeholder="Solana wallet address"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-base">👤</span>
                  </div>
                }
                type="text"
                validate={(value) => {
                  if (!value) return "Recipient address is required";
                  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value))
                    return "Invalid Solana wallet address";

                  return null;
                }}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          </CardBody>
          <CardFooter className="px-8 py-6 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex justify-between items-center w-full gap-3">
              <Button
                className="font-semibold transition-transform active:scale-95"
                color="default"
                isDisabled={isLoading}
                radius="lg"
                startContent={<span>↩️</span>}
                type="reset"
                variant="flat"
                onPress={clearForm}
              >
                Reset
              </Button>
              <Button
                className={cn(
                  "w-full font-bold transition-all duration-300",
                  isFormValid
                    ? ""
                    : "bg-gray-200 text-gray-400 cursor-not-allowed",
                )}
                color={isFormValid ? "secondary" : "default"}
                isDisabled={!isFormValid || isLoading}
                isLoading={isLoading}
                radius="lg"
                startContent={
                  !isLoading &&
                  isFormValid && (
                    <span className="text-xl animate-pulse">✨</span>
                  )
                }
                type="submit"
                variant={isFormValid ? "flat" : "solid"}
              >
                {isLoading
                  ? "Processing..."
                  : isFormValid
                    ? "Send Tokens"
                    : "Complete All Fields"}
              </Button>
            </div>
          </CardFooter>
        </Form>
      </Card>

      {transactionHash && (
        <Card className="mt-8 p-4">
          <CardHeader>
            <h3 className="text-xl font-bold mb-3">Transaction Hash</h3>
          </CardHeader>
          <CardBody className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 p-2 rounded-lg">
            <p className="font-mono text-sm text-gray-600">
              {truncateAddress(transactionHash)}
            </p>
            <div className="flex gap-1">
              <Button
                isIconOnly
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border-none"
                radius="full"
                size="sm"
                variant="bordered"
                onPress={() => {
                  navigator.clipboard.writeText(transactionHash);
                }}
              >
                <CopyIcon size={16} />
              </Button>
              <Button
                isIconOnly
                as="a"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border-none"
                href={`https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`}
                radius="full"
                rel="noopener noreferrer"
                size="sm"
                target="_blank"
                variant="bordered"
              >
                <LinkIcon size={16} />
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </motion.div>
  );
}
