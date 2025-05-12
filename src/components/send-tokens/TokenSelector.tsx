import { useState, useMemo } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { cn } from "@heroui/react";

import { ChevronDownIcon } from "../icons";

import { useTokens, WalletToken } from "@/hooks/useTokens";
import { truncateAddress } from "@/utils/string";

export enum TokenType {
  STANDARD = "Standard SPL Token",
  STANDARD_COMPRESSED = "Standard SPL Token (Compressed)",
  TOKEN_2022 = "Token 2022",
  TOKEN_2022_COMPRESSED = "Token 2022 (Compressed)",
}

interface TokenSelectorProps {
  onTokenSelect: (token: WalletToken) => void;
  selectedToken?: WalletToken;
}

export default function TokenSelector({
  onTokenSelect,
  selectedToken,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: tokens, isLoading } = useTokens();

  const getTokenType = (programId: string): TokenType => {
    if (programId === TOKEN_PROGRAM_ID.toBase58()) {
      return TokenType.STANDARD;
    } else if (programId === TOKEN_2022_PROGRAM_ID.toBase58()) {
      return TokenType.TOKEN_2022;
    } else {
      return TokenType.STANDARD;
    }
  };

  const filteredTokens = useMemo(() => {
    if (!tokens) return [];

    return tokens.filter((token) => {
      const searchLower = searchQuery.toLowerCase();

      return (
        token.name?.toLowerCase().includes(searchLower) ||
        token.symbol?.toLowerCase().includes(searchLower) ||
        token.mint.toLowerCase().includes(searchLower)
      );
    });
  }, [tokens, searchQuery]);

  const getTokenTypeStyles = (type: TokenType) => {
    switch (type) {
      case TokenType.STANDARD:
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          icon: "🪙",
        };
      case TokenType.STANDARD_COMPRESSED:
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          icon: "🗜️",
        };
      case TokenType.TOKEN_2022:
        return {
          bg: "bg-indigo-100",
          text: "text-indigo-700",
          icon: "⚡",
        };
      case TokenType.TOKEN_2022_COMPRESSED:
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          icon: "🗜️",
        };
    }
  };

  const handleSelect = (token: WalletToken) => {
    onTokenSelect(token);
    setIsOpen(false);
  };

  return (
    <div>
      <Button
        className="w-full justify-between px-4 py-2 h-auto border-2 border-gray-200 bg-white hover:bg-gray-50 text-left"
        variant="bordered"
        onPress={() => setIsOpen(true)}
      >
        {selectedToken ? (
          <div className="flex items-center gap-3">
            {selectedToken.url && (
              <img
                alt={selectedToken.symbol || "Token Icon"}
                className="size-10 object-cover rounded-full"
                src={selectedToken.url}
              />
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                {selectedToken.symbol || "Unknown"}{" "}
                <span className="text-gray-500 text-sm">
                  ({getTokenType(selectedToken.programId)})
                </span>
              </span>
              <span className="text-sm text-gray-500">
                {selectedToken.name || truncateAddress(selectedToken.mint)}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Select Token</span>
        )}
        <ChevronDownIcon size={20} />
      </Button>

      <Modal
        isOpen={isOpen}
        placement="center"
        scrollBehavior="inside"
        onClose={() => setIsOpen(false)}
      >
        <ModalContent className="max-w-md">
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-bold">Select Token</h3>
          </ModalHeader>
          <ModalBody>
            <Input
              className="mb-4"
              classNames={{
                inputWrapper:
                  "shadow-sm bg-white border-2 border-indigo-100 hover:border-indigo-200 focus-within:!border-indigo-400",
              }}
              placeholder="Search by name, symbol, or address"
              startContent={
                <div className="text-gray-400">
                  <svg
                    aria-hidden="true"
                    fill="none"
                    focusable="false"
                    height="1em"
                    role="presentation"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="1em"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" x2="16.65" y1="21" y2="16.65" />
                  </svg>
                </div>
              }
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin h-8 w-8 border-3 border-current border-t-transparent text-indigo-600 rounded-full mx-auto" />
                <p className="mt-2 text-gray-600">Loading tokens...</p>
              </div>
            ) : !tokens || tokens.length === 0 ? (
              <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500">No tokens found in your wallet</p>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500">No tokens match your search</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTokens.map((token) => {
                  const tokenType = getTokenType(token.programId);
                  const styles = getTokenTypeStyles(tokenType);

                  return (
                    <Button
                      key={token.mint}
                      className="h-auto p-3 w-full transition-transform hover:scale-[1.01] active:scale-[0.99]"
                      variant="bordered"
                      onPress={() => handleSelect(token)}
                    >
                      <div className="w-full flex items-center gap-3">
                        <div
                          className={cn(
                            "rounded-full p-2 h-10 w-10 flex items-center justify-center",
                            styles.bg,
                            token.url && "p-0",
                          )}
                        >
                          <span className={`text-lg ${styles.text}`}>
                            {token.url ? (
                              <img
                                alt={token.symbol || "Token Icon"}
                                className="w-full h-full object-cover rounded-full"
                                src={token.url}
                              />
                            ) : (
                              styles.icon
                            )}
                          </span>
                        </div>

                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="text-left font-semibold">
                                {token.symbol || "Unknown"}
                              </h4>
                              <p className="text-left text-xs text-gray-500">
                                {token.name || truncateAddress(token.mint)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {Number(token.amount).toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: token.decimals,
                                  },
                                )}
                              </p>
                              <div
                                className={`text-xs px-2 py-0.5 rounded-full inline-block ${styles.bg} ${styles.text}`}
                              >
                                {tokenType}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
