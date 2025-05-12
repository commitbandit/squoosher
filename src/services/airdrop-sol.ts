import { confirmTx, Rpc } from "@lightprotocol/stateless.js";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export const getAirdropSol = async (
  publicKey: PublicKey,
  rpcConnection: Rpc,
) => {
  const signature = await rpcConnection.requestAirdrop(
    publicKey,
    1 * LAMPORTS_PER_SOL,
  );

  await confirmTx(rpcConnection, signature);

  return signature;
};
