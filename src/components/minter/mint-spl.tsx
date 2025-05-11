"use client";

import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useCallback, useState } from "react";
import { addToast } from "@heroui/toast";
import { useWallet } from "@solana/wallet-adapter-react";

import { CircleCheckIcon, ForbiddenCircleIcon } from "../icons";

import { MintViewComponent } from "./mint-view-component";

import { useWalletContext } from "@/contexts/wallet-context";
import {
  compressedMintSplToken,
  regularMintSplToken,
} from "@/services/spl-token";
import {
  webCompressedMintSplToken,
  webRegularMintSplToken,
} from "@/services/spl-token/web-confirm";
import { MintViewData } from "@/types";

interface MintSplProps {
  compressionEnabled?: boolean;
}

export default function MintSpl({ compressionEnabled = false }: MintSplProps) {
  const { state, fetchBalance, balance } = useWalletContext();

  const { sendTransaction, signTransaction } = useWallet();

  const [isMinting, setIsMinting] = useState(false);
  const [mintData, setMintData] = useState<MintViewData | null>(null);

  const handleMint = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        if (!state) throw new Error("Wallet not connected");
        const formData = new FormData(e.currentTarget);
        const mintAmount = formData.get("mintAmount") as string;
        const decimals = formData.get("decimals") as string;

        setIsMinting(true);

        const mintAmountNumber = parseFloat(mintAmount);
        const decimalsNumber = parseInt(decimals);

        let result;

        if (compressionEnabled) {
          if (!state.keypair) {
            if (!signTransaction) {
              throw new Error("Sign transaction not supported");
            }

            result = await webCompressedMintSplToken({
              payer: state.publicKey,
              mintAmount: mintAmountNumber,
              decimals: decimalsNumber,
              signTransaction,
              sendTransaction,
            });
          } else {
            result = await compressedMintSplToken({
              payer: state.keypair,
              mintAmount: mintAmountNumber,
              decimals: decimalsNumber,
            });
          }
        } else {
          if (!state.keypair) {
            if (!signTransaction) {
              throw new Error("Sign transaction not supported");
            }
            result = await webRegularMintSplToken({
              payer: state.publicKey,
              mintAmount: mintAmountNumber,
              decimals: decimalsNumber,
              signTransaction,
              sendTransaction,
            });
          } else {
            result = await regularMintSplToken({
              payer: state.keypair,
              mintAmount: mintAmountNumber,
              decimals: decimalsNumber,
            });
          }
        }

        await fetchBalance(state.publicKey);

        setMintData(result);

        console.log(
          `Minted ${mintAmountNumber} tokens using ${compressionEnabled ? "compressed" : "regular"} approach`,
        );

        addToast({
          title: "Mint Successful",
          description: `Successfully minted ${mintAmountNumber} tokens ${compressionEnabled ? "with" : "without"} compression`,
          color: "success",
          icon: <CircleCheckIcon />,
        });
      } catch (error) {
        console.error("Transaction error:", error);
        addToast({
          title: "Mint Failed",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          color: "danger",
          icon: <ForbiddenCircleIcon />,
        });
      } finally {
        setIsMinting(false);
      }
    },
    [compressionEnabled, fetchBalance, sendTransaction, signTransaction, state],
  );

  const clearForm = () => {
    setMintData(null);
  };

  return (
    <div className="w-full">
      <Form onSubmit={handleMint}>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                isRequired
                classNames={{
                  base: "mb-6",
                  label: "text-default-700 font-semibold",
                  inputWrapper:
                    "shadow-sm bg-white border-2 border-blue-100 hover:border-blue-200 focus-within:!border-blue-400",
                }}
                description="Enter the amount of tokens you want to mint"
                label="Amount to Mint"
                labelPlacement="outside"
                min="0.001"
                name="mintAmount"
                placeholder="0.001"
                startContent={
                  <div className="text-blue-500 pointer-events-none flex items-center">
                    <span className="text-sm">🪙</span>
                  </div>
                }
                step="0.000000001"
                type="number"
                validate={(value) => {
                  const amount = parseFloat(value);

                  if (isNaN(amount) || amount <= 0) {
                    return "Please enter a valid positive amount";
                  }

                  return null;
                }}
                onWheel={(event) => event.currentTarget.blur()}
              />

              <Input
                isRequired
                classNames={{
                  base: "mb-2",
                  label: "text-default-700 font-semibold",
                  inputWrapper:
                    "shadow-sm bg-white border-2 border-blue-100 hover:border-blue-200 focus-within:!border-blue-400",
                }}
                description="Number of decimal places for token precision"
                label="Decimals"
                labelPlacement="outside"
                min="0"
                name="decimals"
                placeholder="9"
                startContent={
                  <div className="text-blue-500 pointer-events-none flex items-center">
                    <span className="text-sm">🔢</span>
                  </div>
                }
                step="1"
                type="number"
                validate={(value) => {
                  const amount = parseInt(value);

                  if (isNaN(amount) || amount <= 0) {
                    return "Please enter a valid positive amount";
                  }

                  return null;
                }}
                onWheel={(event) => event.currentTarget.blur()}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              className="font-semibold transition-transform active:scale-95"
              color="default"
              isDisabled={isMinting}
              radius="lg"
              startContent={<span>↩️</span>}
              type="reset"
              variant="flat"
              onPress={clearForm}
            >
              Reset
            </Button>
            <Button
              className="font-semibold transition-transform active:scale-95"
              color="primary"
              isDisabled={
                isMinting || !!mintData || (balance?.readable ?? 0) < 0.001
              }
              isLoading={isMinting}
              radius="lg"
              startContent={!isMinting && <span>✨</span>}
              type="submit"
              variant="shadow"
            >
              {isMinting ? "Processing..." : "Mint Tokens"}
            </Button>
          </div>
        </div>
      </Form>

      {mintData && (
        <div className="mt-8 animate-fadeIn">
          <div className="p-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl">
            <div className="bg-white p-5 rounded-lg">
              <MintViewComponent
                compressionEnabled={compressionEnabled}
                mintData={mintData}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
