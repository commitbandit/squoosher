"use client";

import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-12">
      <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
        <CardBody className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/4 flex justify-center">
              <div className="relative w-full h-52">
                <Image
                  fill
                  alt="Squoosher"
                  className="object-contain"
                  src="/standing-squoosher.webp"
                />
              </div>
            </div>
            <div className="w-full md:w-3/4">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Squoosher
              </h1>
              <p className="text-gray-700 mb-4">
                Squoosher is a tool for creating Solana tokens with
                Zero-Knowledge compression capabilities. It simplifies the
                process of deploying both standard SPL tokens and advanced
                Token-2022 tokens, with or without compression.
              </p>
              <p className="text-gray-700">
                With Squoosher, developers can significantly reduce transaction
                costs while maintaining the security and functionality of their
                token programs on the Solana blockchain.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardBody className="p-6 space-y-4 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-50 opacity-50 z-0" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-semibold">TOKEN PROGRAM</h2>
              </div>
              <p className="text-gray-500 mt-1">
                Standard Solana token program with optional ZK compression
              </p>
            </div>
            <div className="space-y-2 relative z-10">
              <p className="text-sm text-gray-600">
                The basic Solana token standard with:
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                {[
                  "Custom token supply",
                  "Configurable decimals",
                  "Associated Token Accounts",
                  "WITH or WITHOUT ZK compression options",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 !mt-auto relative z-10">
              <Link href="/spl-token">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                  Open TOKEN PROGRAM
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardBody className="p-6 space-y-4 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-50 opacity-50 z-0" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-semibold">TOKEN 2022 PROGRAM</h2>
              </div>
              <p className="text-gray-500 mt-1">
                Advanced token standard with extended features and ZK
                compression options
              </p>
            </div>
            <div className="space-y-2 relative z-10">
              <p className="text-sm text-gray-600">
                Enhanced token program with additional capabilities:
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                {[
                  "Transfer fees",
                  "Non-transferable tokens",
                  "Token extensions",
                  "Confidential transfers",
                  "WITH or WITHOUT ZK compression options",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 !mt-auto relative z-10">
              <Link href="/spl-token-2022">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  Open TOKEN 2022 PROGRAM
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="border-none shadow-md bg-gradient-to-b from-white to-gray-50">
        <CardBody className="p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            What is ZK Compression?
          </h2>
          <p className="text-sm text-gray-700 mb-6">
            ZK compression is a method that uses zero-knowledge proofs to
            minimize the data stored on-chain, significantly reducing the cost
            of token operations while maintaining security guarantees.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-700">
                WITHOUT Compression
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {[
                  "Regular on-chain storage",
                  "Higher transaction costs",
                  "Maximum compatibility with existing wallets and tools",
                  "Standard token interactions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 p-4 bg-indigo-50 rounded-lg">
              <h3 className="text-lg font-medium text-indigo-700">
                WITH Compression
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {[
                  "Reduced on-chain data storage",
                  "Lower transaction fees",
                  "Improved scalability for token operations",
                  "Same security guarantees as standard tokens",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
