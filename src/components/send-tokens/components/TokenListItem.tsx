import { Button } from "@heroui/button";
import { cn } from "@heroui/react";

import { getTokenTypeStyles } from "./TokenTypeLabel";

import { TokenType, WalletToken } from "@/hooks/use-spl-metadata";
import { truncateAddress } from "@/utils/string";

interface TokenListItemProps {
  token: WalletToken;
  isSelected: boolean;
  onSelect: (token: WalletToken) => void;
}

export default function TokenListItem({
  token,
  isSelected,
  onSelect,
}: TokenListItemProps) {
  const styles = getTokenTypeStyles(token.type);
  const isCompressed =
    token.type === TokenType.STANDARD_COMPRESSED ||
    token.type === TokenType.TOKEN_2022_COMPRESSED;

  return (
    <Button
      key={token.mint}
      className={cn(
        "relative h-auto p-3 w-full flex items-center gap-3",
        isSelected
          ? `border-purple-300 bg-purple-50 hover:bg-purple-100`
          : isCompressed
            ? `border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed`
            : `border-gray-100 bg-white hover:bg-gray-50`,
      )}
      isDisabled={isCompressed}
      variant="ghost"
      onPress={() => !isCompressed && onSelect(token)}
    >
      {isCompressed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[30deg] text-xs px-2 py-0.5 rounded-full bg-warning-100 text-warning-700 border border-warning-200">
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
              {Number(token.amount).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: token.decimals,
              })}
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
}
