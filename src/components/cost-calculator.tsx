"use client";

import { useState } from "react";
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
    <div>
      <Tabs
        aria-label="Account types"
        className="mb-8"
        color="primary"
        selectedKey={selectedTab}
        variant="solid"
        onSelectionChange={setSelectedTab as any}
      >
        <Tab key="token-accounts" title="Token Accounts" />
        <Tab key="pda-accounts" title="PDA Accounts (100-byte)" />
      </Tabs>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <label
            className="text-base font-semibold text-gray-700"
            htmlFor="quantity"
          >
            Number of Accounts
          </label>
          <span className="text-lg font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            {quantity.toLocaleString()}
          </span>
        </div>
        <Slider
          className="max-w-full"
          defaultValue={100}
          maxValue={100000}
          minValue={1}
          step={1}
          value={quantity}
          onChange={(value) => setQuantity(Number(value))}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>1</span>
          <span>50,000</span>
          <span>100,000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
          <h4 className="font-semibold text-blue-700 mb-2 text-lg">
            Regular Accounts
          </h4>
          <p className="text-4xl font-bold text-blue-800">
            {trimNumber(calculateCost(false), 6)} SOL
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Standard on-chain storage cost
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-100">
          <h4 className="font-semibold text-green-700 mb-2 text-lg">
            Compressed Accounts
          </h4>
          <p className="text-4xl font-bold text-green-800">
            {trimNumber(calculateCost(true), 6)} SOL
          </p>
          <p className="text-sm text-green-600 mt-2">
            ZK-compressed storage cost
          </p>
        </div>
      </div>

      <div className="bg-purple-100 p-6 rounded-xl shadow-sm border border-purple-200 mb-6">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-purple-700 text-lg">
            Your Total Savings
          </h4>
          <div className="bg-purple-200 text-purple-800 font-bold rounded-full px-4 py-1">
            {costs[selectedTab as keyof typeof costs].savingsMultiplier}x
            cheaper
          </div>
        </div>
        <p className="text-4xl font-bold text-purple-800 mt-3">
          {trimNumber(savingsAmount, 6)} SOL
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="bg-purple-200 text-purple-800 font-bold rounded-full px-3 py-1 text-sm">
            {savingsPercentage.toFixed(2)}% savings
          </div>
          <p className="text-sm text-purple-700">
            compared to regular accounts
          </p>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="font-medium mb-1">Note:</p>
        <p>• Cost estimates based on average Solana blockchain fees</p>
        <p>• Actual costs may vary based on network conditions</p>
      </div>
    </div>
  );
};

export default CostCalculator;
