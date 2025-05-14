"use client";

import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

import { TransactionViewer } from "../transaction-viewer";

import TokenSelector from "./TokenSelector";
import FormCard from "./components/FormCard";
import AmountInput from "./components/AmountInput";
import RecipientInput from "./components/RecipientInput";
import FormActions from "./components/FormActions";
import { useTransferForm } from "./hooks/useTransferForm";

export default function TransferForm() {
  const queryClient = useQueryClient();
  const {
    selectedToken,
    amount,
    recipient,
    isLoading,
    transactionHash,
    setSelectedToken,
    setAmount,
    setRecipient,
    setMaxAmount,
    clearForm,
    handleSubmit,
    isFormValid,
  } = useTransferForm(queryClient);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <FormCard
        description="Transfer tokens to another wallet with style"
        title="Send Tokens"
        onSubmit={handleSubmit}
      >
        <div className="px-8 space-y-2">
          <TokenSelector
            selectedToken={selectedToken}
            onTokenSelect={setSelectedToken}
          />

          <AmountInput
            amount={amount}
            selectedToken={selectedToken}
            onChange={setAmount}
            onMaxAmount={setMaxAmount}
          />

          <RecipientInput recipient={recipient} onChange={setRecipient} />
        </div>

        <FormActions
          isFormValid={!!isFormValid}
          isLoading={isLoading}
          onReset={clearForm}
        />
      </FormCard>

      {transactionHash && (
        <TransactionViewer
          className="mt-6"
          transactions={{ transferHash: transactionHash }}
        />
      )}
    </motion.div>
  );
}
