import { createRpc } from "@lightprotocol/stateless.js";
import { createMint, mintTo } from "@lightprotocol/compressed-token";
import {
  mintTo as mintToSpl,
  getOrCreateAssociatedTokenAccount,
  createMint as createMintRegular,
} from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";

import { DEVNET_RPC_URL } from "@/config";
import { MintViewData } from "@/types";

type MintData = {
  payer: Keypair;
  mintAmount: number;
  decimals: number;
};

export const compressedMintSplToken = async ({
  payer,
  mintAmount,
  decimals,
}: MintData): Promise<MintViewData> => {
  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);
  // Create a compressed token mint
  const { mint, transactionSignature: createMintTransactionSignature } =
    await createMint(
      connection,
      payer,
      payer.publicKey,
      decimals, // Number of decimals
    );

  const mintToTransactionSignature = await mintTo(
    connection,
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
}: MintData): Promise<MintViewData> => {
  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);

  const mint = await createMintRegular(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    decimals,
  );

  console.log(`Create regular mint success! mint: ${mint.toBase58()}`);

  // Create Associated Token Account
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
  );

  console.log(`ATA: ${ata.address}`);

  // Mint tokens to the payer's account
  const mintToTransactionSignature = await mintToSpl(
    connection,
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
