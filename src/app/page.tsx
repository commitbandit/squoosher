"use client";

import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import Image from "next/image";

import CostCalculator from "@/components/cost-calculator";

export default function Home() {
  return (
    <div className="space-y-16 py-8 max-w-7xl mx-auto px-4">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative w-full h-64 transform hover:scale-105 transition-transform duration-300">
                <Image
                  fill
                  alt="Squoosher"
                  className="object-contain drop-shadow-lg"
                  src="/standing-squoosher.webp"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center">
                Squoosher
              </h1>
              <div className="space-y-4 text-lg font-light">
                <p>
                  Squoosher is a powerful tool for creating Solana tokens with
                  Zero-Knowledge compression capabilities. It simplifies the
                  process of deploying both standard SPL tokens and advanced
                  Token-2022 tokens, with or without compression.
                </p>
                <p>
                  With Squoosher, developers can significantly reduce
                  transaction costs while maintaining the security and
                  functionality of their token programs on the Solana
                  blockchain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
          Choose Your Token Program
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 group">
            <div className="h-3 bg-gradient-to-r from-blue-400 to-cyan-500" />
            <CardBody className="p-6 space-y-6 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-50 opacity-40 z-0 group-hover:opacity-70 transition-opacity" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-blue-700">
                    TOKEN PROGRAM
                  </h2>
                </div>
                <p className="text-gray-600 mt-2">
                  Standard Solana token program with optional ZK compression
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl relative z-10">
                <p className="text-sm font-semibold text-blue-700 mb-3">
                  Features:
                </p>
                <ul className="space-y-2">
                  {[
                    "Custom token supply",
                    "Configurable decimals",
                    "Associated Token Accounts",
                    "WITH or WITHOUT ZK compression options",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 shadow-sm">
                        ✓
                      </span>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10 !mt-auto">
                <Link className="block" href="/spl-token">
                  <Button className="w-full font-semibold text-white transition-transform active:scale-95 bg-gradient-to-r from-blue-600 to-cyan-600 shadow-md py-6">
                    <span className="text-xl mr-2">✨</span>
                    Open TOKEN PROGRAM
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 group">
            <div className="h-3 bg-gradient-to-r from-indigo-400 to-violet-500" />
            <CardBody className="p-6 space-y-6 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-50 opacity-40 z-0 group-hover:opacity-70 transition-opacity" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-indigo-700">
                    TOKEN 2022 PROGRAM
                  </h2>
                </div>
                <p className="text-gray-600 mt-2">
                  Advanced token standard with extended features and ZK
                  compression options
                </p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-xl relative z-10">
                <p className="text-sm font-semibold text-indigo-700 mb-3">
                  Advanced Features:
                </p>
                <ul className="space-y-2">
                  {[
                    "Transfer fees",
                    "Non-transferable tokens",
                    "Token extensions",
                    "Confidential transfers",
                    "WITH or WITHOUT ZK compression options",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-indigo-600 bg-indigo-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 shadow-sm">
                        ✓
                      </span>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10">
                <Link className="block" href="/spl-token-2022">
                  <Button className="w-full font-semibold text-white transition-transform active:scale-95 bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md py-6">
                    <span className="text-xl mr-2">✨</span>
                    Open TOKEN 2022 PROGRAM
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ZK Compression Info */}
      <div className="rounded-2xl overflow-hidden bg-white shadow-xl">
        <div className="h-3 bg-gradient-to-r from-green-400 to-teal-500" />
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-green-700">
              What is ZK Compression?
            </h2>
          </div>

          <p className="text-gray-600 mb-8">
            ZK compression is a method that uses zero-knowledge proofs to
            minimize the data stored on-chain, significantly reducing the cost
            of token operations while maintaining security guarantees.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-bold text-blue-700">
                  WITHOUT Compression
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Regular on-chain storage",
                  "Higher transaction costs",
                  "Maximum compatibility with existing wallets and tools",
                  "Standard token interactions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-blue-600 bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      i
                    </span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-bold text-green-700">
                  WITH Compression
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Reduced on-chain data storage",
                  "Lower transaction fees",
                  "Improved scalability for token operations",
                  "Same security guarantees as standard tokens",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-green-600 bg-green-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      ✓
                    </span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Calculator */}
      <div className="rounded-2xl overflow-hidden bg-white shadow-xl">
        <div className="h-3 bg-gradient-to-r from-purple-400 to-pink-500" />
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-purple-700">
              Cost Savings Calculator
            </h2>
          </div>

          <p className="text-gray-600 mb-8">
            See how much you can save using ZK compression for your token
            program. Adjust the number of accounts to calculate potential cost
            savings.
          </p>

          <CostCalculator />
        </div>
      </div>
    </div>
  );
}
