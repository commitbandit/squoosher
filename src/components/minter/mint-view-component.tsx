import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Accordion, AccordionItem } from "@heroui/accordion";

import { CopyIcon, LinkIcon } from "../icons";

import { MintViewData as MintViewDataType } from "@/types/index";
import { normalizeKey } from "@/utils/string";

type MintViewDataProps = {
  mintData: MintViewDataType;
  compressionEnabled: boolean;
};

export const MintViewComponent = ({
  mintData,
  compressionEnabled,
}: MintViewDataProps) => {
  return (
    <>
      <Divider className="my-8" />
      <div className="mt-8 flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">Token Type</p>
          <p className="font-medium">
            {compressionEnabled ? "Compressed SPL Token" : "Regular SPL Token"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Mint Address</p>
          <div className="font-mono text-sm flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {mintData.mint.toBase58().slice(0, 4)}...
              {mintData.mint.toBase58().slice(-4)}
            </span>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => {
                navigator.clipboard.writeText(mintData.mint.toBase58());
              }}
            >
              <CopyIcon size={16} />
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 font-medium">Decimals</p>
          <p className="font-mono">{mintData.decimals}</p>
        </div>
        {mintData.ata && (
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Associated Token Address (ATA)
            </p>
            <div className="font-mono text-sm flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {mintData.ata.toBase58().slice(0, 4)}...
                {mintData.ata.toBase58().slice(-4)}
              </span>
              <Button
                isIconOnly
                size="sm"
                variant="light"
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
                href={`https://explorer.solana.com/address/${mintData.ata.toBase58()}?cluster=devnet`}
                rel="noopener noreferrer"
                size="sm"
                target="_blank"
                variant="light"
              >
                <LinkIcon size={16} />
              </Button>
            </div>
          </div>
        )}
        <Accordion>
          <AccordionItem
            key="transactions"
            aria-label="transactions"
            title="Transactions"
          >
            {Object.entries(mintData.transactions).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-gray-500 font-medium">
                  {normalizeKey(key)}
                </p>
                <div className="font-mono text-sm flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {value.slice(0, 4)}...{value.slice(-4)}
                  </span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                      navigator.clipboard.writeText(value);
                    }}
                  >
                    <CopyIcon size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    as="a"
                    href={`https://explorer.solana.com/tx/${value}?cluster=devnet`}
                    rel="noopener noreferrer"
                    size="sm"
                    target="_blank"
                    variant="faded"
                  >
                    <LinkIcon size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
};
