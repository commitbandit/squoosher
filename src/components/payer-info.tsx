"use client";

import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { useDisclosure } from "@heroui/modal";
import { Tooltip } from "@heroui/tooltip";
import { useState } from "react";

import { PayerModal } from "./payer-modal";
import { CopyIcon, SettingsIcon, DoubleCheckIcon } from "./icons";

import { usePayerContext } from "@/contexts/payer-context";
import { trimNumber } from "@/utils/numbers";

export function PayerInfo() {
  const { payer, balance } = usePayerContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCopied, setIsCopied] = useState(false);

  const shortAddress = `${payer.publicKey.toBase58().slice(0, 4)}...${payer.publicKey.toBase58().slice(-4)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(payer.publicKey.toBase58());
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const isLowBalance = balance.readable < 0.05;

  return (
    <>
      <Card className="p-3 mb-4 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Payer:</span>
            <span className="font-mono text-sm">{shortAddress}</span>
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
                className={`font-mono text-sm ${isLowBalance ? "text-red-500" : "text-green-600"}`}
              >
                {trimNumber(balance.readable)} SOL
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

      <PayerModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
