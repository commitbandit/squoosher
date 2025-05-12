"use client";

import { useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import Link from "next/link";

import MintToken2022 from "@/components/minter/mint-spl-token-2022";
import CostCalculator from "@/components/CostCalculator";
import { PayerInfo } from "@/components/payer-info";

export default function Token2022ProgramPage() {
  const [selected, setSelected] = useState("without-compression");

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 shadow-lg text-white">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          TOKEN 2022 PROGRAM
        </h1>
        <p className="text-xl font-light opacity-90">
          A superset of the Token Program with advanced features and optional ZK
          compression
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 order-2 md:order-1">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-all duration-300">
            <div className="h-3 bg-gradient-to-r from-indigo-400 to-violet-500" />
            <CardBody className="space-y-5 p-6">
              <div className="transform -translate-y-2">
                <h2 className="text-2xl font-bold text-indigo-700 flex items-center">
                  Token-2022
                </h2>
                <p className="text-gray-600 mt-2">
                  Enhanced token program with expanded functionality while
                  maintaining compatibility with the original SPL Token Program.
                </p>
              </div>

              <Divider className="my-3 bg-gradient-to-r from-indigo-200 to-violet-200 h-0.5 rounded-full" />

              <div className="bg-indigo-50 p-4 rounded-xl">
                <h3 className="text-xl font-bold text-indigo-700 mb-3">
                  Key Extensions
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <span className="text-indigo-600 bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-sm">
                      📝
                    </span>
                    <div className="font-medium">
                      Embedded metadata (name, symbol, URI)
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-indigo-600 bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-sm">
                      💸
                    </span>
                    <div className="font-medium">
                      Transfer fees & non-transferable tokens
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-indigo-600 bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-sm">
                      🔒
                    </span>
                    <div className="font-medium">
                      Interest-bearing & confidential transfers
                    </div>
                  </li>
                </ul>
              </div>

              <Divider className="my-3 bg-gradient-to-r from-indigo-200 to-violet-200 h-0.5 rounded-full" />

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
                      Lower costs & improved scalability
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-green-600 bg-green-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-sm">
                      🔌
                    </span>
                    <div className="font-medium">
                      Compatible with various Token-2022 extensions
                    </div>
                  </li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="md:col-span-2 order-1 md:order-2">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-indigo-400 to-violet-500" />
            <CardBody className="p-6">
              <h3 className="text-2xl font-bold mb-6 text-center text-indigo-700 flex items-center justify-center">
                <span className="bg-indigo-100 rounded-full p-2 mr-2">
                  <span className="text-indigo-700">✨</span>
                </span>
                Create Your Token-2022
              </h3>

              <PayerInfo />

              <Tabs
                aria-label="Token compression options"
                className="mt-4"
                classNames={{
                  tabList: "gap-2 relative rounded-xl p-1 bg-indigo-100",
                  cursor: "shadow-md",
                  tab: "max-w-fit px-4 h-10 data-[selected=true]:text-indigo-600 rounded-lg",
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
                      <span>Standard Token-2022</span>
                    </div>
                  }
                >
                  <MintToken2022 compressionEnabled={false} />
                </Tab>
                <Tab
                  key="with-compression"
                  title={
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-lg">🗜️</span>
                      <span>ZK-Compressed Token-2022</span>
                    </div>
                  }
                >
                  <MintToken2022 compressionEnabled={true} />
                </Tab>
              </Tabs>

              <div className="mt-6 p-4 border border-indigo-200 bg-indigo-50 rounded-xl flex items-center gap-3">
                <span className="bg-indigo-100 rounded-full p-2 flex-shrink-0">
                  <span className="text-indigo-700">🔍</span>
                </span>
                <div>
                  <p className="text-sm text-indigo-700 mb-1 font-semibold">
                    Program Address:
                  </p>
                  <p className="font-mono text-xs bg-white p-2 rounded border border-indigo-100">
                    TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="mt-8">
            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-indigo-400 to-violet-500" />
              <CostCalculator />
            </Card>
          </div>

          <Card className="border-none shadow-xl rounded-2xl overflow-hidden mt-8">
            <div className="h-3 bg-gradient-to-r from-indigo-400 to-violet-500" />
            <CardBody className="p-6">
              <h3 className="text-xl font-bold mb-4 text-indigo-700 flex items-center">
                <span className="bg-indigo-100 rounded-full p-1 mr-2">
                  <span className="text-indigo-700">📚</span>
                </span>
                Documentation & Resources
              </h3>
              <Divider className="my-3 bg-gradient-to-r from-indigo-200 to-violet-200 h-0.5 rounded-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Link
                  className="p-4 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors flex items-center group"
                  href="https://www.zkcompression.com/developers/using-token-2022"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="bg-indigo-100 rounded-full p-2 mr-3 group-hover:bg-indigo-200 transition-colors">
                    <span className="text-indigo-700">📘</span>
                  </div>
                  <h4 className="font-bold text-indigo-700">
                    ZK Compression with Token-2022
                  </h4>
                </Link>
                <Link
                  className="p-4 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors flex items-center group"
                  href="https://spl.solana.com/token-2022"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="bg-indigo-100 rounded-full p-2 mr-3 group-hover:bg-indigo-200 transition-colors">
                    <span className="text-indigo-700">📗</span>
                  </div>
                  <h4 className="font-bold text-indigo-700">
                    Official Token-2022 Documentation
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
