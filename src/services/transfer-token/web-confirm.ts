import {
  bn,
  defaultStateTreeLookupTables,
  getLightStateTreeInfo,
  ParsedTokenAccount,
  Rpc,
} from "@lightprotocol/stateless.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { SendTransactionOptions } from "@solana/wallet-adapter-base";
import {
  CompressedTokenProgram,
  selectMinCompressedTokenAccountsForTransfer,
} from "@lightprotocol/compressed-token";
import BN from "bn.js";

import { checkATAExists } from "../checkATAExists";

type MintData = {
  payer: PublicKey;
  recipient: PublicKey;
  transferAmount: number;
  decimals: number;
  mint: PublicKey;
  sendTransaction: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendTransactionOptions,
  ) => Promise<TransactionSignature>;
  rpcConnection: Rpc;
  tokenProgramId: PublicKey;
};

export const webCompressedTransferSplToken = async ({
  payer,
  transferAmount,
  decimals,
  sendTransaction,
  rpcConnection,
  recipient,
  parsedAccount,
}: MintData & { parsedAccount: ParsedTokenAccount }): Promise<string> => {
  const transferAmountBN = new BN(transferAmount * 10 ** decimals);

  const [selectedAccounts] = selectMinCompressedTokenAccountsForTransfer(
    [parsedAccount],
    transferAmountBN,
  );

  const { compressedProof, rootIndices } = await rpcConnection.getValidityProof(
    selectedAccounts.map((account) => bn(account.compressedAccount.hash)),
  );

  //TODO: config for devnet, mainnet
  const stateTreeLookupTables = await getLightStateTreeInfo({
    connection: rpcConnection,
    stateTreeLookupTableAddress:
      defaultStateTreeLookupTables().devnet[0].stateTreeLookupTable,
    nullifyTableAddress: defaultStateTreeLookupTables().devnet[0].nullifyTable,
  });

  const transaction = new Transaction({ feePayer: payer }).add(
    await CompressedTokenProgram.transfer({
      payer,
      toAddress: recipient,
      amount: transferAmountBN,
      inputCompressedTokenAccounts: selectedAccounts,
      outputStateTrees: stateTreeLookupTables.map((table) => table.tree),
      recentValidityProof: compressedProof,
      recentInputStateRootIndices: rootIndices,
    }),
  );

  const transactionSimulation =
    await rpcConnection.simulateTransaction(transaction);

  console.log("transaction simulation", transactionSimulation);

  const transactionSignature = await sendTransaction(
    transaction,
    rpcConnection,
  );

  return transactionSignature;
};

export const webRegularTransferSplToken = async ({
  payer,
  transferAmount,
  decimals,
  sendTransaction,
  rpcConnection,
  recipient,
  mint,
  tokenProgramId,
}: MintData): Promise<string> => {
  const sourceAssociatedToken = await getAssociatedTokenAddress(
    mint,
    payer,
    undefined,
    tokenProgramId,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const { exists: destinationExists, ata: destinationAssociatedToken } =
    await checkATAExists(rpcConnection, mint, recipient, tokenProgramId);

  const transaction = new Transaction({ feePayer: payer });

  if (!destinationExists) {
    console.log("create associated token account instruction");
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        destinationAssociatedToken,
        recipient,
        mint,
        tokenProgramId,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
  }

  transaction.add(
    createTransferInstruction(
      sourceAssociatedToken,
      destinationAssociatedToken,
      payer,
      transferAmount * 10 ** decimals,
      [],
      tokenProgramId,
    ),
  );

  const transactionSimulation =
    await rpcConnection.simulateTransaction(transaction);

  console.log("transaction simulation", transactionSimulation);

  const transactionSignature = await sendTransaction(
    transaction,
    rpcConnection,
  );

  return transactionSignature;
};
