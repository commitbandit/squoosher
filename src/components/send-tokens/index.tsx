"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Form } from "@heroui/form";

import TokenSelector from "./TokenSelector";

import { WalletToken } from "@/hooks/useTokens";

export default function TransferForm() {
  const [selectedToken, setSelectedToken] = useState<WalletToken | undefined>(
    undefined,
  );
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //TODO: Implement token transfer logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedToken || !amount || !recipient) {
      return;
    }

    setIsLoading(true);

    try {
      // Here you would implement the token transfer logic
      console.log("Sending token:", {
        token: selectedToken,
        amount,
        recipient,
      });

      // Mock successful submission
      setTimeout(() => {
        setIsLoading(false);
        // Reset form after success
        setAmount("");
        setRecipient("");
      }, 1500);
    } catch (error) {
      console.error("Error sending tokens:", error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-xl rounded-2xl">
      <div className="h-3 bg-gradient-to-r from-purple-400 to-blue-500" />
      <CardHeader className="flex gap-3 p-6">
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold text-gray-800">Send Tokens</h3>
          <p className="text-gray-500">Transfer tokens to another wallet</p>
        </div>
      </CardHeader>
      <CardBody className="px-6 pb-4">
        <Form className="space-y-6 grid grid-cols-1" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm font-semibold text-gray-700 mb-2"
              htmlFor="token-selector"
            >
              Select Token
            </label>
            <TokenSelector
              selectedToken={selectedToken}
              onTokenSelect={setSelectedToken}
            />
          </div>

          <div>
            <Input
              isRequired
              classNames={{
                base: "mb-2",
                label: "text-default-700 font-semibold",
                inputWrapper:
                  "shadow-sm bg-white border-2 border-purple-100 hover:border-purple-200 focus-within:!border-purple-400",
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
              label="Amount"
              labelPlacement="outside"
              placeholder="0.00"
              startContent={
                <div className="text-purple-500 pointer-events-none flex items-center">
                  <span className="text-sm">💰</span>
                </div>
              }
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Input
              isRequired
              classNames={{
                base: "mb-2",
                label: "text-default-700 font-semibold",
                inputWrapper:
                  "shadow-sm bg-white border-2 border-purple-100 hover:border-purple-200 focus-within:!border-purple-400",
              }}
              description="Enter the Solana wallet address of the recipient"
              label="Recipient Address"
              labelPlacement="outside"
              placeholder="Solana wallet address"
              startContent={
                <div className="text-purple-500 pointer-events-none flex items-center">
                  <span className="text-sm">👤</span>
                </div>
              }
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
        </Form>
      </CardBody>
      <CardFooter className="px-6 py-4 bg-gray-50">
        <Button
          isDisabled
          className="w-full font-semibold transition-transform active:scale-95 bg-gradient-to-r from-purple-600 to-blue-600 text-white cursor-not-allowed"
          isLoading={isLoading}
          radius="lg"
          startContent={!isLoading && <span>✨</span>}
          type="submit"
          variant="shadow"
          // isDisabled={!selectedToken || !amount || !recipient || isLoading}
        >
          SOON
          {/* {isLoading ? "Processing..." : "Send Tokens"} */}
        </Button>
      </CardFooter>
    </Card>
  );
}
