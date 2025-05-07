"use client";

import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Account } from "@solana/spl-token";
import { Select, SelectItem } from "@heroui/react";

import { useWalletContext } from "@/contexts/wallet-context";

interface MintData {
  mint: PublicKey;
  mintTxId: string;
  decimals: number;
  ata: Account;
  compressedTokenTxId?: string;
}

export default function AirdropForm() {
  const { balance, userTokens } = useWalletContext();
  const [isMinting, setIsMinting] = useState(false);
  const [mintData, setMintData] = useState<MintData | null>(null);
  const [additionalMetadataPairs, setAdditionalMetadataPairs] = useState<
    [string, string][]
  >([["", ""]]);
  const [uriInput, setUriInput] = useState<string>("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<{
    name: string;
    symbol: string;
  }>({ name: "", symbol: "" });

  const handleMint = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {},
    [],
  );

  console.log("userTokens", userTokens);
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
            <Select className="max-w-xs" label="Select a token">
              {userTokens.map((token) => (
                <SelectItem key={token.mint}>{token.name}</SelectItem>
              ))}
            </Select>
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
    </div>
  );
}
