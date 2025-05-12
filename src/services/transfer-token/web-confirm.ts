import { Rpc } from "@lightprotocol/stateless.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { SendTransactionOptions } from "@solana/wallet-adapter-base";

type MintData = {
  payer: PublicKey;
  recipient: PublicKey;
  transferAmount: number;
  decimals: number;
  tokenAddress: PublicKey;
  sendTransaction: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendTransactionOptions,
  ) => Promise<TransactionSignature>;
  rpcConnection: Rpc;
};

//TODO: implement compressed web transfer
export const webCompressedMintSplToken = async (
  props: MintData,
): Promise<string> => {
  console.log("props", props);

  return "";
};

export const webRegularMintSplToken = async ({
  payer,
  transferAmount,
  decimals,
  sendTransaction,
  rpcConnection,
  recipient,
  tokenAddress,
}: MintData): Promise<string> => {
  const sourceAssociatedToken = await getAssociatedTokenAddress(
    tokenAddress,
    payer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const destinationAssociatedToken = await getAssociatedTokenAddress(
    tokenAddress,
    recipient,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const destinationTokenTransaction = new Transaction({ feePayer: payer }).add(
    createAssociatedTokenAccountInstruction(
      payer,
      destinationAssociatedToken,
      payer,
      tokenAddress,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
  );

  await sendTransaction(destinationTokenTransaction, rpcConnection);

  const transferTransaction = new Transaction({ feePayer: payer }).add(
    createTransferInstruction(
      sourceAssociatedToken,
      destinationAssociatedToken,
      payer,
      transferAmount * 10 ** decimals,
    ),
  );

  const transferTransactionSignature = await sendTransaction(
    transferTransaction,
    rpcConnection,
  );

  return transferTransactionSignature;
};

//TODO: implement web transfer spl token 2022
