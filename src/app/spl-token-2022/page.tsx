"use client";

import { useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";

import { PayerInfo } from "@/components/payer-info";
import MintToken2022 from "@/components/minter/mint-spl-token-2022";

export default function Token2022ProgramPage() {
  const [selected, setSelected] = useState("without-compression");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">TOKEN 2022 PROGRAM</h1>
        <p className="text-gray-500 mt-2">
          Advanced Solana token standard with optional ZK compression
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6 order-2 md:order-1">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p className="text-sm text-gray-600">
              The TOKEN 2022 PROGRAM is an upgraded version of the standard SPL
              token with enhanced functionality. You can create tokens with or
              without ZK compression.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced Features</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>Non-transferable tokens</li>
              <li>Transfer fees</li>
              <li>Token metadata</li>
              <li>Confidential transfers</li>
              <li>Token extensions</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ZK Compression</h3>
            <p className="text-sm text-gray-600">
              ZK compression minimizes the data that costs to save on the
              blockchain, significantly reducing the cost of token operations.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>Lower storage costs</li>
              <li>Reduced transaction fees</li>
              <li>Improved scalability</li>
              <li>Maintains security guarantees</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">When to Use</h3>
            <p className="text-sm text-gray-600">Choose the right option:</p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>
                <strong>WITHOUT:</strong> For maximum compatibility with
                existing tools
              </li>
              <li>
                <strong>WITH:</strong> For cost-efficient token operations at
                scale
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 order-1 md:order-2">
          <div className="bg-white p-4 md:p-6 rounded-xl border">
            <h3 className="text-lg font-medium mb-4">Live Demo</h3>
            <PayerInfo />

            <Tabs
              aria-label="Token compression options"
              className="mb-6"
              selectedKey={selected}
              onSelectionChange={setSelected as any}
            >
              <Tab key="without-compression" title="WITHOUT Compression">
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Create a TOKEN 2022 token without ZK compression.
                  </p>
                  <MintToken2022 compressionEnabled={false} />
                </div>
              </Tab>
              <Tab key="with-compression" title="WITH Compression">
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Create a ZK-compressed TOKEN 2022 token with reduced
                    on-chain costs.
                  </p>
                  <MintToken2022 compressionEnabled={true} />
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
