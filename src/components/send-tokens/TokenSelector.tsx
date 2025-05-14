import { useState, useMemo } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { cn } from "@heroui/react";

import { ChevronDownIcon } from "../icons";

import TokenListItem from "./components/TokenListItem";
import TokenTypeFilter from "./components/TokenTypeFilter";
import SelectedTokenDisplay from "./components/SelectedTokenDisplay";

import {
  TokenType,
  useSplMetadata,
  WalletToken,
} from "@/hooks/use-spl-metadata";
import { useCompressedMetadata } from "@/hooks/use-compressed-metadata";
import { useCompressedTokens } from "@/hooks/use-compressed-tokens";
import { useSplTokens } from "@/hooks/use-spl-tokens";

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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-10 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-current border-t-transparent text-purple-600 rounded-full mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">
            Discovering your tokens...
          </p>
        </div>
      );
    }

    if (!tokens || tokens.length === 0) {
      return (
        <div className="text-center p-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <div className="text-4xl mb-2">😢</div>
          <p className="text-gray-500 font-medium">
            No tokens found in your wallet
          </p>
        </div>
      );
    }

    if (filteredTokens.length === 0) {
      return (
        <div className="text-center p-10 border-2 border-dashed border-purple-100 rounded-xl bg-purple-50">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-purple-500 font-medium">
            No tokens match your search
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredTokens.map((token) => (
          <TokenListItem
            key={token.mint}
            isSelected={selectedToken?.mint === token.mint}
            token={token}
            onSelect={handleSelect}
          />
        ))}
      </div>
    );
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
          <SelectedTokenDisplay token={selectedToken} />
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
                  <TokenTypeFilter
                    activeFilter={activeFilter}
                    types={tokenTypes}
                    onFilterChange={setActiveFilter}
                  />
                </div>
              )}

              {renderContent()}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
