"use client";

import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useCallback, useState } from "react";
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <Input
                isRequired
                classNames={{
                  base: "mb-2",
                  label: "text-default-700 font-semibold",
                  inputWrapper:
                    "shadow-sm bg-white border-2 border-indigo-100 hover:border-indigo-200 focus-within:!border-indigo-400",
                }}
                description="The name of your token"
                label="Token Name"
                labelPlacement="outside"
                name="name"
                placeholder="My Token"
                startContent={
                  <div className="text-indigo-500 pointer-events-none flex items-center">
                    <span className="text-sm">✏️</span>
                  </div>
                }
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
                classNames={{
                  base: "mb-2",
                  label: "text-default-700 font-semibold",
                  inputWrapper:
                    "shadow-sm bg-white border-2 border-indigo-100 hover:border-indigo-200 focus-within:!border-indigo-400",
                }}
                description="Number of tokens to mint"
                label="Amount to Mint"
                labelPlacement="outside"
                min="1"
                name="mintAmount"
                placeholder="100"
                startContent={
                  <div className="text-indigo-500 pointer-events-none flex items-center">
                    <span className="text-sm">🪙</span>
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
            <div className="flex flex-col gap-4">
              <Input
                isRequired
                classNames={{
                  base: "mb-2",
                  label: "text-default-700 font-semibold",
                  inputWrapper:
                    "shadow-sm bg-white border-2 border-indigo-100 hover:border-indigo-200 focus-within:!border-indigo-400",
                }}
                description="Short symbol for your token (e.g. BTC, ETH)"
                label="Token Symbol"
                labelPlacement="outside"
                name="symbol"
                placeholder="TKN"
                startContent={
                  <div className="text-indigo-500 pointer-events-none flex items-center">
                    <span className="text-sm">🔤</span>
                  </div>
                }
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
                classNames={{
                  base: "mb-2",
                  label: "text-default-700 font-semibold",
                  inputWrapper:
                    "shadow-sm bg-white border-2 border-indigo-100 hover:border-indigo-200 focus-within:!border-indigo-400",
                }}
                description="Decimal precision"
                label="Decimals"
                labelPlacement="outside"
                min="0"
                name="decimals"
                placeholder="9"
                startContent={
                  <div className="text-indigo-500 pointer-events-none flex items-center">
                    <span className="text-sm">🔢</span>
                  </div>
                }
                step="1"
                type="number"
                validate={(value) => {
                  const amount = parseInt(value);

                  if (isNaN(amount) || amount < 0) {
                    return "Please enter a valid number";
                  }

                  return null;
                }}
                onWheel={(event) => event.currentTarget.blur()}
              />
            </div>
            <Input
              isRequired
              classNames={{
                base: "mb-2",
                label: "text-default-700 font-semibold",
                inputWrapper:
                  "shadow-sm bg-white border-2 border-indigo-100 hover:border-indigo-200 focus-within:!border-indigo-400",
              }}
              description="URL to token image or metadata"
              endContent={
                uriInput &&
                !imageError && (
                  <div className="bg-indigo-100 rounded-full p-1 size-8 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Token Preview"
                      className="size-6 object-contain rounded-full"
                      src={uriInput}
                      onError={handleImageError}
                    />
                  </div>
                )
              }
              label="Token URI"
              labelPlacement="outside"
              name="uri"
              placeholder="https://example.com/image.png"
              startContent={
                <div className="text-indigo-500 pointer-events-none flex items-center">
                  <span className="text-sm">🖼️</span>
                </div>
              }
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
          </div>

          <div className="bg-indigo-50 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
                <span className="text-sm bg-indigo-100 p-1 rounded-full">
                  📋
                </span>
                Additional Metadata
              </h3>
              <Button
                className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold"
                size="sm"
                startContent="+"
                variant="flat"
                onPress={addMetadataPair}
              >
                Add Field
              </Button>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {additionalMetadataPairs.map((pair, index) => (
                <div key={index} className="flex gap-3 items-center group">
                  <Input
                    aria-label={`Metadata key ${index + 1}`}
                    className="flex-1"
                    classNames={{
                      inputWrapper:
                        "bg-white border border-indigo-100 shadow-sm group-hover:border-indigo-200",
                    }}
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
                    classNames={{
                      inputWrapper:
                        "bg-white border border-indigo-100 shadow-sm group-hover:border-indigo-200",
                    }}
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-red-500 border border-red-200"
                    disabled={additionalMetadataPairs.length <= 1}
                    radius="full"
                    size="sm"
                    variant="bordered"
                    onPress={() => removeMetadataPair(index)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-indigo-500 mt-3">
              Add key-value pairs for additional token metadata (optional)
            </p>
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
              className="font-semibold transition-transform active:scale-95 bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
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
        <div className="mt-8 space-y-6 animate-fadeIn">
          <div className="p-0.5 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-xl">
            <div className="bg-white p-5 rounded-lg">
              <MintViewComponent
                compressionEnabled={compressionEnabled}
                mintData={mintData}
              />
            </div>
          </div>

          <div className="p-0.5 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-xl">
            <div className="bg-white p-5 rounded-lg space-y-4">
              <h3 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
                <span className="text-sm bg-indigo-100 p-1 rounded-full">
                  📄
                </span>
                Token Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-indigo-600 mb-1">
                    Name
                  </p>
                  <p className="text-sm truncate font-medium">
                    {formValues.name}
                  </p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-indigo-600 mb-1">
                    Symbol
                  </p>
                  <p className="text-sm font-medium">{formValues.symbol}</p>
                </div>
              </div>

              {uriInput && (
                <div>
                  <p className="text-xs font-semibold text-indigo-600 mb-2">
                    Token URI
                  </p>
                  <div className="flex items-start gap-3 bg-indigo-50 p-3 rounded-lg">
                    {!imageError && (
                      <div className="flex-shrink-0 bg-white p-1 rounded-lg border border-indigo-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt="Token Preview"
                          className="size-12 object-contain rounded"
                          src={uriInput}
                          onError={handleImageError}
                        />
                      </div>
                    )}
                    <div className="flex-1 break-all text-sm font-mono text-indigo-700 overflow-x-auto">
                      {uriInput}
                    </div>
                  </div>
                </div>
              )}

              {additionalMetadataPairs.length > 0 &&
                additionalMetadataPairs[0][0] !== "" && (
                  <div>
                    <p className="text-xs font-semibold text-indigo-600 mb-2">
                      Additional Metadata
                    </p>
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <div className="space-y-2">
                        {additionalMetadataPairs
                          .filter(
                            ([key, value]) =>
                              key.trim() !== "" && value.trim() !== "",
                          )
                          .map(([key, value], index) => (
                            <div
                              key={index}
                              className="grid grid-cols-2 gap-3 text-sm border-b border-indigo-100 pb-2 last:border-0 last:pb-0"
                            >
                              <div className="font-medium text-indigo-700">
                                {key}
                              </div>
                              <div className="text-gray-700">{value}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
