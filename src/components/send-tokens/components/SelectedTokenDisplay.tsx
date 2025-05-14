import { cn } from "@heroui/react";

import { getTokenTypeStyles } from "./TokenTypeLabel";
import TokenTypeLabel from "./TokenTypeLabel";

import { WalletToken } from "@/hooks/use-spl-metadata";

interface SelectedTokenDisplayProps {
  token: WalletToken;
}

export default function SelectedTokenDisplay({
  token,
}: SelectedTokenDisplayProps) {
  const styles = getTokenTypeStyles(token.type);

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "rounded-full p-2 size-12 flex items-center justify-center",
          styles.bg,
        )}
      >
        {token.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={token.symbol || "Token Icon"}
            className="size-full object-cover rounded-full"
            src={token.url}
          />
        ) : (
          <span className="text-xl">{styles.icon}</span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-default-900">
          {token.symbol || "Unknown"}{" "}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-sm text-default-500">
            {Number(token.amount).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: token.decimals,
            })}
          </span>
          <TokenTypeLabel className="ml-1" type={token.type} />
        </div>
      </div>
    </div>
  );
}
