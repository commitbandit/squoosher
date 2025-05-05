import { Keypair, PublicKey } from "@solana/web3.js";

export const generateWalletState = (
  publicKey: PublicKey,
  keypair?: Keypair,
) => {
  return {
    publicKey,
    address: publicKey.toBase58(),
    shortAddress: `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`,
    keypair,
  };
};
