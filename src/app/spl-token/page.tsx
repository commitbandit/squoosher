"use client";

import { useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import Link from "next/link";

import MintSpl from "@/components/minter/mint-spl";

export default function TokenProgramPage() {
  const [selected, setSelected] = useState("without-compression");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-blue-700 text-3xl font-bold">TOKEN PROGRAM</h1>
        <p className="text-gray-700 mt-2">
          Standard Solana token program with optional ZK compression
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 order-2 md:order-1">
          <Card className="border-none shadow-md bg-gradient-to-b from-white to-gray-50">
            <CardBody className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-blue-700">
                  SPL Token Program
                </h2>
                <p className="text-sm text-gray-700">
                  Common implementation for fungible and non-fungible tokens on
                  Solana.
                </p>
              </div>

              <Divider />

              <div>
                <h3 className="text-lg font-semibold text-blue-700">
                  Key Features
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex gap-2 items-start">
                    <span className="text-blue-600 font-bold">•</span>
                    <div>Fungible & Non-Fungible tokens</div>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-blue-600 font-bold">•</span>
                    <div>Mint & Freeze Authority</div>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-blue-600 font-bold">•</span>
                    <div>Configurable decimals</div>
                  </li>
                </ul>
              </div>

              <Divider />

              <div>
                <h3 className="text-lg font-semibold text-blue-700">
                  ZK Compression
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex gap-2 items-start">
                    <span className="text-green-600 font-bold">•</span>
                    <div>Reduced costs & efficient storage</div>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-green-600 font-bold">•</span>
                    <div>Create millions of accounts cheaply</div>
                  </li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="md:col-span-2 order-1 md:order-2">
          <Card className="border-none shadow-lg">
            <CardBody className="p-6">
              <h3 className="text-xl font-medium mb-4 text-center">
                Create Your SPL Token
              </h3>

              <Tabs
                aria-label="Token compression options"
                className="mt-4"
                color="primary"
                selectedKey={selected}
                variant="underlined"
                onSelectionChange={setSelected as any}
              >
                <Tab
                  key="without-compression"
                  title={
                    <div className="flex items-center gap-2">
                      <span>Standard SPL Token</span>
                    </div>
                  }
                >
                  <MintSpl compressionEnabled={false} />
                </Tab>
                <Tab
                  key="with-compression"
                  title={
                    <div className="flex items-center gap-2">
                      <span>ZK-Compressed SPL Token</span>
                    </div>
                  }
                >
                  <MintSpl compressionEnabled={true} />
                </Tab>
              </Tabs>
            </CardBody>
          </Card>

          <Card className="border-none shadow-md mt-4">
            <CardBody className="p-4">
              <h3 className="text-lg font-medium mb-2 text-blue-700">Docs</h3>
              <Divider className="mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link
                  className="p-2 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors"
                  href="https://www.zkcompression.com/developers/typescript-client"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <h4 className="font-medium">
                    ZK Compression TypeScript Client
                  </h4>
                </Link>
                <Link
                  className="p-2 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors"
                  href="https://spl.solana.com/token"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <h4 className="font-medium">
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
