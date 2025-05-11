"use client";

import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { useDisclosure } from "@heroui/modal";
import { Tooltip } from "@heroui/tooltip";
import { useState } from "react";

import { CopyIcon, SettingsIcon, DoubleCheckIcon } from "./icons";
import { WalletModal } from "./wallet-modal";

import { trimNumber } from "@/utils/numbers";
import { useWalletContext } from "@/contexts/wallet-context";

type PayerInfoProps = {
  className?: string;
};

export function PayerInfo({ className }: PayerInfoProps) {
  const { state, balance } = useWalletContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!state) return;
    await navigator.clipboard.writeText(state.publicKey.toBase58());
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const isLowBalance = balance?.readable && balance.readable < 0.05;

  if (!state) return null;

  return (
    <>
      <Card className={`p-3 mb-4 shadow-inner ${className}`}>
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Payer:</span>
            <span className="font-mono text-sm">{state?.shortAddress}</span>
            <Button isIconOnly size="sm" variant="light" onPress={handleCopy}>
              {isCopied ? (
                <DoubleCheckIcon size={16} />
              ) : (
                <CopyIcon size={16} />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <span className="font-medium text-sm">Balance:</span>
              <span
                className={`font-mono text-sm ${isLowBalance ? "text-red-500" : ""}`}
              >
                {trimNumber(balance?.readable || 0)} SOL
              </span>

              <Tooltip content="Payer settings">
                <Button
                  isIconOnly
                  color="warning"
                  size="sm"
                  variant="flat"
                  onPress={onOpen}
                >
                  <SettingsIcon size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </Card>

      <WalletModal isOpen={isOpen} onClose={onClose} />
      {/* <PayerModal isOpen={isOpen} onClose={onClose} /> */}
    </>
  );
}
