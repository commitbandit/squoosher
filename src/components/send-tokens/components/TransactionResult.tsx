import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";

import { CopyIcon, LinkIcon } from "../../icons";

import { truncateAddress } from "@/utils/string";

interface TransactionResultProps {
  hash: string;
}

export default function TransactionResult({ hash }: TransactionResultProps) {
  return (
    <Card className="mt-8 p-4">
      <CardHeader>
        <h3 className="text-xl font-bold mb-3">Transaction Hash</h3>
      </CardHeader>
      <CardBody className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 p-2 rounded-lg">
        <p className="font-mono text-sm text-gray-600">
          {truncateAddress(hash)}
        </p>
        <div className="flex gap-1">
          <Button
            isIconOnly
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border-none"
            radius="full"
            size="sm"
            variant="bordered"
            onPress={() => {
              navigator.clipboard.writeText(hash);
            }}
          >
            <CopyIcon size={16} />
          </Button>
          <Button
            isIconOnly
            as="a"
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border-none"
            href={`https://explorer.solana.com/tx/${hash}?cluster=devnet`}
            radius="full"
            rel="noopener noreferrer"
            size="sm"
            target="_blank"
            variant="bordered"
          >
            <LinkIcon size={16} />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
