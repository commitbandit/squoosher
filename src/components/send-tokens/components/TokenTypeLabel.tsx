import { cn } from "@heroui/react";

import { TokenType } from "@/hooks/use-spl-metadata";

interface TokenTypeLabelProps {
  type: TokenType;
  className?: string;
}

export const getTokenTypeStyles = (type: TokenType) => {
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

export default function TokenTypeLabel({
  type,
  className,
}: TokenTypeLabelProps) {
  const styles = getTokenTypeStyles(type);

  return (
    <span
      className={cn(
        "text-xs px-2 py-0.5 rounded-full",
        styles.bg,
        styles.text,
        className,
      )}
    >
      {type}
    </span>
  );
}
