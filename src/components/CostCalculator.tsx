"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Slider } from "@heroui/slider";
import { Tabs, Tab } from "@heroui/tabs";

import { trimNumber } from "@/utils/numbers";

const CostCalculator = () => {
  const [quantity, setQuantity] = useState(100);
  const [selectedTab, setSelectedTab] = useState("token-accounts");

  // Cost calculations
  const costs = {
    "pda-accounts": {
      regularCost: 0.0016, // SOL per account
      compressedCost: 0.00001, // SOL per account
      savingsMultiplier: 160,
    },
    "token-accounts": {
      regularCost: 0.002, // SOL per account (0.2 / 100)
      compressedCost: 0.0000004, // SOL per account (0.00004 / 100)
      savingsMultiplier: 5000,
    },
  };

  const calculateCost = (isCompressed: boolean) => {
    const costPerAccount = isCompressed
      ? costs[selectedTab as keyof typeof costs].compressedCost
      : costs[selectedTab as keyof typeof costs].regularCost;

    return costPerAccount * quantity;
  };

  const savingsAmount = calculateCost(false) - calculateCost(true);
  const savingsPercentage = (savingsAmount / calculateCost(false)) * 100;

  return (
    <Card className="border-none shadow-lg">
      <CardBody className="p-6">
        <h3 className="text-xl font-semibold text-center mb-4">
          Cost Savings Calculator
        </h3>

        <Tabs
          aria-label="Account types"
          className="mb-6"
          color="primary"
          selectedKey={selectedTab}
          variant="underlined"
          onSelectionChange={setSelectedTab as any}
        >
          <Tab key="token-accounts" title="Token Accounts" />
          <Tab key="pda-accounts" title="PDA Accounts (100-byte)" />
        </Tabs>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Number of Accounts: {quantity}
          </label>
          <Slider
            className="max-w-full"
            defaultValue={100}
            maxValue={100000}
            minValue={1}
            step={1}
            value={quantity}
            onChange={(value) => setQuantity(Number(value))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2">Regular Accounts</h4>
            <p className="text-3xl font-bold text-blue-800">
              {trimNumber(calculateCost(false), 6)} SOL
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">
              Compressed Accounts
            </h4>
            <p className="text-3xl font-bold text-green-800">
              {trimNumber(calculateCost(true), 6)} SOL
            </p>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-purple-700">Your Savings</h4>
            <p className="text-sm font-bold text-purple-800">
              {costs[selectedTab as keyof typeof costs].savingsMultiplier}x
              cheaper
            </p>
          </div>
          <p className="text-3xl font-bold text-purple-800 mt-1">
            {trimNumber(savingsAmount, 6)} SOL ({savingsPercentage.toFixed(2)}%)
          </p>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          <p>* Cost estimates based on average Solana blockchain fees</p>
        </div>
      </CardBody>
    </Card>
  );
};

export default CostCalculator;
