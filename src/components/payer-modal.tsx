"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import bs58 from "bs58";
import { Tooltip } from "@heroui/react";

import {
  CopyIcon,
  DoubleCheckIcon,
  HandMoneyIcon,
  KeyIcon,
  RefreshIcon,
} from "./icons";

import { usePayerContext } from "@/contexts/payer-context";
import { trimNumber } from "@/utils/numbers";

interface PayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PayerModal({ isOpen, onClose }: PayerModalProps) {
  const {
    payer,
    generateNewPayer,
    importPrivateKey,
    airdropSol,
    balance,
    fetchSolBalance,
  } = usePayerContext();
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [importError, setImportError] = useState("");
  const [isCopied, setIsCopied] = useState<{
    publicKey: boolean;
    secretKey: boolean;
  }>({
    publicKey: false,
    secretKey: false,
  });
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [airdropSuccess, setAirdropSuccess] = useState(false);

  const handleCopy = async (text: string, type: "publicKey" | "secretKey") => {
    await navigator.clipboard.writeText(text);
    setIsCopied((prev) => ({ ...prev, [type]: true }));

    setTimeout(() => {
      setIsCopied((prev) => ({ ...prev, [type]: false }));
    }, 2000);
  };

  const handleAirdrop = async () => {
    setIsAirdropping(true);
    setAirdropSuccess(false);

    try {
      const signature = await airdropSol();

      if (signature) {
        setAirdropSuccess(true);
        await fetchSolBalance(payer.publicKey);
      }
    } finally {
      setIsAirdropping(false);

      setTimeout(() => {
        setAirdropSuccess(false);
      }, 3000);
    }
  };

  const handleImportPrivateKey = () => {
    setImportError("");

    if (!privateKeyInput.trim()) {
      setImportError("Please enter a private key");

      return;
    }

    const importedKeypair = importPrivateKey(privateKeyInput.trim());

    if (!importedKeypair) {
      setImportError("Invalid private key format");

      return;
    }
    setPrivateKeyInput("");
    fetchSolBalance(importedKeypair.publicKey);
  };

  const handleGenerateNew = () => {
    generateNewPayer();
    fetchSolBalance(payer.publicKey);
  };

  return (
    <Modal isOpen={isOpen} size="lg" onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <span>Payer Settings</span>
            <Chip color="warning" size="sm" variant="flat">
              Devnet
            </Chip>
          </div>
        </ModalHeader>

        <ModalBody className="py-6 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Current Payer</h3>
              <Button size="sm" variant="flat" onPress={handleGenerateNew}>
                Generate New Payer
              </Button>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">SOL Balance:</span>
              <div className="flex items-center gap-2 font-medium">
                {balance !== null
                  ? `${trimNumber(balance.readable)} SOL`
                  : "Loading..."}
                <Tooltip content="Refresh Balance">
                  <Button
                    isIconOnly
                    color="default"
                    size="sm"
                    variant="flat"
                    onPress={() => fetchSolBalance(payer.publicKey)}
                  >
                    <RefreshIcon size={20} />
                  </Button>
                </Tooltip>
                <Tooltip content="Airdrop SOL">
                  <Button
                    isIconOnly
                    color="default"
                    isDisabled={isAirdropping}
                    isLoading={isAirdropping}
                    size="sm"
                    variant="flat"
                    onPress={handleAirdrop}
                  >
                    {airdropSuccess ? <DoubleCheckIcon /> : <HandMoneyIcon />}
                  </Button>
                </Tooltip>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  readOnly
                  endContent={
                    <Button
                      isIconOnly
                      color="default"
                      size="sm"
                      variant="light"
                      onPress={() =>
                        handleCopy(payer.publicKey.toBase58(), "publicKey")
                      }
                    >
                      {isCopied.publicKey ? <DoubleCheckIcon /> : <CopyIcon />}
                    </Button>
                  }
                  label="Public Key"
                  labelPlacement="outside"
                  name="publicKey"
                  value={payer.publicKey.toBase58()}
                />
              </div>

              <div className="relative">
                <Textarea
                  readOnly
                  endContent={
                    <Button
                      isIconOnly
                      color="default"
                      size="sm"
                      variant="light"
                      onPress={() =>
                        handleCopy(bs58.encode(payer.secretKey), "secretKey")
                      }
                    >
                      {isCopied.secretKey ? <DoubleCheckIcon /> : <CopyIcon />}
                    </Button>
                  }
                  label="Private Key"
                  labelPlacement="outside"
                  name="secretKey"
                  value={bs58.encode(payer.secretKey)}
                  variant="flat"
                />
              </div>
            </div>
          </div>

          <Divider />

          <div className="space-y-2">
            <Input
              errorMessage={importError}
              isInvalid={!!importError}
              label={
                <span className="flex items-center gap-2">
                  <KeyIcon className="inline-block" size={16} />
                  Import Private Key
                </span>
              }
              labelPlacement="outside"
              placeholder="Enter base58 encoded private key"
              value={privateKeyInput}
              onChange={(e) => setPrivateKeyInput(e.target.value)}
            />

            <Button color="secondary" onPress={handleImportPrivateKey}>
              Import Key
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
