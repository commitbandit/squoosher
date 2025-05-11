"use client";
import { Card, CardBody } from "@heroui/react";

import AirdropForm from "@/components/minter/create-airdrop";

export default function AirdropCreator() {
  return (
    <>
      <div>
        <h1 className="text-indigo-700 text-3xl font-bold">Airdrop Creator</h1>
        <p className="text-gray-700 mt-2">
          Create an airdrop with compressed tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-1 order-2 md:order-1">
          <Card className="border-none shadow-md bg-gradient-to-b from-white to-gray-50">
            <CardBody className="space-y-4">
              <AirdropForm />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
