import { confirmTx, createRpc } from "@lightprotocol/stateless.js";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

import { DEVNET_RPC_URL } from "@/config";

export const getAirdropSol = async (publicKey: PublicKey) => {
  const connection = createRpc(DEVNET_RPC_URL, DEVNET_RPC_URL, DEVNET_RPC_URL);
  const signature = await connection.requestAirdrop(
    publicKey,
    1 * LAMPORTS_PER_SOL
  );

  await confirmTx(connection, signature);

  return signature;
};
