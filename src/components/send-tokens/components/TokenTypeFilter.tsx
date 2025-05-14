import { Button } from "@heroui/button";

import { getTokenTypeStyles } from "./TokenTypeLabel";

import { TokenType } from "@/hooks/use-spl-metadata";

interface TokenTypeFilterProps {
  types: TokenType[];
  activeFilter: TokenType | "ALL";
  onFilterChange: (filter: TokenType | "ALL") => void;
}

export default function TokenTypeFilter({
  types,
  activeFilter,
  onFilterChange,
}: TokenTypeFilterProps) {
  return (
    <>
      <Button
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          activeFilter === "ALL"
            ? "bg-purple-100 text-purple-700 border-2 border-purple-200"
            : "bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-200"
        }`}
        onPress={() => onFilterChange("ALL")}
      >
        All
      </Button>

      {types.map((type) => {
        const styles = getTokenTypeStyles(type);

        return (
          <Button
            key={type}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeFilter === type
                ? `${styles.bg} ${styles.text} border-2 ${styles.border}`
                : "bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-200"
            }`}
            onPress={() => onFilterChange(type)}
          >
            <span className="mr-1">{styles.icon}</span>
            {type}
          </Button>
        );
      })}
    </>
  );
}
