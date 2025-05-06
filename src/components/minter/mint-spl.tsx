"use client";

import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { addToast } from "@heroui/toast";
import { Account } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";

import { CopyIcon, CircleCheckIcon, ForbiddenCircleIcon } from "../icons";

import { useWalletContext } from "@/contexts/wallet-context";
import {
  compressedMintSplToken,
  regularMintSplToken,
} from "@/services/spl-token";
import {
  webCompressedMintSplToken,
  webRegularMintSplToken,
} from "@/services/spl-token/web-confirm";

interface MintSplProps {
  compressionEnabled?: boolean;
}

interface MintData {
  mint: PublicKey;
  transactionSignature: string;
  decimals: number;
  ata?: Account;
  mintToTxId?: string;
  transferTxId?: string;
}

export default function MintSpl({ compressionEnabled = false }: MintSplProps) {
  const { state, fetchBalance, balance } = useWalletContext();

  const { sendTransaction, signTransaction } = useWallet();

  const [isMinting, setIsMinting] = useState(false);
  const [mintData, setMintData] = useState<MintData | null>(null);

  const handleMint = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        if (!state) throw new Error("Wallet not connected");
        const formData = new FormData(e.currentTarget);
        const compressAmount = formData.get("compressAmount") as string;
        const decimals = formData.get("decimals") as string;

        setIsMinting(true);

        const compressAmountNumber = parseInt(compressAmount);
        const decimalsNumber = parseInt(decimals);

        let result;

        if (compressionEnabled) {
          if (!state.keypair) {
            if (!signTransaction) {
              throw new Error("Sign transaction not supported");
            }

            result = await webCompressedMintSplToken({
              publicKey: state.publicKey,
              compressAmount: compressAmountNumber,
              decimals: decimalsNumber,
              signTransaction,
              sendTransaction,
            });
          } else {
            result = await compressedMintSplToken({
              payer: state.keypair,
              compressAmount: compressAmountNumber,
              decimals: decimalsNumber,
            });
          }
        } else {
          if (!state.keypair) {
            if (!signTransaction) {
              throw new Error("Sign transaction not supported");
            }
            result = await webRegularMintSplToken({
              publicKey: state.publicKey,
              compressAmount: compressAmountNumber,
              decimals: decimalsNumber,
              signTransaction,
              sendTransaction,
            });
          } else {
            result = await regularMintSplToken({
              payer: state.keypair,
              compressAmount: compressAmountNumber,
              decimals: decimalsNumber,
            });
          }
        }

        await fetchBalance(state.publicKey);

        setMintData(result);

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
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-medium">Mint Data</h3>
          <Card className="border-none shadow-none w-full">
            <CardBody className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-sm text-gray-500 font-medium">Token Type</p>
                <p className="font-medium">
                  {compressionEnabled
                    ? "Compressed SPL Token"
                    : "Regular SPL Token"}
                </p>
              </div>
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
                  <Button
                    as="a"
                    href={`https://explorer.solana.com/tx/${mintData.transactionSignature}?cluster=devnet`}
                    rel="noopener noreferrer"
                    size="sm"
                    target="_blank"
                    variant="light"
                  >
                    View
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Decimals</p>
                <p className="font-mono">{mintData.decimals}</p>
              </div>
              {mintData.mintToTxId && (
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Mint-To Transaction ID
                  </p>
                  <div className="font-mono text-sm flex items-center gap-2">
                    {mintData.mintToTxId}
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => {
                        navigator.clipboard.writeText(mintData.mintToTxId!);
                      }}
                    >
                      <CopyIcon size={16} />
                    </Button>
                    <Button
                      as="a"
                      href={`https://explorer.solana.com/tx/${mintData.mintToTxId}?cluster=devnet`}
                      rel="noopener noreferrer"
                      size="sm"
                      target="_blank"
                      variant="light"
                    >
                      View
                    </Button>
                  </div>
                </div>
              )}
              {mintData.transferTxId && (
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Transfer Transaction ID
                  </p>
                  <div className="font-mono text-sm flex items-center gap-2">
                    {mintData.transferTxId}
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => {
                        navigator.clipboard.writeText(mintData.transferTxId!);
                      }}
                    >
                      <CopyIcon size={16} />
                    </Button>
                    <Button
                      as="a"
                      href={`https://explorer.solana.com/tx/${mintData.transferTxId}?cluster=devnet`}
                      rel="noopener noreferrer"
                      size="sm"
                      target="_blank"
                      variant="light"
                    >
                      View
                    </Button>
                  </div>
                </div>
              )}
              {mintData.ata && (
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Associated Token Address (ATA)
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
                    <Button
                      as="a"
                      href={`https://explorer.solana.com/address/${mintData.ata?.address.toBase58()}?cluster=devnet`}
                      rel="noopener noreferrer"
                      size="sm"
                      target="_blank"
                      variant="light"
                    >
                      View
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
