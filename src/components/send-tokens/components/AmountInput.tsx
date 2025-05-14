import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { WalletToken } from "@/hooks/use-spl-metadata";

interface AmountInputProps {
  selectedToken?: WalletToken;
  amount: string;
  onChange: (value: string) => void;
  onMaxAmount: () => void;
}

export default function AmountInput({
  selectedToken,
  amount,
  onChange,
  onMaxAmount,
}: AmountInputProps) {
  return (
    <div>
      <label
        className="block text-base font-semibold mb-3"
        htmlFor="amount-input"
      >
        Amount
      </label>
      <div className="relative">
        <Input
          isRequired
          classNames={{
            base: "mb-2",
            label: "text-default-700 font-semibold",
          }}
          description={
            selectedToken
              ? `Balance: ${Number(selectedToken.amount).toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: selectedToken.decimals,
                  },
                )}`
              : "Select a token first"
          }
          endContent={
            selectedToken && (
              <Button
                className="h-6 px-4 w-fit min-w-[auto]"
                color="secondary"
                variant="flat"
                onPress={onMaxAmount}
              >
                MAX
              </Button>
            )
          }
          id="amount-input"
          labelPlacement="outside"
          placeholder="0.00"
          startContent={
            <div className="text-secondary pointer-events-none flex items-center">
              <span className="text-base">💰</span>
            </div>
          }
          type="number"
          validate={(value) => {
            if (!selectedToken) return "Select a token first";
            if (!value) return "Amount is required";
            if (parseFloat(value) <= 0) return "Amount must be greater than 0";
            if (parseFloat(value) > parseFloat(selectedToken.amount))
              return "Amount must be less than or equal to the token balance";

            return null;
          }}
          value={amount}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
