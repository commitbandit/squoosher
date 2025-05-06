import { createRpc } from "@lightprotocol/stateless.js";
import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  createInitializeMintInstruction,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { SendTransactionOptions } from "@solana/wallet-adapter-base";

import { DEVNET_RPC_URL } from "@/config";

type MintData = {
  publicKey: PublicKey;
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
  publicKey,
  compressAmount,
  decimals,
  signTransaction,
  sendTransaction,
}: MintData) => {
  const mint = Keypair.generate();

  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);
  // Create a compressed token mint

  const mintLamports =
    await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  const instructions = await CompressedTokenProgram.createMint({
    feePayer: publicKey,
    authority: publicKey,
    mint: mint.publicKey,
    decimals,
    freezeAuthority: null,
    rentExemptBalance: mintLamports,
  });

  const messageV0 = new TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    instructions,
  }).compileToV0Message();

  const mintTransaction = new VersionedTransaction(messageV0);

  const signedTransaction = await signTransaction(mintTransaction);

  console.log(`Signed transaction: ${signedTransaction}`);

  const transaction = new Transaction().add(
    await CompressedTokenProgram.mintTo({
      feePayer: publicKey,
      mint: mint.publicKey,
      authority: publicKey,
      toPubkey: publicKey,
      amount: compressAmount * 10 ** decimals,
    }),
  );

  //sign and send transaction
  const transactionSignature = await sendTransaction(transaction, connection);

  console.log(`Create compressed mint success! txId: ${transactionSignature}`);

  return {
    mint,
    transactionSignature,
    decimals,
  };
};

export const webRegularMintSplToken = async ({
  publicKey,
  compressAmount,
  decimals,
  sendTransaction,
}: MintData) => {
  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);

  const mint = Keypair.generate();
  const mintLamports =
    await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  const transaction = new Transaction();

  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports: mintLamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mint.publicKey,
      0,
      publicKey,
      publicKey,
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
    publicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  transaction.add(
    createAssociatedTokenAccountInstruction(
      publicKey,
      associatedToken,
      publicKey,
      mint.publicKey,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    createMintToInstruction(
      mint.publicKey,
      associatedToken,
      publicKey,
      compressAmount * 10 ** decimals,
    ),
  );

  const associatedTokenSignature = await sendTransaction(
    transaction,
    connection,
  );

  return {
    mint,
    transactions: { mintSignature, associatedTokenSignature },
    decimals,
  };
};
