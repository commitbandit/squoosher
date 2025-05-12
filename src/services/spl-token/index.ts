import { Rpc } from "@lightprotocol/stateless.js";
import { createMint, mintTo } from "@lightprotocol/compressed-token";
import {
  mintTo as mintToSpl,
  getOrCreateAssociatedTokenAccount,
  createMint as createMintRegular,
} from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";

import { MintViewData } from "@/types";

type MintData = {
  payer: Keypair;
  mintAmount: number;
  decimals: number;
  rpcConnection: Rpc;
};

export const compressedMintSplToken = async ({
  payer,
  mintAmount,
  decimals,
  rpcConnection,
}: MintData): Promise<MintViewData> => {
  // Create a compressed token mint
  const { mint, transactionSignature: createMintTransactionSignature } =
    await createMint(
      rpcConnection,
      payer,
      payer.publicKey,
      decimals, // Number of decimals
    );

  const mintToTransactionSignature = await mintTo(
    rpcConnection,
    payer,
    mint,
    payer.publicKey,
    payer,
    mintAmount * 10 ** decimals, // Amount
  );

  console.log(
    `Create compressed mint success! txId: ${createMintTransactionSignature}`,
  );

  // // Mint compressed tokens to the payer's account
  // const transferTransactionSignature = await transfer(
  //   connection,
  //   payer,
  //   mint,
  //   mintAmount * 10 ** decimals, // Amount
  //   payer, // Owner
  //   payer.publicKey, // To address
  // );

  return {
    mint,
    transactions: {
      createMintTransactionSignature,
      mintToTransactionSignature,
    },
    decimals,
  };
};

export const regularMintSplToken = async ({
  payer,
  mintAmount,
  decimals,
  rpcConnection,
}: MintData): Promise<MintViewData> => {
  const mint = await createMintRegular(
    rpcConnection,
    payer,
    payer.publicKey,
    payer.publicKey,
    decimals,
  );

  console.log(`Create regular mint success! mint: ${mint.toBase58()}`);

  // Create Associated Token Account
  const ata = await getOrCreateAssociatedTokenAccount(
    rpcConnection,
    payer,
    mint,
    payer.publicKey,
  );

  console.log(`ATA: ${ata.address}`);

  // Mint tokens to the payer's account
  const mintToTransactionSignature = await mintToSpl(
    rpcConnection,
    payer,
    mint,
    ata.address,
    payer,
    mintAmount * 10 ** decimals,
  );

  console.log(`Minted ${mintAmount} tokens using regular approach`);

  return {
    mint,
    transactions: { mintToTransactionSignature },
    decimals,
    ata: ata.address,
  };
};
