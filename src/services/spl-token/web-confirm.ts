import { createRpc } from "@lightprotocol/stateless.js";
import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { SendTransactionOptions } from "@solana/wallet-adapter-base";

import { DEVNET_RPC_URL } from "@/config";
import { MintViewData } from "@/types";

type MintData = {
  payer: PublicKey;
  compressAmount: number;
  decimals: number;
  sendTransaction: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendTransactionOptions,
  ) => Promise<TransactionSignature>;
  signTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T,
  ) => Promise<T>;
};

export const webCompressedMintSplToken = async ({
  payer,
  compressAmount,
  decimals,
  sendTransaction,
}: MintData): Promise<MintViewData> => {
  const mint = Keypair.generate();

  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);
  // Create a compressed token mint

  const mintLamports =
    await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  const transaction = new Transaction().add(
    ...(await CompressedTokenProgram.createMint({
      feePayer: payer,
      authority: payer,
      mint: mint.publicKey,
      decimals,
      freezeAuthority: null,
      rentExemptBalance: mintLamports,
    })),
    await CompressedTokenProgram.mintTo({
      feePayer: payer,
      mint: mint.publicKey,
      authority: payer,
      toPubkey: payer,
      amount: compressAmount * 10 ** decimals,
    }),
  );

  const createMintTransactionSignature = await sendTransaction(
    transaction,
    connection,
    {
      signers: [mint],
    },
  );

  console.log(
    `Create compressed mint success! txId: ${createMintTransactionSignature}`,
  );

  return {
    mint: mint.publicKey,
    transactions: { createMintTransactionSignature },
    decimals,
  };
};

export const webRegularMintSplToken = async ({
  payer,
  compressAmount,
  decimals,
  sendTransaction,
}: MintData): Promise<MintViewData> => {
  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);

  const mint = Keypair.generate();
  const mintLamports =
    await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  const transaction = new Transaction();

  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports: mintLamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mint.publicKey,
      0,
      payer,
      payer,
      TOKEN_PROGRAM_ID,
    ),
  );

  console.log(
    `Create regular mint success! mint: ${mint.publicKey.toBase58()}`,
  );

  const mintSignature = await sendTransaction(transaction, connection, {
    signers: [mint],
  });

  const associatedToken = await getAssociatedTokenAddress(
    mint.publicKey,
    payer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  transaction.add(
    createAssociatedTokenAccountInstruction(
      payer,
      associatedToken,
      payer,
      mint.publicKey,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    createMintToInstruction(
      mint.publicKey,
      associatedToken,
      payer,
      compressAmount * 10 ** decimals,
    ),
  );

  const associatedTokenSignature = await sendTransaction(
    transaction,
    connection,
  );

  return {
    mint: mint.publicKey,
    transactions: { mintSignature, associatedTokenSignature },
    decimals,
  };
};
