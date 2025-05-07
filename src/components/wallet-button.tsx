"use client";

import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/react";

import { WalletModal } from "./wallet-modal";

import { useWalletContext } from "@/contexts/wallet-context";

export function WalletButton() {
  const { state } = useWalletContext();
  const { isOpen, onOpen, onClose } = useDisclosure();

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

      <WalletModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
