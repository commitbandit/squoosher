"use client";

import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Squoosher</h1>
        <p className="text-xl text-gray-500">
          Create Solana tokens with or without ZK compression
        </p>
      </div>
      {/* <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl">
        <div className="relative w-full aspect-video max-w-md">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-full h-full text-secondary-200 opacity-80"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M41,-51.2C51.2,-40.4,56.2,-25,61.6,-7.6C66.9,9.8,72.8,29.1,66.4,42C60,54.8,41.4,61.3,22.6,66.2C3.9,71.2,-15,74.7,-30.4,69C-45.7,63.2,-57.6,48.3,-64.3,31.2C-71,14.1,-72.5,-5,-66.3,-20.4C-60.1,-35.8,-46.3,-47.5,-31.9,-56.6C-17.5,-65.7,-2.6,-72.2,9.7,-70.8C22,-69.4,30.8,-61.9,41,-51.2Z"
                fill="currentColor"
                transform="translate(100 100)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-secondary-600">
                Squoosher
              </span>
            </div>
          </div>
        </div>
      </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardBody className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">TOKEN PROGRAM</h2>
              <p className="text-gray-500 mt-1">
                Standard Solana token program with optional ZK compression
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                The basic Solana token standard with:
              </p>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Custom token supply</li>
                <li>Configurable decimals</li>
                <li>Associated Token Accounts</li>
                <li>WITH or WITHOUT ZK compression options</li>
              </ul>
            </div>
            <div className="pt-4 !mt-auto">
              <Link href="/spl-token">
                <Button color="secondary" variant="flat">
                  Open TOKEN PROGRAM
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">TOKEN 2022 PROGRAM</h2>
              <p className="text-gray-500 mt-1">
                Advanced token standard with extended features and ZK
                compression options
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Enhanced token program with additional capabilities:
              </p>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Transfer fees</li>
                <li>Non-transferable tokens</li>
                <li>Token extensions</li>
                <li>Confidential transfers</li>
                <li>WITH or WITHOUT ZK compression options</li>
              </ul>
            </div>
            <div className="pt-4 !mt-auto">
              <Link href="/spl-token-2022">
                <Button color="secondary" variant="flat">
                  Open TOKEN 2022 PROGRAM
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">What is ZK Compression?</h2>
        <p className="text-sm text-gray-600 mb-4">
          ZK compression is a method that uses zero-knowledge proofs to minimize
          the data stored on-chain, significantly reducing the cost of token
          operations while maintaining security guarantees.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">WITHOUT Compression</h3>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Regular on-chain storage</li>
              <li>Higher transaction costs</li>
              <li>Maximum compatibility with existing wallets and tools</li>
              <li>Standard token interactions</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">WITH Compression</h3>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Reduced on-chain data storage</li>
              <li>Lower transaction fees</li>
              <li>Improved scalability for token operations</li>
              <li>Same security guarantees as standard tokens</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
