import { Rpc } from "@lightprotocol/stateless.js";
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

import { MintViewData } from "@/types";

type MintData = {
  rpcConnection: Rpc;
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
  rpcConnection,
}: MintData): Promise<MintViewData> => {
  const mint = Keypair.generate();

  console.log("mint", mint.publicKey.toBase58());

  const mintLamports =
    await rpcConnection.getMinimumBalanceForRentExemption(MINT_SIZE);

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

  const createMintTransactionSimulation =
    await rpcConnection.simulateTransaction(createMintTransaction);

  console.log(
    "createMintTransactionSimulation",
    createMintTransactionSimulation,
  );

  const createMintTransactionSignature = await sendTransaction(
    createMintTransaction,
    rpcConnection,
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
    await rpcConnection.simulateTransaction(mintToTransaction);

  console.log("mintToTransactionSimulation", mintToTransactionSimulation);

  const mintToTransactionSignature = await sendTransaction(
    mintToTransaction,
    rpcConnection,
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
  rpcConnection,
}: MintData): Promise<MintViewData> => {
  const mint = Keypair.generate();

  console.log("mint", mint.publicKey.toBase58());

  const mintLamports =
    await rpcConnection.getMinimumBalanceForRentExemption(MINT_SIZE);

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

  const mintSignature = await sendTransaction(mintTransaction, rpcConnection, {
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
    rpcConnection,
  );

  return {
    mint: mint.publicKey,
    transactions: { mintSignature, associatedTokenSignature },
    decimals,
  };
};
