import { Input } from "@heroui/input";

interface RecipientInputProps {
  recipient: string;
  onChange: (value: string) => void;
}

export default function RecipientInput({
  recipient,
  onChange,
}: RecipientInputProps) {
  return (
    <div>
      <label
        className="block text-base font-semibold mb-3"
        htmlFor="recipient-input"
      >
        Recipient Address
      </label>
      <Input
        isRequired
        classNames={{
          base: "mb-2",
          label: "text-default-700 font-semibold",
        }}
        description="Enter the Solana wallet address of the recipient"
        id="recipient-input"
        labelPlacement="outside"
        placeholder="Solana wallet address"
        startContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-base">👤</span>
          </div>
        }
        type="text"
        validate={(value) => {
          if (!value) return "Recipient address is required";
          if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value))
            return "Invalid Solana wallet address";

          return null;
        }}
        value={recipient}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
