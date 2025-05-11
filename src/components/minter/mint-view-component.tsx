import { Button } from "@heroui/button";

import { CopyIcon, LinkIcon } from "../icons";

import { MintViewData as MintViewDataType } from "@/types/index";
import { normalizeKey, truncateAddress } from "@/utils/string";

type MintViewDataProps = {
  mintData: MintViewDataType;
  compressionEnabled: boolean;
};

export const MintViewComponent = ({
  mintData,
  compressionEnabled,
}: MintViewDataProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`rounded-full p-2 ${compressionEnabled ? "bg-green-100" : "bg-blue-100"}`}
        >
          <span className="text-xl">{compressionEnabled ? "🗜️" : "🪙"}</span>
        </div>
        <h3 className="text-xl font-bold">
          {compressionEnabled ? "Compressed SPL Token" : "Regular SPL Token"}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center mb-2">
            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-blue-700">🏦</span>
            </span>
            <p className="font-semibold text-gray-700">Mint Address</p>
          </div>
          <div className="bg-white p-3 rounded-lg flex items-center justify-between">
            <p className="font-mono text-sm text-gray-600">
              {truncateAddress(mintData.mint.toBase58())}
            </p>
            <div className="flex gap-1">
              <Button
                isIconOnly
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border-none"
                radius="full"
                size="sm"
                variant="bordered"
                onPress={() => {
                  navigator.clipboard.writeText(mintData.mint.toBase58());
                }}
              >
                <CopyIcon size={16} />
              </Button>
              <Button
                isIconOnly
                as="a"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border-none"
                href={`https://explorer.solana.com/address/${mintData.mint.toBase58()}?cluster=devnet`}
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

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center mb-2">
            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-blue-700">🔢</span>
            </span>
            <p className="font-semibold text-gray-700">Decimals</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="font-mono text-lg font-semibold">
              {mintData.decimals}
            </p>
          </div>
        </div>

        {mintData.ata && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center mb-2">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-blue-700">🔗</span>
              </span>
              <p className="font-semibold text-gray-700">
                Associated Token Address (ATA)
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg flex items-center justify-between">
              <p className="font-mono text-sm text-gray-600">
                {truncateAddress(mintData.ata.toBase58())}
              </p>
              <div className="flex gap-1">
                <Button
                  isIconOnly
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border-none"
                  radius="full"
                  size="sm"
                  variant="bordered"
                  onPress={() => {
                    if (mintData.ata) {
                      navigator.clipboard.writeText(mintData.ata.toBase58());
                    }
                  }}
                >
                  <CopyIcon size={16} />
                </Button>
                <Button
                  isIconOnly
                  as="a"
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border-none"
                  href={`https://explorer.solana.com/address/${mintData.ata.toBase58()}?cluster=devnet`}
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
        )}

        {Object.keys(mintData.transactions).length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center mb-2">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-blue-700">📝</span>
              </span>
              <p className="font-semibold text-gray-700">Transactions</p>
            </div>
            <div className="space-y-3">
              {Object.entries(mintData.transactions).map(([key, value]) => (
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
                        href={`https://explorer.solana.com/tx/${value}?cluster=devnet`}
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
      </div>
    </div>
  );
};
