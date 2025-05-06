import {
  Keypair,
  VersionedTransaction,
  TransactionMessage,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import {
  createRpc,
  pickRandomTreeAndQueue,
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

import { DEVNET_RPC_URL } from "@/config";

type MintData = {
  mintAmount: number;
  decimals: number;
  name: string;
  symbol: string;
  uri: string;
  additionalMetadata: [string, string][];
  publicKey: PublicKey;
};

export const compressedMintSplToken2022 = async ({
  mintAmount,
  decimals,
  name,
  symbol,
  uri,
  additionalMetadata,
  publicKey,
}: MintData) => {
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
      feePayer: publicKey,
      authority: publicKey,
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
      publicKey,
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
      mintAuthority: publicKey,
      updateAuthority: publicKey,
    }),
    createTokenPoolIx,
  ];

  const messageV0 = new TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    instructions,
  }).compileToV0Message();

  const mintTransaction = new VersionedTransaction(messageV0);

  mintTransaction.sign([publicKey, mint]);

  const txId = await sendAndConfirmTx(connection, mintTransaction);

  console.log(`txId: ${txId}`);
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
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
  const mintTxId = await mintToSpl(
    connection,
    payer,
    mint.publicKey,
    ata.address,
    payer.publicKey,
    mintAmount * 10 ** decimals, // Amount
    undefined,
    undefined,
    tokenProgramId,
  );

  console.log(`mint-spl success! txId: ${mintTxId}`);

  const compressedTokenTxId = await compress(
    connection,
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

  console.log(`compressed-token success! txId: ${compressedTokenTxId}`);

  console.log(`Minted ${mintAmount} tokens using compressed approach`);

  return {
    ata,
    mint: mint.publicKey,
    mintTxId,
    compressedTokenTxId,
    decimals,
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
}: MintData) => {
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

  const txId = await sendAndConfirmTransaction(connection, mintTransaction, [
    payer,
    mint,
  ]);

  console.log(`txId: ${txId}`);
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint.publicKey,
    payer.publicKey,
    undefined,
    undefined,
    undefined,
    tokenProgramId,
  );

  console.log(`ATA: ${ata.address}`);
  const mintTxId = await mintToSpl(
    connection,
    payer,
    mint.publicKey,
    ata.address,
    payer.publicKey,
    mintAmount * 10 ** decimals, // Amount
    undefined,
    undefined,
    tokenProgramId,
  );

  console.log(`mint-spl success! txId: ${mintTxId}`);

  console.log(`Minted ${mintAmount} tokens using compressed approach`);

  return {
    ata,
    mint: mint.publicKey,
    mintTxId,
    decimals,
  };
};
