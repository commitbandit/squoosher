import {
  Keypair,
  VersionedTransaction,
  SystemProgram,
  Transaction,
  PublicKey,
  TransactionSignature,
  Connection,
} from "@solana/web3.js";
import { createRpc, pickRandomTreeAndQueue } from "@lightprotocol/stateless.js";
import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import {
  ExtensionType,
  TYPE_SIZE,
  LENGTH_SIZE,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";
import { SendTransactionOptions } from "@solana/wallet-adapter-base";

import { DEVNET_RPC_URL } from "@/config";
import { MintViewData } from "@/types";

type MintData = {
  mintAmount: number;
  decimals: number;
  name: string;
  symbol: string;
  uri: string;
  additionalMetadata: [string, string][];
  payer: PublicKey;
  sendTransaction: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendTransactionOptions,
  ) => Promise<TransactionSignature>;
  signTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T,
  ) => Promise<T>;
};

export const compressedMintSplToken2022 = async ({
  mintAmount,
  decimals,
  name,
  symbol,
  uri,
  additionalMetadata,
  payer,
  sendTransaction,
}: MintData): Promise<MintViewData> => {
  const mint = Keypair.generate();

  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    name,
    symbol,
    uri,
    additionalMetadata,
  };

  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  const activeStateTrees = await connection.getCachedActiveStateTreeInfo();
  const { tree } = pickRandomTreeAndQueue(activeStateTrees);

  const mintLamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen,
  );

  const tokenProgramId = TOKEN_2022_PROGRAM_ID;

  const [createMintAccountIx, initializeMintIx, createTokenPoolIx] =
    await CompressedTokenProgram.createMint({
      feePayer: payer,
      authority: payer,
      mint: mint.publicKey,
      decimals,
      freezeAuthority: null,
      rentExemptBalance: mintLamports,
      tokenProgramId,
      mintSize: mintLen,
    });

  const instructions = [
    createMintAccountIx,
    createInitializeMetadataPointerInstruction(
      mint.publicKey,
      payer,
      mint.publicKey,
      tokenProgramId,
    ),
    initializeMintIx,
    createInitializeInstruction({
      programId: tokenProgramId,
      mint: mint.publicKey,
      metadata: mint.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: payer,
      updateAuthority: payer,
    }),
    createTokenPoolIx,
  ];

  const createMintTransactionSignature = await sendTransaction(
    new Transaction().add(...instructions),
    connection,
    {
      signers: [mint],
    },
  );

  console.log(
    `createMintTransactionSignature: ${createMintTransactionSignature}`,
  );

  const associatedToken = await getAssociatedTokenAddress(
    mint.publicKey,
    payer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  //TODO: or separate mint and compress
  const transaction = new Transaction().add(
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
    await CompressedTokenProgram.compress({
      payer,
      owner: payer,
      source: associatedToken,
      toAddress: payer,
      mint: mint.publicKey,
      amount: mintAmount * 10 ** decimals,
      tokenProgramId,
      outputStateTree: tree,
    }),
  );

  const compressedTokenTransactionSignature = await sendTransaction(
    transaction,
    connection,
  );

  return {
    mint: mint.publicKey,
    transactions: {
      createMintTransactionSignature,
      compressedTokenTransactionSignature,
    },
    decimals,
    ata: associatedToken,
  };
};

export const regularMintSplToken2022 = async ({
  mintAmount,
  decimals,
  name,
  symbol,
  uri,
  additionalMetadata,
  payer,
  sendTransaction,
}: MintData): Promise<MintViewData> => {
  const mint = Keypair.generate();

  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    name,
    symbol,
    uri,
    additionalMetadata,
  };

  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  const mintLamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen,
  );

  const tokenProgramId = TOKEN_2022_PROGRAM_ID;

  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint.publicKey,
      space: mintLen,
      lamports: mintLamports,
      programId: tokenProgramId,
    }),
    createInitializeMetadataPointerInstruction(
      mint.publicKey,
      payer,
      mint.publicKey,
      tokenProgramId,
    ),
    createInitializeMintInstruction(
      mint.publicKey,
      decimals,
      payer,
      null,
      tokenProgramId,
    ),
    createInitializeInstruction({
      programId: tokenProgramId,
      mint: mint.publicKey,
      metadata: mint.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: payer,
      updateAuthority: payer,
    }),
  );

  const createMintTransactionSignature = await sendTransaction(
    mintTransaction,
    connection,
    {
      signers: [mint],
    },
  );

  console.log(
    `mint-spl-token-2022 success! txId: ${createMintTransactionSignature}`,
  );
  const associatedToken = await getAssociatedTokenAddress(
    mint.publicKey,
    payer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  console.log(`ATA: ${associatedToken}`);

  const mintToTransaction = new Transaction().add(
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
  const mintToTransactionSignature = await sendTransaction(
    mintToTransaction,
    connection,
  );

  console.log(`mint-spl-token-2022 success! txId: ${mintToTransaction}`);

  return {
    mint: mint.publicKey,
    transactions: {
      createMintTransactionSignature,
      mintToTransactionSignature,
    },
    decimals,
    ata: associatedToken,
  };
};
