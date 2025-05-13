"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Form } from "@heroui/form";
import { motion } from "framer-motion";
import { cn } from "@heroui/react";

import TokenSelector from "./TokenSelector";

import { WalletToken } from "@/hooks/use-spl-tokens";

export default function TransferForm() {
  const [selectedToken, setSelectedToken] = useState<WalletToken | undefined>(
    undefined,
  );
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recipientValid, setRecipientValid] = useState<boolean | null>(null);
  const [amountValid, setAmountValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (recipient) {
      const isValid = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(recipient);

      setRecipientValid(isValid);
    } else {
      setRecipientValid(null);
    }
  }, [recipient]);

  useEffect(() => {
    if (amount && selectedToken) {
      const isValid =
        parseFloat(amount) > 0 &&
        parseFloat(amount) <= parseFloat(selectedToken.amount);

      setAmountValid(isValid);
    } else {
      setAmountValid(null);
    }
  }, [amount, selectedToken]);

  const setMaxAmount = () => {
    if (selectedToken) {
      setAmount(selectedToken.amount);
    }
  };

  //TODO: Implement token transfer logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedToken ||
      !amount ||
      !recipient ||
      !recipientValid ||
      !amountValid
    ) {
      return;
    }

    setIsLoading(true);

    console.log("Sending token:", {
      token: selectedToken,
      amount,
      recipient,
    });
    setIsLoading(false);
  };

  const isFormValid =
    selectedToken && amount && recipient && recipientValid && amountValid;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95">
        <div className="h-3 bg-gradient-to-r from-secondary via-primary to-secondary animate-gradient-x" />
        <CardHeader className="flex gap-3 p-8 pb-4">
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
            initial={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
              Send Tokens
            </h3>
            <p className="text-gray-500">
              Transfer tokens to another wallet with style
            </p>
          </motion.div>
        </CardHeader>
        <CardBody className="px-8 py-4">
          <Form className="space-y-8 grid grid-cols-1" onSubmit={handleSubmit}>
            <TokenSelector
              selectedToken={selectedToken}
              onTokenSelect={setSelectedToken}
            />

            <div>
              <label
                className="block text-base font-semibold mb-3"
                htmlFor="amount-input"
              >
                Amount
              </label>
              <div className="relative">
                <Input
                  isRequired
                  classNames={{
                    base: "mb-2",
                    label: "text-default-700 font-semibold",
                  }}
                  description={
                    selectedToken
                      ? `Balance: ${Number(selectedToken.amount).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: selectedToken.decimals,
                          },
                        )}`
                      : "Select a token first"
                  }
                  endContent={
                    selectedToken && (
                      <Button
                        className="h-6 px-4 w-fit min-w-[auto]"
                        color="secondary"
                        variant="flat"
                        onPress={setMaxAmount}
                      >
                        MAX
                      </Button>
                    )
                  }
                  id="amount-input"
                  labelPlacement="outside"
                  placeholder="0.00"
                  startContent={
                    <div className="text-secondary pointer-events-none flex items-center">
                      <span className="text-base">💰</span>
                    </div>
                  }
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              {amountValid === false && (
                <p className="text-xs text-red-500 mt-1">
                  Invalid amount. Please check your balance.
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-base font-semibold mb-3"
                htmlFor="recipient-input"
              >
                Recipient Address
              </label>
              <Input
                isRequired
                classNames={{
                  base: "mb-2",
                  label: "text-default-700 font-semibold",
                }}
                description="Enter the Solana wallet address of the recipient"
                endContent={
                  recipientValid !== null && (
                    <div
                      className={`flex items-center text-lg ${recipientValid ? "text-green-500" : "text-red-500"}`}
                    >
                      {recipientValid ? "✓" : "✗"}
                    </div>
                  )
                }
                id="recipient-input"
                labelPlacement="outside"
                placeholder="Solana wallet address"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-base">👤</span>
                  </div>
                }
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              {recipientValid === false && (
                <p className="text-xs text-red-500 mt-1">
                  Invalid Solana wallet address
                </p>
              )}
            </div>
          </Form>
        </CardBody>
        <CardFooter className="px-8 py-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <Button
            isDisabled
            className={cn(
              "w-full font-bold py-6 text-lg transition-all duration-300 rounded-xl",
              isFormValid ? "" : "bg-gray-200 text-gray-400 cursor-not-allowed",
            )}
            color={isFormValid ? "secondary" : "default"}
            isLoading={isLoading}
            radius="lg"
            startContent={
              !isLoading &&
              isFormValid && <span className="text-xl animate-pulse">✨</span>
            }
            type="submit"
            variant={isFormValid ? "flat" : "solid"}
            // isDisabled={!isFormValid || isLoading}
          >
            SOON
            {/* {isLoading
              ? "Processing..."
              : isFormValid
                ? "Send Tokens"
                : "Complete All Fields"} */}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
