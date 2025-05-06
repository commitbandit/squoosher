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

import {
  compressedMintSplToken2022,
  regularMintSplToken2022,
} from "@/services/spl-token-2022";
import { useWalletContext } from "@/contexts/wallet-context";
import { MintViewData } from "@/types";
import {
  webCompressedMintSplToken2022,
  webRegularMintSplToken2022,
} from "@/services/spl-token-2022/web.confirm";

interface MintSpl2022Props {
  compressionEnabled?: boolean;
}

export default function MintSplToken2022({
  compressionEnabled = false,
}: MintSpl2022Props) {
  const { state, fetchBalance, balance } = useWalletContext();
  const [isMinting, setIsMinting] = useState(false);
  const [mintData, setMintData] = useState<MintViewData | null>(null);
  const [additionalMetadataPairs, setAdditionalMetadataPairs] = useState<
    [string, string][]
  >([["", ""]]);
  const [uriInput, setUriInput] = useState<string>("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<{
    name: string;
    symbol: string;
  }>({ name: "", symbol: "" });

  const { sendTransaction, signTransaction } = useWallet();

  const handleMint = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        if (!state) throw new Error("Wallet not connected");
        setIsMinting(true);
        const formData = new FormData(e.currentTarget);
        const mintAmount = formData.get("mintAmount") as string;
        const decimals = formData.get("decimals") as string;
        const name = formData.get("name") as string;
        const symbol = formData.get("symbol") as string;
        const uri = formData.get("uri") as string;

        // Save form values for display
        setFormValues({ name, symbol });

        // Filter out empty pairs and convert to the required format
        const filteredMetadata = additionalMetadataPairs
          .filter(([key, value]) => key.trim() !== "" && value.trim() !== "")
          .map(([key, value]) => [key, value] as [string, string]);

        const mintAmountNumber = parseFloat(mintAmount);
        const decimalsNumber = parseInt(decimals);

        let result: MintViewData | null = null;

        console.log("state", state);

        if (compressionEnabled) {
          if (!state.keypair) {
            if (!signTransaction) {
              throw new Error("Sign transaction not supported");
            }

            result = await webCompressedMintSplToken2022({
              mintAmount: mintAmountNumber,
              decimals: decimalsNumber,
              name,
              symbol,
              uri,
              additionalMetadata: filteredMetadata,
              payer: state.publicKey,
              sendTransaction,
              signTransaction,
            });
          } else {
            result = await compressedMintSplToken2022({
              mintAmount: mintAmountNumber,
              decimals: decimalsNumber,
              name,
              symbol,
              uri,
              additionalMetadata: filteredMetadata,
              payer: state.keypair,
            });
          }
        } else {
          if (!state.keypair) {
            if (!signTransaction) {
              throw new Error("Sign transaction not supported");
            }
            result = await webRegularMintSplToken2022({
              mintAmount: mintAmountNumber,
              decimals: decimalsNumber,
              name,
              symbol,
              uri,
              additionalMetadata: filteredMetadata,
              payer: state.publicKey,
              sendTransaction,
              signTransaction,
            });
          } else {
            result = await regularMintSplToken2022({
              mintAmount: mintAmountNumber,
              decimals: decimalsNumber,
              name,
              symbol,
              uri,
              additionalMetadata: filteredMetadata,
              payer: state.keypair,
            });
          }
        }

        await fetchBalance(state?.publicKey);
        setMintData(result);

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
    [
      additionalMetadataPairs,
      compressionEnabled,
      fetchBalance,
      sendTransaction,
      signTransaction,
      state,
    ],
  );

  const addMetadataPair = () => {
    setAdditionalMetadataPairs([...additionalMetadataPairs, ["", ""]]);
  };

  const updateMetadataPair = (index: number, key: string, value: string) => {
    const newPairs = [...additionalMetadataPairs];

    newPairs[index] = [key, value];
    setAdditionalMetadataPairs(newPairs);
  };

  const removeMetadataPair = (index: number) => {
    if (additionalMetadataPairs.length > 1) {
      const newPairs = [...additionalMetadataPairs];

      newPairs.splice(index, 1);
      setAdditionalMetadataPairs(newPairs);
    }
  };

  const handleUriChange = (value: string) => {
    setUriInput(value);
    setImageError(null);
  };

  const handleImageError = () => {
    setImageError("Failed to load image. Please check the URL.");
  };

  const clearForm = () => {
    setMintData(null);
    setAdditionalMetadataPairs([["", ""]]);
    setUriInput("");
    setImageError(null);
  };

  return (
    <div className="w-full">
      <Form onSubmit={handleMint}>
        <Card className="border-none shadow-none w-full">
          <CardBody className="flex flex-col gap-4">
            <Input
              isRequired
              label="Token Name"
              labelPlacement="outside"
              name="name"
              placeholder="My Token"
              type="text"
              validate={(value) => {
                if (!value.trim()) {
                  return "Please enter a token name";
                }

                return null;
              }}
            />
            <Input
              isRequired
              label="Token Symbol"
              labelPlacement="outside"
              name="symbol"
              placeholder="TKN"
              type="text"
              validate={(value) => {
                if (!value.trim()) {
                  return "Please enter a token symbol";
                }

                return null;
              }}
            />
            <Input
              isRequired
              endContent={
                uriInput &&
                !imageError && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Token Preview"
                    className="size-6 object-contain"
                    src={uriInput}
                    onError={handleImageError}
                  />
                )
              }
              label="Token URI"
              labelPlacement="outside"
              name="uri"
              placeholder="https://example.com/image.png"
              type="text"
              validate={(value) => {
                if (!value.trim()) {
                  return "Please enter a token URI";
                }

                return null;
              }}
              value={uriInput}
              onValueChange={(value) => handleUriChange(value)}
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

                if (isNaN(amount) || amount < 0) {
                  return "Please enter a valid non-negative amount";
                }

                return null;
              }}
              onWheel={(event) => event.currentTarget.blur()}
            />
            <Input
              isRequired
              label="Amount to Mint"
              labelPlacement="outside"
              min="1"
              name="mintAmount"
              placeholder="100"
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

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="additionalMetadataLabel"
              >
                Additional Metadata (Key-Value pairs)
              </label>
              <div aria-labelledby="additionalMetadataLabel">
                {additionalMetadataPairs.map((pair, index) => (
                  <div key={index} className="flex gap-2 items-center mb-2">
                    <Input
                      aria-label={`Metadata key ${index + 1}`}
                      className="flex-1"
                      placeholder="Key"
                      size="sm"
                      value={pair[0]}
                      onChange={(e) =>
                        updateMetadataPair(index, e.target.value, pair[1])
                      }
                    />
                    <Input
                      aria-label={`Metadata value ${index + 1}`}
                      className="flex-1"
                      placeholder="Value"
                      size="sm"
                      value={pair[1]}
                      onChange={(e) =>
                        updateMetadataPair(index, pair[0], e.target.value)
                      }
                    />
                    <Button
                      isIconOnly
                      aria-label={`Remove metadata pair ${index + 1}`}
                      color="danger"
                      disabled={additionalMetadataPairs.length <= 1}
                      size="sm"
                      variant="light"
                      onPress={() => removeMetadataPair(index)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                aria-label="Add new metadata pair"
                size="sm"
                variant="flat"
                onPress={addMetadataPair}
              >
                + Add Metadata Pair
              </Button>
            </div>
          </CardBody>
          <CardFooter className="flex gap-4 justify-end">
            <Button
              color="default"
              isDisabled={isMinting}
              type="reset"
              variant="flat"
              onPress={clearForm}
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
          <MintViewComponent
            compressionEnabled={compressionEnabled}
            mintData={mintData}
          />

          <div>
            <p className="text-sm text-gray-500 font-medium">Token Details</p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs font-medium">Name</p>
                <p className="text-sm truncate">{formValues.name}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs font-medium">Symbol</p>
                <p className="text-sm">{formValues.symbol}</p>
              </div>
            </div>
          </div>
          {uriInput && (
            <div>
              <p className="text-sm text-gray-500 font-medium">Token URI</p>
              <div className="mt-1 flex items-start gap-2">
                <div className="flex-1 break-all text-sm font-mono">
                  {uriInput}
                </div>
                {!imageError && (
                  <div className="flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Token Preview"
                      className="size-12 object-contain rounded"
                      src={uriInput}
                      onError={handleImageError}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {additionalMetadataPairs.length > 0 &&
            additionalMetadataPairs[0][0] !== "" && (
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Additional Metadata
                </p>
                <div className="mt-1 space-y-1">
                  {additionalMetadataPairs
                    .filter(
                      ([key, value]) =>
                        key.trim() !== "" && value.trim() !== "",
                    )
                    .map(([key, value], index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 gap-2 text-sm"
                      >
                        <div className="font-medium">{key}</div>
                        <div>{value}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
