"use client";

import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useCallback, useState } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { addToast } from "@heroui/toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { Accordion, AccordionItem } from "@heroui/accordion";

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
import { normalizeKey } from "@/utils/string";
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
              payer: state.publicKey,
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
              payer: state.publicKey,
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

              <Accordion>
                <AccordionItem
                  key="transactions"
                  aria-label="transactions"
                  title="Transactions"
                >
                  {Object.entries(mintData.transactions).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-500 font-medium">
                        {normalizeKey(key)}
                      </p>
                      <div className="font-mono text-sm flex items-center gap-2">
                        {value}
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => {
                            navigator.clipboard.writeText(value);
                          }}
                        >
                          <CopyIcon size={16} />
                        </Button>
                        <Button
                          as="a"
                          href={`https://explorer.solana.com/tx/${value}?cluster=devnet`}
                          rel="noopener noreferrer"
                          size="sm"
                          target="_blank"
                          variant="light"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </AccordionItem>
              </Accordion>
              <div>
                <p className="text-sm text-gray-500 font-medium">Decimals</p>
                <p className="font-mono">{mintData.decimals}</p>
              </div>
              {mintData.ata && (
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Associated Token Address (ATA)
                  </p>
                  <div className="font-mono text-sm flex items-center gap-2">
                    {mintData.ata.toBase58()}
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => {
                        if (mintData.ata) {
                          navigator.clipboard.writeText(
                            mintData.ata.toBase58(),
                          );
                        }
                      }}
                    >
                      <CopyIcon size={16} />
                    </Button>
                    <Button
                      as="a"
                      href={`https://explorer.solana.com/address/${mintData.ata.toBase58()}?cluster=devnet`}
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
