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

export const webCompressedMintSplToken2022 = async ({
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

  console.log("compressed mint", mint.publicKey.toBase58());

  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    name,
    symbol,
    uri,
    additionalMetadata,
  };

  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);

  const activeStateTrees = await connection.getCachedActiveStateTreeInfo();
  const { tree } = pickRandomTreeAndQueue(activeStateTrees);

  const metadataExtension = TYPE_SIZE + LENGTH_SIZE;

  const metadataLen = pack(metadata).length;

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const mintLamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataExtension + metadataLen,
  );

  const tokenProgramId = TOKEN_2022_PROGRAM_ID;

  //1 MINT
  const [
    createAccountInstruction,
    initializeMintInstruction,
    createTokenPoolIx,
  ] = await CompressedTokenProgram.createMint({
    feePayer: payer,
    authority: payer,
    mint: mint.publicKey,
    decimals,
    freezeAuthority: null,
    rentExemptBalance: mintLamports,
    tokenProgramId,
    mintSize: mintLen,
  });

  const initializeMetadataPointerInstruction =
    createInitializeMetadataPointerInstruction(
      mint.publicKey,
      payer,
      mint.publicKey,
      tokenProgramId,
    );

  const initializeMetadataInstruction = createInitializeInstruction({
    metadata: mint.publicKey,
    updateAuthority: payer,
    mint: mint.publicKey,
    mintAuthority: payer,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    programId: tokenProgramId,
  });

  const createMintTransaction = new Transaction({ feePayer: payer }).add(
    createAccountInstruction,
    initializeMetadataPointerInstruction,
    initializeMintInstruction,
    initializeMetadataInstruction,
    createTokenPoolIx,
  );

  const createMintSimulation = await connection.simulateTransaction(
    createMintTransaction,
  );

  console.log("simulation", createMintSimulation);

  const createMintTransactionSignature = await sendTransaction(
    createMintTransaction,
    connection,
    {
      signers: [mint],
    },
  );

  console.log(
    `createMintTransactionSignature: ${createMintTransactionSignature}`,
  );

  //2 ASSOCIATE TOKEN and MINT TO
  const associatedToken = await getAssociatedTokenAddress(
    mint.publicKey,
    payer,
    false,
    tokenProgramId,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const initializeAssociatedTokenAccountInstruction =
    createAssociatedTokenAccountInstruction(
      payer,
      associatedToken,
      payer,
      mint.publicKey,
      tokenProgramId,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

  const initializeMintToInstruction = createMintToInstruction(
    mint.publicKey,
    associatedToken,
    payer,
    mintAmount * 10 ** decimals,
    [],
    tokenProgramId,
  );

  const mintToTransaction = new Transaction({ feePayer: payer }).add(
    initializeAssociatedTokenAccountInstruction,
    initializeMintToInstruction,
  );

  const mintToSimulation =
    await connection.simulateTransaction(mintToTransaction);

  console.log("mintToSimulation", mintToSimulation);

  const mintToTransactionSignature = await sendTransaction(
    mintToTransaction,
    connection,
  );

  //NOTE: Compress is not working
  //3 COMPRESS
  // const initializeCompressedToken = await CompressedTokenProgram.compress({
  //   payer,
  //   owner: payer,
  //   source: associatedToken,
  //   toAddress: payer,
  //   mint: mint.publicKey,
  //   amount: mintAmount * 10 ** decimals,
  //   tokenProgramId,
  //   outputStateTree: tree,
  // });

  // const compressTransaction = new Transaction({ feePayer: payer }).add(
  //   initializeCompressedToken,
  // );

  // const compressSimulation =
  //   await connection.simulateTransaction(compressTransaction);

  // console.log("compressSimulation", compressSimulation);

  // const compressTransactionSignature = await sendTransaction(
  //   compressTransaction,
  //   connection,
  // );

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

export const webRegularMintSplToken2022 = async ({
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

  console.log("regular mint", mint.publicKey.toBase58());

  const metadata: TokenMetadata = {
    updateAuthority: payer,
    mint: mint.publicKey,
    name,
    symbol,
    uri,
    additionalMetadata,
  };

  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);

  const metadataExtension = TYPE_SIZE + LENGTH_SIZE;

  const metadataLen = pack(metadata).length;

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const mintLamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataExtension + metadataLen,
  );

  const programId = TOKEN_2022_PROGRAM_ID;

  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: mint.publicKey,
    space: mintLen,
    lamports: mintLamports,
    programId,
  });

  const initializeMetadataPointerInstruction =
    createInitializeMetadataPointerInstruction(
      mint.publicKey,
      payer,
      mint.publicKey,
      programId,
    );

  const initializeMintInstruction = createInitializeMintInstruction(
    mint.publicKey,
    decimals,
    payer,
    null,
    programId,
  );

  const initializeMetadataInstruction = createInitializeInstruction({
    metadata: mint.publicKey,
    updateAuthority: payer,
    mint: mint.publicKey,
    mintAuthority: payer,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    programId,
  });

  const createMintTransaction = new Transaction({ feePayer: payer }).add(
    createAccountInstruction,
    initializeMetadataPointerInstruction,
    // note: the above instructions are required before initializing the mint
    initializeMintInstruction,
    initializeMetadataInstruction,
  );

  const createMintSimulation = await connection.simulateTransaction(
    createMintTransaction,
  );

  console.log("createMintSimulation", createMintSimulation);

  const createMintTransactionSignature = await sendTransaction(
    createMintTransaction,
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
    programId,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  console.log(`ATA: ${associatedToken}`);

  const initializeAssociatedTokenAccountInstruction =
    createAssociatedTokenAccountInstruction(
      payer,
      associatedToken,
      payer,
      mint.publicKey,
      programId,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

  const initializeMintToInstruction = createMintToInstruction(
    mint.publicKey,
    associatedToken,
    payer,
    mintAmount * 10 ** decimals,
    [],
    programId,
  );

  const mintToTransaction = new Transaction({ feePayer: payer }).add(
    initializeAssociatedTokenAccountInstruction,
    initializeMintToInstruction,
  );

  const mintToSimulation =
    await connection.simulateTransaction(mintToTransaction);

  console.log("mintToTransactionSimulation", mintToSimulation);

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
