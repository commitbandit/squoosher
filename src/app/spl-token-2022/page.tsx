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
    <div className="space-y-6">
      <div>
        <h1 className="text-indigo-700 text-3xl font-bold">
          TOKEN 2022 PROGRAM
        </h1>
        <p className="text-gray-700 mt-2">
          A superset of the Token Program with advanced features and optional ZK
          compression
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 order-2 md:order-1">
          <Card className="border-none shadow-md bg-gradient-to-b from-white to-gray-50">
            <CardBody className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-indigo-700">
                  Token-2022
                </h2>
                <p className="text-sm text-gray-700">
                  Enhanced token program with expanded functionality while
                  maintaining compatibility with the original SPL Token Program.
                </p>
              </div>

              <Divider />

              <div>
                <h3 className="text-lg font-semibold text-indigo-700">
                  Key Extensions
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex gap-2 items-start">
                    <span className="text-indigo-600 font-bold">•</span>
                    <div>Embedded metadata (name, symbol, URI)</div>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-indigo-600 font-bold">•</span>
                    <div>Transfer fees & non-transferable tokens</div>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-indigo-600 font-bold">•</span>
                    <div>Interest-bearing & confidential transfers</div>
                  </li>
                </ul>
              </div>

              <Divider />

              <div>
                <h3 className="text-lg font-semibold text-indigo-700">
                  ZK Compression
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex gap-2 items-start">
                    <span className="text-green-600 font-bold">•</span>
                    <div>Lower costs & improved scalability</div>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-green-600 font-bold">•</span>
                    <div>Compatible with various Token-2022 extensions</div>
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
                Create Your Token-2022
              </h3>
              <PayerInfo />
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
                      <span>Standard Token-2022</span>
                    </div>
                  }
                >
                  <MintToken2022 compressionEnabled={false} />
                </Tab>
                <Tab
                  key="with-compression"
                  title={
                    <div className="flex items-center gap-2">
                      <span>ZK-Compressed Token-2022</span>
                    </div>
                  }
                >
                  <MintToken2022 compressionEnabled={true} />
                </Tab>
              </Tabs>

              <div className="mt-4 p-3 border border-indigo-100 bg-indigo-50 rounded-lg">
                <p className="text-xs text-indigo-700">
                  Program Address:{" "}
                  <span className="font-mono">
                    TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
                  </span>
                </p>
              </div>
            </CardBody>
          </Card>

          <div className="mt-6">
            <CostCalculator />
          </div>

          <Card className="border-none shadow-md mt-6">
            <CardBody className="p-4">
              <h3 className="text-lg font-medium mb-2 text-indigo-700">Docs</h3>
              <Divider className="mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link
                  className="p-2 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors"
                  href="https://www.zkcompression.com/developers/using-token-2022"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <h4 className="font-medium">
                    ZK Compression with Token-2022
                  </h4>
                </Link>
                <Link
                  className="p-2 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors"
                  href="https://spl.solana.com/token-2022"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <h4 className="font-medium">
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
