import { Button } from "@heroui/button";
import { cn } from "@heroui/react";

import { CopyIcon, LinkIcon } from "./icons";

import { normalizeKey, truncateAddress } from "@/utils/string";
import { getScanTxUrl } from "@/utils/explorer";

type TransactionViewerProps = {
  transactions: Record<string, string>;
  className?: string;
};

export const TransactionViewer = ({
  transactions,
  className,
}: TransactionViewerProps) => {
  return (
    <>
      {Object.keys(transactions).length > 0 && (
        <div
          className={cn(
            "bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 shadow-sm border border-gray-200",
            className,
          )}
        >
          <div className="flex items-center mb-2">
            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-blue-700">📝</span>
            </span>
            <p className="font-semibold text-gray-700">Transactions</p>
          </div>
          <div className="space-y-3">
            {Object.entries(transactions).map(([key, value]) => (
              <div key={key} className="bg-white p-3 rounded-lg">
                <p className="text-sm text-blue-600 font-semibold mb-2">
                  {normalizeKey(key)}
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-gray-600">
                    {truncateAddress(value)}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      isIconOnly
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border-none"
                      radius="full"
                      size="sm"
                      variant="bordered"
                      onPress={() => {
                        navigator.clipboard.writeText(value);
                      }}
                    >
                      <CopyIcon size={16} />
                    </Button>
                    <Button
                      isIconOnly
                      as="a"
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border-none"
                      href={getScanTxUrl(value)}
                      radius="full"
                      rel="noopener noreferrer"
                      size="sm"
                      target="_blank"
                      variant="bordered"
                    >
                      <LinkIcon size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
