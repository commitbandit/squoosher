import { createRpc } from "@lightprotocol/stateless.js";
import { createMint, mintTo, transfer } from "@lightprotocol/compressed-token";
import {
  mintTo as mintToSpl,
  getOrCreateAssociatedTokenAccount,
  createMint as createMintRegular,
} from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";

import { DEVNET_RPC_URL } from "@/config";

type MintData = {
  payer: Keypair;
  compressAmount: number;
  decimals: number;
};

export const compressedMintSplToken = async ({
  payer,
  compressAmount,
  decimals,
}: MintData) => {
  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);
  // Create a compressed token mint
  const { mint, transactionSignature } = await createMint(
    connection,
    payer,
    payer.publicKey,
    decimals, // Number of decimals
  );

  const mintToTxId = await mintTo(
    connection,
    payer,
    mint,
    payer.publicKey,
    payer,
    compressAmount * 10 ** decimals, // Amount
  );

  console.log(`Create compressed mint success! txId: ${transactionSignature}`);

  // Mint compressed tokens to the payer's account
  const transferTxId = await transfer(
    connection,
    payer,
    mint,
    compressAmount * 10 ** decimals, // Amount
    payer, // Owner
    payer.publicKey, // To address
  );

  console.log(`Minted ${compressAmount} tokens using compressed approach`);

  return {
    mint,
    transactionSignature,
    decimals,
    mintToTxId,
    transferTxId,
  };
};

export const regularMintSplToken = async ({
  payer,
  compressAmount,
  decimals,
}: MintData) => {
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
  const transactionSignature = await mintToSpl(
    connection,
    payer,
    mint,
    ata.address,
    payer,
    compressAmount * 10 ** decimals,
  );

  console.log(`Minted ${compressAmount} tokens using regular approach`);

  return {
    mint,
    transactionSignature,
    decimals,
    ata,
  };
};
