import { useState, useMemo } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { cn } from "@heroui/react";

import { ChevronDownIcon } from "../icons";

import {
  TokenType,
  useSplMetadata,
  WalletToken,
} from "@/hooks/use-spl-metadata";
import { truncateAddress } from "@/utils/string";
import { useCompressedMetadata } from "@/hooks/use-compressed-metadata";
import { useCompressedTokens } from "@/hooks/use-compressed-tokens";
import { useSplTokens } from "@/hooks/use-spl-tokens";

interface TokenSelectorProps {
  onTokenSelect: (token: WalletToken) => void;
  selectedToken?: WalletToken;
}

const getTokenTypeStyles = (type: TokenType) => {
  switch (type) {
    case TokenType.STANDARD:
      return {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: "🪙",
        border: "border-blue-200",
      };
    case TokenType.STANDARD_COMPRESSED:
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "🗜️",
        border: "border-green-200",
      };
    case TokenType.TOKEN_2022:
      return {
        bg: "bg-indigo-100",
        text: "text-indigo-700",
        icon: "⚡",
        border: "border-indigo-200",
      };
    case TokenType.TOKEN_2022_COMPRESSED:
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "🗜️",
        border: "border-green-200",
      };
  }
};

export default function TokenSelector({
  onTokenSelect,
  selectedToken,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TokenType | "ALL">("ALL");

  const { data: splBalances, isLoading: isSplBalancesLoading } = useSplTokens();
  const { data: splTokens } = useSplMetadata(splBalances);

  const { data: compressedBalances } = useCompressedTokens();
  const { data: compressedTokens, isLoading: isCompressedTokensLoading } =
    useCompressedMetadata(compressedBalances);

  const tokens = useMemo(() => {
    return [...(splTokens || []), ...(compressedTokens || [])];
  }, [splTokens, compressedTokens]);
  const isLoading = isSplBalancesLoading || isCompressedTokensLoading;

  const tokenTypes = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];

    const types = new Set<TokenType>();

    tokens.forEach((token) => types.add(token.type));

    return Array.from(types);
  }, [tokens]);

  const filteredTokens = useMemo(() => {
    if (!tokens) return [];

    return tokens
      .filter((token) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          token.name?.toLowerCase().includes(searchLower) ||
          token.symbol?.toLowerCase().includes(searchLower) ||
          token.mint.toLowerCase().includes(searchLower);

        const matchesFilter =
          activeFilter === "ALL" || token.type === activeFilter;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => Number(b.amount) - Number(a.amount));
  }, [tokens, searchQuery, activeFilter]);

  const handleSelect = (token: WalletToken) => {
    onTokenSelect(token);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        className={cn(
          "w-full justify-between px-4 py-3 h-auto border-2 text-left rounded-xl shadow-sm transition-all duration-200 border-default-200 bg-white hover:bg-default-50",
        )}
        variant="bordered"
        onPress={() => setIsOpen(true)}
      >
        {selectedToken ? (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-full p-2 size-12 flex items-center justify-center",
                getTokenTypeStyles(selectedToken.type).bg,
              )}
            >
              {selectedToken.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={selectedToken.symbol || "Token Icon"}
                  className="size-full object-cover rounded-full"
                  src={selectedToken.url}
                />
              ) : (
                <span className="text-xl">
                  {getTokenTypeStyles(selectedToken.type).icon}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-default-900">
                {selectedToken.symbol || "Unknown"}{" "}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-default-500">
                  {Number(selectedToken.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: selectedToken.decimals,
                  })}
                </span>
                <span
                  className={cn(
                    "ml-1 text-xs px-1.5 py-0.5 rounded-full",
                    getTokenTypeStyles(selectedToken.type).bg,
                    getTokenTypeStyles(selectedToken.type).text,
                  )}
                >
                  {selectedToken.type}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gray-100 p-2 size-10 flex items-center justify-center">
              <span className="text-lg">🔍</span>
            </div>
            <span className="text-gray-500 font-medium">Select Token</span>
          </div>
        )}
        <div className="bg-default-100 rounded-full p-1.5">
          <ChevronDownIcon className="text-default-600" size={20} />
        </div>
      </Button>

      <Modal
        classNames={{
          base: "max-w-md mx-auto rounded-3xl",
        }}
        id="token-selector-modal"
        isOpen={isOpen}
        placement="center"
        scrollBehavior="inside"
        onClose={() => setIsOpen(false)}
      >
        <ModalContent className="max-w-md">
          <ModalHeader className="flex flex-col gap-1 pb-0">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
              Select Token
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                className="mb-2"
                classNames={{
                  inputWrapper:
                    "shadow-md bg-white border-2 border-purple-100 hover:border-purple-200 focus-within:!border-purple-400 rounded-xl",
                  input: "font-medium",
                }}
                placeholder="Search by name, symbol, or address"
                startContent={
                  <div className="text-purple-400">
                    <svg
                      aria-hidden="true"
                      fill="none"
                      focusable="false"
                      height="1em"
                      role="presentation"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
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

              {tokenTypes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeFilter === "ALL"
                        ? "bg-purple-100 text-purple-700 border-2 border-purple-200"
                        : "bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-200"
                    }`}
                    onPress={() => setActiveFilter("ALL")}
                  >
                    All
                  </Button>

                  {tokenTypes.map((type) => {
                    const styles = getTokenTypeStyles(type);

                    return (
                      <Button
                        key={type}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          activeFilter === type
                            ? `${styles.bg} ${styles.text} border-2 ${styles.border}`
                            : "bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-200"
                        }`}
                        onPress={() => setActiveFilter(type)}
                      >
                        <span className="mr-1">{styles.icon}</span>
                        {type}
                      </Button>
                    );
                  })}
                </div>
              )}

              {isLoading ? (
                <div className="p-10 text-center">
                  <div className="animate-spin h-10 w-10 border-4 border-current border-t-transparent text-purple-600 rounded-full mx-auto" />
                  <p className="mt-4 text-gray-600 font-medium">
                    Discovering your tokens...
                  </p>
                </div>
              ) : !tokens || tokens.length === 0 ? (
                <div className="text-center p-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <div className="text-4xl mb-2">😢</div>
                  <p className="text-gray-500 font-medium">
                    No tokens found in your wallet
                  </p>
                </div>
              ) : filteredTokens.length === 0 ? (
                <div className="text-center p-10 border-2 border-dashed border-purple-100 rounded-xl bg-purple-50">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-purple-500 font-medium">
                    No tokens match your search
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTokens.map((token) => {
                    const styles = getTokenTypeStyles(token.type);
                    const isCompressed =
                      token.type === TokenType.STANDARD_COMPRESSED ||
                      token.type === TokenType.TOKEN_2022_COMPRESSED;

                    return (
                      <Button
                        key={token.mint}
                        className={cn(
                          "relative h-auto p-3 w-full flex items-center gap-3",
                          selectedToken?.mint === token.mint
                            ? `border-purple-300 bg-purple-50 hover:bg-purple-100`
                            : isCompressed
                              ? `border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed`
                              : `border-gray-100 bg-white hover:bg-gray-50`,
                        )}
                        isDisabled={isCompressed}
                        variant="ghost"
                        onPress={() => !isCompressed && handleSelect(token)}
                      >
                        {isCompressed && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2  -translate-y-1/2 rotate-[30deg] text-xs px-2 py-0.5 rounded-full bg-warning-100 text-warning-700 border border-warning-200">
                            Coming Soon
                          </div>
                        )}
                        <div
                          className={cn(
                            "rounded-full p-2 size-12 flex items-center justify-center",
                            styles.bg,
                            token.url && "p-0",
                          )}
                        >
                          <span className={`text-xl ${styles.text}`}>
                            {token.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
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
                                {token.type}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
