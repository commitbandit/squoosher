"use client";

import { useCallback, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/react";
import bs58 from "bs58";

import {
  CopyIcon,
  DoubleCheckIcon,
  HandMoneyIcon,
  KeyIcon,
  RefreshIcon,
} from "./icons";

import { useWallet } from "@/contexts/wallet-context";
import { trimNumber } from "@/utils/numbers";

export function WalletModal() {
  const {
    authType,
    state,
    balance,
    isConnecting,
    createNewWallet,
    importWalletFromPrivateKey,
    openModalAdapter,
    disconnectWallet,
    fetchBalance,
    requestAirdrop,
  } = useWallet();

  const { isOpen, onOpen, onClose } = useDisclosure();
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
      const signature = await requestAirdrop();

      if (signature) {
        setAirdropSuccess(true);
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

    const importedKeypair = importWalletFromPrivateKey(privateKeyInput.trim());

    if (!importedKeypair) {
      setImportError("Invalid private key format");

      return;
    }

    setPrivateKeyInput("");
  };

  const handleConnect = async () => {
    await openModalAdapter();
  };

  const handleCreateWallet = () => {
    createNewWallet();
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    onClose();
  };

  const getPrivateKeyString = useCallback(() => {
    if (!state?.keypair?.secretKey) return null;

    return bs58.encode(state.keypair.secretKey);
  }, [state]);

  return (
    <>
      <Button
        color="secondary"
        size="sm"
        variant={state ? "bordered" : "solid"}
        onPress={onOpen}
      >
        {state ? state.shortAddress : "Connect Wallet"}
      </Button>

      <Modal isOpen={isOpen} size="lg" onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <span>Wallet</span>
              <Chip color="warning" size="sm" variant="flat">
                Devnet
              </Chip>
            </div>
          </ModalHeader>

          <ModalBody className="py-6">
            {state ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">
                    {authType === "connect"
                      ? "Connected Wallet"
                      : "Keypair Wallet"}
                  </h3>
                  {authType === "create" && (
                    <Button size="sm" variant="flat" onPress={createNewWallet}>
                      Generate New Keypair
                    </Button>
                  )}
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
                        onPress={() => state && fetchBalance(state.publicKey)}
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
                        {airdropSuccess ? (
                          <DoubleCheckIcon />
                        ) : (
                          <HandMoneyIcon />
                        )}
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
                          onPress={() => handleCopy(state.address, "publicKey")}
                        >
                          {isCopied.publicKey ? (
                            <DoubleCheckIcon />
                          ) : (
                            <CopyIcon />
                          )}
                        </Button>
                      }
                      label="Public Key"
                      labelPlacement="outside"
                      name="publicKey"
                      value={state.address}
                    />
                  </div>

                  {authType === "create" && state && (
                    <div className="relative">
                      <Textarea
                        readOnly
                        endContent={
                          <Button
                            isIconOnly
                            color="default"
                            size="sm"
                            variant="light"
                            onPress={() => {
                              const privateKey = getPrivateKeyString();

                              if (privateKey) {
                                handleCopy(privateKey, "secretKey");
                              }
                            }}
                          >
                            {isCopied.secretKey ? (
                              <DoubleCheckIcon />
                            ) : (
                              <CopyIcon />
                            )}
                          </Button>
                        }
                        label="Private Key"
                        labelPlacement="outside"
                        name="secretKey"
                        value={getPrivateKeyString() || ""}
                        variant="flat"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-600 mb-1">
                    Connect your existing wallet or create a new one to
                    continue.
                  </p>
                  <Button
                    className="w-full"
                    color="secondary"
                    isDisabled={isConnecting}
                    isLoading={isConnecting}
                    variant="flat"
                    onPress={handleConnect}
                  >
                    Connect with Solana Wallet
                  </Button>
                  <Button
                    className="w-full"
                    color="primary"
                    variant="flat"
                    onPress={handleCreateWallet}
                  >
                    Generate New Wallet
                  </Button>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    Note: Generated wallets persist only for this session.
                    Export and save the private key for future use.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    Import an existing keypair using a private key.
                  </p>
                  <div className="space-y-2">
                    <Input
                      errorMessage={importError}
                      isInvalid={!!importError}
                      label={
                        <span className="flex items-center gap-2">
                          <KeyIcon className="inline-block" size={16} />
                          Private Key
                        </span>
                      }
                      labelPlacement="outside"
                      placeholder="Enter base58 encoded private key"
                      value={privateKeyInput}
                      onChange={(e) => setPrivateKeyInput(e.target.value)}
                    />

                    <Button
                      className="w-full"
                      color="success"
                      variant="flat"
                      onPress={handleImportPrivateKey}
                    >
                      Import Key
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>

          {state && (
            <ModalFooter>
              <Button color="default" variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button color="danger" onPress={handleDisconnect}>
                Disconnect
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
