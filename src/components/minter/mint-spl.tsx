"use client";

import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useCallback, useState } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
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

        const mintAmountNumber = parseInt(mintAmount);
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

  return (
    <div className="w-full">
      <Form onSubmit={handleMint}>
        <Card className="border-none shadow-none w-full">
          <CardBody className="flex flex-col gap-4">
            <Input
              isRequired
              label="Amount to Mint (SOL)"
              labelPlacement="outside"
              min="0.001"
              name="mintAmount"
              placeholder="0.001"
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
              label="Decimals"
              labelPlacement="outside"
              min="0"
              name="decimals"
              placeholder="9"
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
          </CardBody>
          <CardFooter className="flex gap-4 justify-end">
            <Button
              color="default"
              isDisabled={isMinting}
              type="reset"
              variant="flat"
            >
              Reset
            </Button>
            <Button
              color="secondary"
              isDisabled={
                isMinting || !!mintData || (balance?.readable ?? 0) < 0.001
              }
              isLoading={isMinting}
              type="submit"
              variant="flat"
            >
              {isMinting ? "Processing..." : "Mint"}
            </Button>
          </CardFooter>
        </Card>
      </Form>

      {mintData && (
        <MintViewComponent
          compressionEnabled={compressionEnabled}
          mintData={mintData}
        />
      )}
    </div>
  );
}
