import {
  Keypair,
  VersionedTransaction,
  TransactionMessage,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  pickRandomTreeAndQueue,
  Rpc,
  sendAndConfirmTx,
} from "@lightprotocol/stateless.js";
import {
  CompressedTokenProgram,
  compress,
} from "@lightprotocol/compressed-token";
import {
  mintTo as mintToSpl,
  getOrCreateAssociatedTokenAccount,
  ExtensionType,
  TYPE_SIZE,
  LENGTH_SIZE,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";

import { MintViewData } from "@/types";

type MintData = {
  mintAmount: number;
  decimals: number;
  name: string;
  symbol: string;
  uri: string;
  additionalMetadata: [string, string][];
  payer: Keypair;
  rpcConnection: Rpc;
};

export const compressedMintSplToken2022 = async ({
  mintAmount,
  decimals,
  name,
  symbol,
  uri,
  additionalMetadata,
  payer,
  rpcConnection,
}: MintData): Promise<MintViewData> => {
  const mint = Keypair.generate();

  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    name,
    symbol,
    uri,
    additionalMetadata,
  };

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  const activeStateTrees = await rpcConnection.getCachedActiveStateTreeInfo();
  const { tree } = pickRandomTreeAndQueue(activeStateTrees);

  const mintLamports = await rpcConnection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen,
  );

  const tokenProgramId = TOKEN_2022_PROGRAM_ID;

  const [createMintAccountIx, initializeMintIx, createTokenPoolIx] =
    await CompressedTokenProgram.createMint({
      feePayer: payer.publicKey,
      authority: payer.publicKey,
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
      payer.publicKey,
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
      mintAuthority: payer.publicKey,
      updateAuthority: payer.publicKey,
    }),
    createTokenPoolIx,
  ];

  const messageV0 = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: (await rpcConnection.getLatestBlockhash()).blockhash,
    instructions,
  }).compileToV0Message();

  const mintTransaction = new VersionedTransaction(messageV0);

  mintTransaction.sign([payer, mint]);

  const createMintTransactionSignature = await sendAndConfirmTx(
    rpcConnection,
    mintTransaction,
  );

  console.log(
    `createMintTransactionSignature: ${createMintTransactionSignature}`,
  );
  const ata = await getOrCreateAssociatedTokenAccount(
    rpcConnection,
    payer,
    mint.publicKey,
    payer.publicKey,
    undefined,
    undefined,
    undefined,
    tokenProgramId,
  );

  console.log(`ATA: ${ata.address}`);
  /// Mint SPL
  const mintToTransactionSignature = await mintToSpl(
    rpcConnection,
    payer,
    mint.publicKey,
    ata.address,
    payer.publicKey,
    mintAmount * 10 ** decimals, // Amount
    undefined,
    undefined,
    tokenProgramId,
  );

  console.log(`mint-spl success! txId: ${mintToTransactionSignature}`);

  const compressedTokenTransactionSignature = await compress(
    rpcConnection,
    payer,
    mint.publicKey,
    mintAmount * 10 ** decimals, // Amount
    payer,
    ata.address,
    payer.publicKey,
    tree,
    undefined,
    tokenProgramId,
  );

  console.log(
    `compressed-token success! txId: ${compressedTokenTransactionSignature}`,
  );

  console.log(`Minted ${mintAmount} tokens using compressed approach`);

  return {
    mint: mint.publicKey,
    transactions: {
      createMintTransactionSignature,
      mintToTransactionSignature,
      compressedTokenTransactionSignature,
    },
    decimals,
    ata: ata.address,
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
  rpcConnection,
}: MintData): Promise<MintViewData> => {
  const mint = Keypair.generate();

  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    name,
    symbol,
    uri,
    additionalMetadata,
  };

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  const mintLamports = await rpcConnection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen,
  );

  const tokenProgramId = TOKEN_2022_PROGRAM_ID;

  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint.publicKey,
      space: mintLen,
      lamports: mintLamports,
      programId: tokenProgramId,
    }),
    createInitializeMetadataPointerInstruction(
      mint.publicKey,
      payer.publicKey,
      mint.publicKey,
      tokenProgramId,
    ),
    createInitializeMintInstruction(
      mint.publicKey,
      decimals,
      payer.publicKey,
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
      mintAuthority: payer.publicKey,
      updateAuthority: payer.publicKey,
    }),
  );

  const createMintTransactionSignature = await sendAndConfirmTransaction(
    rpcConnection,
    mintTransaction,
    [payer, mint],
  );

  console.log(
    `createMintTransactionSignature: ${createMintTransactionSignature}`,
  );
  const ata = await getOrCreateAssociatedTokenAccount(
    rpcConnection,
    payer,
    mint.publicKey,
    payer.publicKey,
    undefined,
    undefined,
    undefined,
    tokenProgramId,
  );

  console.log(`ATA: ${ata.address}`);

  const mintToTransactionSignature = await mintToSpl(
    rpcConnection,
    payer,
    mint.publicKey,
    ata.address,
    payer.publicKey,
    mintAmount * 10 ** decimals, // Amount
    undefined,
    undefined,
    tokenProgramId,
  );

  console.log(`mint-spl success! txId: ${mintToTransactionSignature}`);

  console.log(`Minted ${mintAmount} tokens using compressed approach`);

  return {
    mint: mint.publicKey,
    transactions: {
      createMintTransactionSignature,
      mintToTransactionSignature,
    },
    decimals,
    ata: ata.address,
  };
};
