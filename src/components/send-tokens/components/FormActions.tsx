import { Button } from "@heroui/button";
import { CardFooter } from "@heroui/card";
import { cn } from "@heroui/react";

interface FormActionsProps {
  isLoading: boolean;
  isFormValid: boolean;
  onReset: () => void;
}

export default function FormActions({
  isLoading,
  isFormValid,
  onReset,
}: FormActionsProps) {
  return (
    <CardFooter className="px-8 py-6 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="flex justify-between items-center w-full gap-3">
        <Button
          className="font-semibold transition-transform active:scale-95"
          color="default"
          isDisabled={isLoading}
          radius="lg"
          startContent={<span>↩️</span>}
          type="reset"
          variant="flat"
          onPress={onReset}
        >
          Reset
        </Button>
        <Button
          className={cn(
            "w-full font-bold transition-all duration-300",
            isFormValid ? "" : "bg-gray-200 text-gray-400 cursor-not-allowed",
          )}
          color={isFormValid ? "secondary" : "default"}
          isDisabled={!isFormValid || isLoading}
          isLoading={isLoading}
          radius="lg"
          startContent={
            !isLoading &&
            isFormValid && <span className="text-xl animate-pulse">✨</span>
          }
          type="submit"
          variant={isFormValid ? "flat" : "solid"}
        >
          {isLoading
            ? "Processing..."
            : isFormValid
              ? "Send Tokens"
              : "Complete All Fields"}
        </Button>
      </div>
    </CardFooter>
  );
}
