import {
  Rpc,
  transfer as transferLightProtocol,
} from "@lightprotocol/stateless.js";
import {
  transfer as transferSpl,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";

type MintData = {
  tokenAddress: PublicKey;
  payer: Keypair;
  recipient: PublicKey;
  mintAmount: number;
  decimals: number;
  rpcConnection: Rpc;
};

export const compressedTransferSplToken = async ({
  // tokenAddress,
  payer,
  recipient,
  mintAmount,
  decimals,
  rpcConnection,
}: MintData): Promise<string> => {
  //TODO: getOrCreateAssociatedTokenAccount ata for compressed token address??
  //TODO: where is the compressed token address?
  const transferTransactionSignature = await transferLightProtocol(
    rpcConnection, // rpc
    payer, // payer
    mintAmount * 10 ** decimals, // amount
    payer, // owner
    recipient, // toAddress
  );

  console.log(`Transferred ${mintAmount} tokens using compressed approach`);

  return transferTransactionSignature;
};

export const regularTransferSplToken = async ({
  payer,
  recipient,
  mintAmount,
  decimals,
  rpcConnection,
  tokenAddress,
}: MintData): Promise<string> => {
  const ata = await getOrCreateAssociatedTokenAccount(
    rpcConnection,
    payer,
    tokenAddress,
    payer.publicKey,
  );

  console.log(`source ATA: ${ata.address}`);

  const destinationAta = await getOrCreateAssociatedTokenAccount(
    rpcConnection,
    payer,
    tokenAddress,
    recipient,
  );

  console.log(`destination ATA: ${destinationAta.address}`);

  const transferTransactionSignature = await transferSpl(
    rpcConnection, // connection
    payer, // payer
    ata.address, // source
    destinationAta.address, // destination
    payer.publicKey, // owner
    mintAmount * 10 ** decimals, // amount
    [], // multiSigners
  );

  console.log(`Transferred ${mintAmount} tokens using regular approach`);

  return transferTransactionSignature;
};

//TODO: transfer spl token 2022
