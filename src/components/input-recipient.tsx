"use client";
import { Button, Divider, Input, Tooltip } from "@heroui/react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useCallback, useState } from "react";

import { DoubleCheckIcon, RefreshIcon } from "./icons";
import { HandMoneyIcon } from "./icons";

import { getSolanaNativeBalance } from "@/services/balance-service";
import { trimNumber } from "@/utils/numbers";
import { getAirdropSol } from "@/services/airdrop-sol";

export const InputRecipient = () => {
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [airdropSuccess, setAirdropSuccess] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      const recipientPublicKey = new PublicKey(recipientAddress);

      const balance = await getSolanaNativeBalance({
        publicKey: recipientPublicKey,
      });

      if (!balance) throw new Error("Balance is null");

      setBalance(Number(balance) / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance", { cause: error });
    }
  }, [recipientAddress]);

  const handleAirdrop = useCallback(async () => {
    setIsAirdropping(true);
    setAirdropSuccess(false);

    try {
      const recipientPublicKey = new PublicKey(recipientAddress);
      const signature = await getAirdropSol(recipientPublicKey);

      if (signature) {
        setAirdropSuccess(true);
        await fetchBalance();
      }
    } finally {
      setIsAirdropping(false);

      setTimeout(() => {
        setAirdropSuccess(false);
      }, 3000);
    }
  }, [fetchBalance, recipientAddress]);

  return (
    <div className="flex flex-col gap-2">
      <Input
        isRequired
        endContent={
          <div className="flex items-center gap-2 font-medium shrink-0 h-full">
            <Divider orientation="vertical" />
            <span className="text-xs text-purple-500">{`${trimNumber(balance)} SOL`}</span>
            <Tooltip content="Get or refresh balance">
              <Button
                isIconOnly
                color="default"
                size="sm"
                variant="flat"
                onPress={fetchBalance}
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
        }
        label="Recipient Address"
        labelPlacement="outside"
        name="recipientAddress"
        placeholder="Enter Solana address"
        validate={(value) => {
          try {
            new PublicKey(value);

            return null;
          } catch (error) {
            return "Please enter a valid Solana address";
          }
        }}
        value={recipientAddress}
        onValueChange={setRecipientAddress}
      />
    </div>
  );
};
