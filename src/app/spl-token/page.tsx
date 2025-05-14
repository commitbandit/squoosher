"use client";

import { useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import Link from "next/link";

import MintSpl from "@/components/minter/mint-spl";
import CostCalculator from "@/components/cost-calculator";
import { PayerInfo } from "@/components/payer-info";

export default function TokenProgramPage() {
  const [selected, setSelected] = useState("without-compression");

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          TOKEN PROGRAM
        </h1>
        <p className="text-xl font-light opacity-90">
          Standard Solana token program with optional ZK compression
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 order-2 md:order-1">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-all duration-300">
            <div className="h-3 bg-gradient-to-r from-blue-400 to-purple-500" />
            <CardBody className="space-y-5 p-6">
              <div className="transform -translate-y-2">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center">
                  SPL Token Program
                </h2>
                <p className="text-gray-600 mt-2">
                  Common implementation for fungible and non-fungible tokens on
                  Solana.
                </p>
              </div>

              <Divider className="my-3 bg-gradient-to-r from-blue-200 to-purple-200 h-0.5 rounded-full" />

              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="text-xl font-bold text-blue-700 mb-3">
                  Key Features
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <span className="text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-sm">
                      🔄
                    </span>
                    <div className="font-medium">
                      Fungible & Non-Fungible tokens
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-sm">
                      🔐
                    </span>
                    <div className="font-medium">Mint & Freeze Authority</div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-sm">
                      🔢
                    </span>
                    <div className="font-medium">Configurable decimals</div>
                  </li>
                </ul>
              </div>

              <Divider className="my-3 bg-gradient-to-r from-blue-200 to-purple-200 h-0.5 rounded-full" />

              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="text-xl font-bold text-green-700 mb-3">
                  ZK Compression
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <span className="text-green-600 bg-green-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-sm">
                      💰
                    </span>
                    <div className="font-medium">
                      Reduced costs & efficient storage
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-green-600 bg-green-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-sm">
                      🚀
                    </span>
                    <div className="font-medium">
                      Create millions of accounts cheaply
                    </div>
                  </li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="md:col-span-2 order-1 md:order-2">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-blue-400 to-purple-500" />
            <CardBody className="p-6">
              <h3 className="text-2xl font-bold mb-6 text-center text-blue-700 flex items-center justify-center">
                <span className="bg-blue-100 rounded-full p-2 mr-2">
                  <span className="text-blue-700">✨</span>
                </span>
                Create Your SPL Token
              </h3>

              <PayerInfo />

              <Tabs
                aria-label="Token compression options"
                className="mt-4"
                classNames={{
                  tabList:
                    "gap-2 relative rounded-xl p-1 bg-blue-100 text-primary",
                  cursor: "shadow-md",
                  tab: "text-primary max-w-fit px-4 h-10 data-[selected=true]:text-blue-600 rounded-lg",
                  panel: "py-4",
                }}
                color="primary"
                selectedKey={selected}
                onSelectionChange={setSelected as any}
              >
                <Tab
                  key="without-compression"
                  title={
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-lg">🪙</span>
                      <span>Standard SPL Token</span>
                    </div>
                  }
                >
                  <MintSpl compressionEnabled={false} />
                </Tab>
                <Tab
                  key="with-compression"
                  title={
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-lg">🗜️</span>
                      <span>ZK-Compressed SPL Token</span>
                    </div>
                  }
                >
                  <MintSpl compressionEnabled={true} />
                </Tab>
              </Tabs>
            </CardBody>
          </Card>

          <div className="mt-8">
            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-blue-400 to-purple-500" />
              <CostCalculator />
            </Card>
          </div>

          <Card className="border-none shadow-xl rounded-2xl overflow-hidden mt-8">
            <div className="h-3 bg-gradient-to-r from-blue-400 to-purple-500" />
            <CardBody className="p-6">
              <h3 className="text-xl font-bold mb-4 text-blue-700 flex items-center">
                <span className="bg-blue-100 rounded-full p-1 mr-2">
                  <span className="text-blue-700">📚</span>
                </span>
                Documentation & Resources
              </h3>
              <Divider className="my-3 bg-gradient-to-r from-blue-200 to-purple-200 h-0.5 rounded-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Link
                  className="p-4 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors flex items-center group"
                  href="https://www.zkcompression.com/developers/typescript-client"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="bg-blue-100 rounded-full p-2 mr-3 group-hover:bg-blue-200 transition-colors">
                    <span className="text-blue-700">📘</span>
                  </div>
                  <h4 className="font-bold text-blue-700">
                    ZK Compression TypeScript Client
                  </h4>
                </Link>
                <Link
                  className="p-4 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors flex items-center group"
                  href="https://spl.solana.com/token"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="bg-blue-100 rounded-full p-2 mr-3 group-hover:bg-blue-200 transition-colors">
                    <span className="text-blue-700">📗</span>
                  </div>
                  <h4 className="font-bold text-blue-700">
                    Official SPL Token Documentation
                  </h4>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
