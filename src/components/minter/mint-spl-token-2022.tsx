"use client";

import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Keypair,
  PublicKey,
  VersionedTransaction,
  TransactionMessage,
} from "@solana/web3.js";
import { useCallback, useState } from "react";
import {
  createRpc,
  pickRandomTreeAndQueue,
  sendAndConfirmTx,
} from "@lightprotocol/stateless.js";
import { Card, CardBody, CardFooter } from "@heroui/card";
import {
  CompressedTokenProgram,
  transfer,
  compress,
} from "@lightprotocol/compressed-token";
import { addToast } from "@heroui/toast";
import {
  mintTo as mintToSpl,
  getOrCreateAssociatedTokenAccount,
  ExtensionType,
  TYPE_SIZE,
  LENGTH_SIZE,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  TOKEN_2022_PROGRAM_ID,
  Account,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";

import { CopyIcon, CircleCheckIcon, ForbiddenCircleIcon } from "../icons";

import { usePayerContext } from "@/contexts/payer-context";
import { DEVNET_RPC_URL } from "@/config";

interface MintData {
  mint: PublicKey;
  mintTxId: string;
  compressedTokenTxId: string;
  decimals: number;
  ata: Account;
}
interface MintSpl2022Props {
  compressionEnabled?: boolean;
}

export default function MintSplToken2022({
  compressionEnabled = false,
}: MintSpl2022Props) {
  const { payer, fetchSolBalance, balance } = usePayerContext();
  const [isMinting, setIsMinting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [mintData, setMintData] = useState<MintData | null>(null);
  const [transferTxId, setTransferTxId] = useState<string | null>(null);
  const [additionalMetadataPairs, setAdditionalMetadataPairs] = useState<
    [string, string][]
  >([["", ""]]);

  const handleMint = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      try {
        e.preventDefault();
        setIsMinting(true);
        const formData = new FormData(e.currentTarget);
        const mintAmount = formData.get("mintAmount") as string;
        const decimals = formData.get("decimals") as string;
        const name = formData.get("name") as string;
        const symbol = formData.get("symbol") as string;
        const uri = formData.get("uri") as string;

        // Filter out empty pairs and convert to the required format
        const filteredMetadata = additionalMetadataPairs
          .filter(([key, value]) => key.trim() !== "" && value.trim() !== "")
          .map(([key, value]) => [key, value] as [string, string]);

        const mintAmountNumber = parseInt(mintAmount);
        const decimalsNumber = parseInt(decimals);

        const mint = Keypair.generate();

        const metadata: TokenMetadata = {
          mint: mint.publicKey,
          name,
          symbol,
          uri,
          additionalMetadata: filteredMetadata,
        };

        const connection = createRpc(
          DEVNET_RPC_URL,
          DEVNET_RPC_URL,
          DEVNET_RPC_URL,
        );

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);

        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
        const activeStateTrees =
          await connection.getCachedActiveStateTreeInfo();
        const { tree } = pickRandomTreeAndQueue(activeStateTrees);

        const mintLamports = await connection.getMinimumBalanceForRentExemption(
          mintLen + metadataLen,
        );

        const [createMintAccountIx, initializeMintIx, createTokenPoolIx] =
          await CompressedTokenProgram.createMint({
            feePayer: payer.publicKey,
            authority: payer.publicKey,
            mint: mint.publicKey,
            decimals: decimalsNumber,
            freezeAuthority: null,
            rentExemptBalance: mintLamports,
            tokenProgramId: TOKEN_2022_PROGRAM_ID,
            mintSize: mintLen,
          });

        const instructions = [
          createMintAccountIx,
          createInitializeMetadataPointerInstruction(
            mint.publicKey,
            payer.publicKey,
            mint.publicKey,
            TOKEN_2022_PROGRAM_ID,
          ),
          initializeMintIx,
          createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            mint: mint.publicKey,
            metadata: mint.publicKey,
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
            mintAuthority: payer.publicKey,
            updateAuthority: payer.publicKey,
          }),
          createTokenPoolIx,
        ];

        const messageV0 = new TransactionMessage({
          payerKey: payer.publicKey,
          recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
          instructions,
        }).compileToV0Message();

        const mintTransaction = new VersionedTransaction(messageV0);

        mintTransaction.sign([payer, mint]);

        const txId = await sendAndConfirmTx(connection, mintTransaction);

        console.log(`txId: ${txId}`);
        const ata = await getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          mint.publicKey,
          payer.publicKey,
          undefined,
          undefined,
          undefined,
          TOKEN_2022_PROGRAM_ID,
        );

        console.log(`ATA: ${ata.address}`);
        /// Mint SPL
        const mintTxId = await mintToSpl(
          connection,
          payer,
          mint.publicKey,
          ata.address,
          payer.publicKey,
          mintAmountNumber * 10 ** decimalsNumber, // Amount
          undefined,
          undefined,
          TOKEN_2022_PROGRAM_ID,
        );

        console.log(`mint-spl success! txId: ${mintTxId}`);

        const compressedTokenTxId = await compress(
          connection,
          payer,
          mint.publicKey,
          mintAmountNumber * 10 ** decimalsNumber, // Amount
          payer,
          ata.address,
          payer.publicKey,
          tree,
          undefined,
          TOKEN_2022_PROGRAM_ID,
        );

        console.log(`compressed-token success! txId: ${compressedTokenTxId}`);

        await fetchSolBalance(payer.publicKey);

        setMintData({
          ata,
          mint: mint.publicKey,
          mintTxId,
          compressedTokenTxId,
          decimals: decimalsNumber,
        });

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
    [compressionEnabled, fetchSolBalance, payer, additionalMetadataPairs],
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
        let txId: string;

        if (compressionEnabled) {
          // Use compressed token transfer
          txId = await transfer(
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
          txId = await transfer(
            connection,
            payer,
            mint,
            parseInt(transferAmount) * 10 ** decimals,
            payer,
            tokenRecipient,
          );
        }

        await fetchSolBalance(payer.publicKey);

        setTransferTxId(txId);

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

  return (
    <div className="w-full">
      <Form onSubmit={handleMint}>
        <Card className="w-full">
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
              label="Token URI (Metadata URL)"
              labelPlacement="outside"
              name="uri"
              placeholder="https://example.com/metadata.json"
              type="text"
              validate={(value) => {
                if (!value.trim()) {
                  return "Please enter a token URI";
                }

                return null;
              }}
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
                  Mint Transaction ID
                </p>
                <div className="font-mono text-sm flex items-center gap-2">
                  {mintData.mintTxId}
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                      navigator.clipboard.writeText(mintData.mintTxId);
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
                <Input
                  isRequired
                  label="Amount to Transfer"
                  labelPlacement="outside"
                  min="1"
                  name="transferAmount"
                  placeholder="10"
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
                <Input
                  isRequired
                  label="Recipient Address"
                  labelPlacement="outside"
                  name="recipientAddress"
                  placeholder="Public key of the recipient"
                  type="text"
                  validate={(value) => {
                    if (!value.trim()) {
                      return "Please enter a recipient address";
                    }

                    return null;
                  }}
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
                  isDisabled={isTransferring}
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
