"use client";

import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { createRpc } from "@lightprotocol/stateless.js";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { createMint, transfer } from "@lightprotocol/compressed-token";
import { addToast } from "@heroui/toast";
import {
  mintTo as mintToSpl,
  getOrCreateAssociatedTokenAccount,
  Account,
  createMint as createMintRegular,
} from "@solana/spl-token";

import { CopyIcon, CircleCheckIcon, ForbiddenCircleIcon } from "../icons";

import { useWallet } from "@/contexts/wallet-context";
import { DEVNET_RPC_URL } from "@/config";

interface MintSplProps {
  compressionEnabled?: boolean;
}

export default function MintSpl({ compressionEnabled = false }: MintSplProps) {
  const { state, fetchBalance, balance } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [mintData, setMintData] = useState<{
    mint: PublicKey;
    ata?: Account;
    transactionSignature: string;
    decimals: number;
  } | null>(null);

  //TODO: add metadata
  const handleMint = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      //TODO: now app not working, because need fix compressedMintSplToken regularMintSplToken
      if (!state?.keypair) return;
      const formData = new FormData(e.currentTarget);
      const compressAmount = formData.get("compressAmount") as string;
      const decimals = formData.get("decimals") as string;

      setIsMinting(true);

      try {
        const connection = createRpc(
          DEVNET_RPC_URL,
          DEVNET_RPC_URL,
          DEVNET_RPC_URL,
        );
        const compressAmountNumber = parseInt(compressAmount);
        const decimalsNumber = parseInt(decimals);

        let mint: PublicKey;
        let transactionSignature: string;
        let ata: Account | undefined;

        if (compressionEnabled) {
          // Create a compressed token mint
          const result = await createMint(
            connection,
            state.keypair,
            state.publicKey,
            decimalsNumber, // Number of decimals
          );

          mint = result.mint;
          transactionSignature = result.transactionSignature;

          console.log(
            `Create compressed mint success! txId: ${transactionSignature}`,
          );

          // Mint compressed tokens to the payer's account
          const mintToTxId = await transfer(
            connection,
            state.keypair,
            mint,
            compressAmountNumber * 10 ** decimalsNumber,
            state.keypair,
            state.publicKey,
          );

          transactionSignature = mintToTxId;
        } else {
          // Create a regular token mint
          mint = await createMintRegular(
            connection,
            state.keypair,
            state.publicKey,
            state.publicKey,
            decimalsNumber,
          );

          console.log(`Create regular mint success! mint: ${mint.toBase58()}`);

          // Create Associated Token Account
          ata = await getOrCreateAssociatedTokenAccount(
            connection,
            state.keypair,
            mint,
            state.publicKey,
          );

          console.log(`ATA: ${ata.address}`);

          // Mint tokens to the payer's account
          transactionSignature = await mintToSpl(
            connection,
            state.keypair,
            mint,
            ata.address,
            state.keypair,
            compressAmountNumber * 10 ** decimalsNumber,
          );
        }

        await fetchBalance(state.publicKey);

        setMintData({
          mint,
          ata,
          transactionSignature,
          decimals: decimalsNumber,
        });

        console.log(
          `Minted ${compressAmountNumber} tokens using ${compressionEnabled ? "compressed" : "regular"} approach`,
        );

        addToast({
          title: "Mint Successful",
          description: `Successfully minted ${compressAmountNumber} tokens ${compressionEnabled ? "with" : "without"} compression`,
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
    [compressionEnabled, fetchBalance, state?.keypair, state?.publicKey],
  );

  return (
    <div className="w-full">
      <Form onSubmit={handleMint}>
        <Card className="w-full">
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
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-medium">Mint Data</h3>
          <Card>
            <CardBody className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Mint Address
                </p>
                <div className="font-mono text-sm flex items-center gap-2">
                  {mintData.mint.toBase58()}
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                      navigator.clipboard.writeText(mintData.mint.toBase58());
                    }}
                  >
                    <CopyIcon size={16} />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Transaction Signature
                </p>
                <div className="font-mono text-sm flex items-center gap-2">
                  {mintData.transactionSignature}
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                      navigator.clipboard.writeText(
                        mintData.transactionSignature,
                      );
                    }}
                  >
                    <CopyIcon size={16} />
                  </Button>
                </div>
              </div>
              {mintData.ata && (
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Associated Token Address(ATA)
                  </p>
                  <div className="font-mono text-sm flex items-center gap-2">
                    {mintData.ata?.address.toBase58()}
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => {
                        if (mintData.ata?.address) {
                          navigator.clipboard.writeText(
                            mintData.ata.address.toBase58(),
                          );
                        }
                      }}
                    >
                      <CopyIcon size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
