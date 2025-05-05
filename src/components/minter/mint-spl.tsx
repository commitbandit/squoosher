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
import { InputRecipient } from "../input-recipient";

import { usePayerContext } from "@/contexts/payer-context";
import { DEVNET_RPC_URL } from "@/config";

interface MintSplProps {
  compressionEnabled?: boolean;
}

export default function MintSpl({ compressionEnabled = false }: MintSplProps) {
  const { payer, fetchSolBalance, balance } = usePayerContext();
  const [isMinting, setIsMinting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [mintData, setMintData] = useState<{
    mint: PublicKey;
    ata?: Account;
    transactionSignature: string;
    decimals: number;
  } | null>(null);

  const [transferTxId, setTransferTxId] = useState<string | null>(null);

  //TODO: add metadata
  const handleMint = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
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
            payer,
            payer.publicKey,
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
            payer,
            mint,
            compressAmountNumber * 10 ** decimalsNumber,
            payer,
            payer.publicKey,
          );

          transactionSignature = mintToTxId;
        } else {
          // Create a regular token mint
          mint = await createMintRegular(
            connection,
            payer,
            payer.publicKey,
            payer.publicKey,
            decimalsNumber,
          );

          console.log(`Create regular mint success! mint: ${mint.toBase58()}`);

          // Create Associated Token Account
          ata = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mint,
            payer.publicKey,
          );

          console.log(`ATA: ${ata.address}`);

          // Mint tokens to the payer's account
          transactionSignature = await mintToSpl(
            connection,
            payer,
            mint,
            ata.address,
            payer,
            compressAmountNumber * 10 ** decimalsNumber,
          );
        }

        await fetchSolBalance(payer.publicKey);

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
    [compressionEnabled, fetchSolBalance, payer],
  );

  const handleTransfer = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!mintData) {
        console.error("Mint data is not available");
        addToast({
          title: "Transfer Failed",
          description: "Mint data is not available",
          color: "danger",
          icon: <ForbiddenCircleIcon />,
        });

        return;
      }

      const { mint, decimals } = mintData;

      const connection = createRpc(
        DEVNET_RPC_URL,
        DEVNET_RPC_URL,
        DEVNET_RPC_URL,
      );

      const formData = new FormData(e.currentTarget);
      const transferAmount = formData.get("transferAmount") as string;
      const recipientAddress = formData.get("recipientAddress") as string;
      const tokenRecipient = new PublicKey(recipientAddress);

      setIsTransferring(true);
      try {
        let transferTxId: string;

        if (compressionEnabled) {
          // Use compressed token transfer
          transferTxId = await transfer(
            connection,
            payer,
            mint,
            parseInt(transferAmount) * 10 ** decimals, // Amount
            payer,
            tokenRecipient,
          );
        } else {
          // For regular tokens, need to create or get recipient's ATA
          const recipientAta = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mint,
            tokenRecipient,
          );

          // Regular token transfer
          transferTxId = await transfer(
            connection,
            payer,
            mint,
            parseInt(transferAmount) * 10 ** decimals,
            payer,
            tokenRecipient,
          );
        }

        await fetchSolBalance(payer.publicKey);

        setTransferTxId(transferTxId);

        addToast({
          title: "Transfer Successful",
          description: `Successfully transferred ${transferAmount} tokens`,
          color: "success",
          icon: <CircleCheckIcon />,
        });
      } catch (error) {
        console.error("Transaction error:", error);
        addToast({
          title: "Transfer Failed",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          color: "danger",
          icon: <ForbiddenCircleIcon />,
        });
      } finally {
        setIsTransferring(false);
      }
    },
    [compressionEnabled, fetchSolBalance, mintData, payer],
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
              isDisabled={isMinting || isTransferring}
              type="reset"
              variant="flat"
            >
              Reset
            </Button>
            <Button
              color="secondary"
              isDisabled={isMinting || !!mintData || balance.readable < 0.001}
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
          <Form onSubmit={handleTransfer}>
            <Card className="w-full">
              <CardBody className="flex flex-col gap-4">
                <InputRecipient />

                <Input
                  isRequired
                  label="Amount to Transfer (SOL)"
                  labelPlacement="outside"
                  min="0.001"
                  name="transferAmount"
                  placeholder="0.01"
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
              </CardBody>
              <CardFooter className="flex gap-4 justify-end">
                <Button
                  color="default"
                  isDisabled={isTransferring}
                  type="reset"
                  variant="flat"
                >
                  Reset
                </Button>
                <Button
                  color="secondary"
                  isDisabled={isTransferring || !!transferTxId}
                  isLoading={isTransferring}
                  type="submit"
                  variant="flat"
                >
                  {isTransferring ? "Processing..." : "Transfer"}
                </Button>
              </CardFooter>
            </Card>
          </Form>

          {transferTxId && (
            <Card>
              <CardBody>
                <p className="text-sm text-gray-500 font-medium">
                  Transfer Transaction
                </p>
                <div className="font-mono text-sm flex items-center gap-2">
                  {transferTxId}
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                      navigator.clipboard.writeText(transferTxId);
                    }}
                  >
                    <CopyIcon size={16} />
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
