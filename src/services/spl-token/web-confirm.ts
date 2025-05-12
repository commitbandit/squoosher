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
  mintAmount: number;
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
  mintAmount,
  decimals,
  sendTransaction,
}: MintData): Promise<MintViewData> => {
  const mint = Keypair.generate();

  console.log("mint", mint.publicKey.toBase58());

  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);

  const mintLamports =
    await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  const createMintTransaction = new Transaction({ feePayer: payer }).add(
    ...(await CompressedTokenProgram.createMint({
      feePayer: payer,
      authority: payer,
      mint: mint.publicKey,
      decimals,
      freezeAuthority: null,
      rentExemptBalance: mintLamports,
    })),
  );

  const createMintTransactionSimulation = await connection.simulateTransaction(
    createMintTransaction,
  );

  console.log(
    "createMintTransactionSimulation",
    createMintTransactionSimulation,
  );

  const createMintTransactionSignature = await sendTransaction(
    createMintTransaction,
    connection,
    {
      signers: [mint],
    },
  );

  console.log("create mint success! txId: ", createMintTransaction);

  const mintToTransaction = new Transaction({ feePayer: payer }).add(
    await CompressedTokenProgram.mintTo({
      feePayer: payer,
      mint: mint.publicKey,
      authority: payer,
      toPubkey: payer,
      amount: mintAmount * 10 ** decimals,
    }),
  );

  const mintToTransactionSimulation =
    await connection.simulateTransaction(mintToTransaction);

  console.log("mintToTransactionSimulation", mintToTransactionSimulation);

  const mintToTransactionSignature = await sendTransaction(
    mintToTransaction,
    connection,
  );

  console.log(`Mint to success! txId: ${mintToTransactionSignature}`);

  return {
    mint: mint.publicKey,
    transactions: {
      createMintTransactionSignature,
      mintToTransactionSignature,
    },
    decimals,
  };
};

export const webRegularMintSplToken = async ({
  payer,
  mintAmount,
  decimals,
  sendTransaction,
}: MintData): Promise<MintViewData> => {
  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);

  const mint = Keypair.generate();

  console.log("mint", mint.publicKey.toBase58());

  const mintLamports =
    await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  const mintTransaction = new Transaction({ feePayer: payer }).add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports: mintLamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mint.publicKey,
      decimals,
      payer,
      payer,
      TOKEN_PROGRAM_ID,
    ),
  );

  console.log(
    `Create regular mint success! mint: ${mint.publicKey.toBase58()}`,
  );

  const mintSignature = await sendTransaction(mintTransaction, connection, {
    signers: [mint],
  });

  const associatedToken = await getAssociatedTokenAddress(
    mint.publicKey,
    payer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const associatedTokenTransaction = new Transaction({ feePayer: payer }).add(
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
      mintAmount * 10 ** decimals,
    ),
  );

  const associatedTokenSignature = await sendTransaction(
    associatedTokenTransaction,
    connection,
  );

  return {
    mint: mint.publicKey,
    transactions: { mintSignature, associatedTokenSignature },
    decimals,
  };
};
