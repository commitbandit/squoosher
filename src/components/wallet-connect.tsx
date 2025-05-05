"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useSolanaWallet } from "@/hooks/use-solana-wallet";

export function WalletConnect() {
  const { state, signIn, signOut, getBalance } = useSolanaWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!state?.address) {
        return;
      }
      const balance = await getBalance({ userAddress: state.address });

      setBalance(Number(balance) / LAMPORTS_PER_SOL);
    };

    if (state?.address && isOpen) {
      fetchBalance();
    }
  }, [getBalance, state?.address, isOpen]);

  const handleSignOut = () => {
    onClose();
    signOut();
  };

  return (
    <div>
      {state ? (
        <>
          <Button
            color="secondary"
            size="sm"
            variant="bordered"
            onPress={onOpen}
          >
            {state.shortAddress}
          </Button>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
              <ModalHeader>Wallet Info</ModalHeader>
              <ModalBody className="py-4">
                <div className="space-y-3">
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                      Devnet
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-mono text-sm break-all">
                      {state.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">SOL Balance</p>
                    <p className="font-mono text-lg">
                      {balance !== null ? `${balance} SOL` : "Loading..."}
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleSignOut}>
                  Sign Out
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <Button color="secondary" size="sm" variant="solid" onPress={signIn}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
}
