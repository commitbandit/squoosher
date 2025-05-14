import { Rpc } from "@lightprotocol/stateless.js";
import { transfer as transferLightProtocol } from "@lightprotocol/compressed-token";
import {
  transfer as transferSpl,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";

type MintData = {
  mint: PublicKey;
  payer: Keypair;
  recipient: PublicKey;
  transferAmount: number;
  decimals: number;
  rpcConnection: Rpc;
  tokenProgramId: PublicKey;
};

export const compressedTransferSplToken = async ({
  mint,
  payer,
  recipient,
  transferAmount,
  decimals,
  rpcConnection,
  // tokenProgramId,
}: MintData): Promise<string> => {
  // const sourceAta = await getOrCreateAssociatedTokenAccount(
  // rpcConnection, // connection
  // payer, // payer
  // mint, // mint
  // payer.publicKey, // owner
  // undefined, // allowOwnerOffCurve
  // undefined, // commitment
  // undefined, // confirmOptions
  // tokenProgramId, // programId
  // );

  // console.log(`source ATA: ${sourceAta.address}`);

  // const destinationAta = await getOrCreateAssociatedTokenAccount(
  //   rpcConnection, // connection
  //   payer, // payer
  //   mint, // mint
  //   recipient, // owner
  //   undefined, // allowOwnerOffCurve
  //   undefined, // commitment
  //   undefined, // confirmOptions
  //   tokenProgramId, // programId
  // );

  // console.log(`destination ATA: ${destinationAta.address}`);

  const transferTransactionSignature = await transferLightProtocol(
    rpcConnection, // rpc
    payer, // payer
    mint, // mint
    transferAmount * 10 ** decimals, // amount
    payer, // owner
    recipient, // toAddress
  );

  console.log(`Transferred ${transferAmount} tokens using compressed approach`);

  return transferTransactionSignature;
};

export const regularTransferSplToken = async ({
  payer,
  recipient,
  transferAmount,
  decimals,
  rpcConnection,
  mint,
  tokenProgramId,
}: MintData): Promise<string> => {
  const sourceAta = await getOrCreateAssociatedTokenAccount(
    rpcConnection, // connection
    payer, // payer
    mint, // mint
    payer.publicKey, // owner
    undefined, // allowOwnerOffCurve
    undefined, // commitment
    undefined, // confirmOptions
    tokenProgramId, // programId
  );

  console.log(`source ATA: ${sourceAta.address}`);

  const destinationAta = await getOrCreateAssociatedTokenAccount(
    rpcConnection, // connection
    payer, // payer
    mint, // mint
    recipient, // owner
    undefined, // allowOwnerOffCurve
    undefined, // commitment
    undefined, // confirmOptions
    tokenProgramId, // programId
  );

  console.log(`destination ATA: ${destinationAta.address}`);

  const transferTransactionSignature = await transferSpl(
    rpcConnection, // connection
    payer, // payer
    sourceAta.address, // source
    destinationAta.address, // destination
    payer.publicKey, // owner
    transferAmount * 10 ** decimals, // amount
    [], // multiSigners
    undefined, // confirmOptions
    tokenProgramId, // programId
  );

  console.log(`Transferred ${transferAmount} tokens using regular approach`);

  return transferTransactionSignature;
};

//TODO: transfer spl token 2022
