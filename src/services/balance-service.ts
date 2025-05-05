import { AccountLayout } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

import { DEVNET_RPC_URL } from "@/config";

export const getSolanaNativeBalance = async ({
  publicKey,
  rpcUrl = DEVNET_RPC_URL,
}: {
  publicKey: PublicKey;
  rpcUrl?: string;
}): Promise<bigint | null> => {
  try {
    const connection = new Connection(rpcUrl, "confirmed");
    const balance = await connection.getBalance(publicKey);

    return BigInt(balance);
  } catch (err: unknown) {
    console.error("error fetching Solana native balance", { cause: err });

    return null;
  }
};

export const getSolanaSplBalance = async ({
  publicKey,
  tokenAddress,
  rpcUrl = DEVNET_RPC_URL,
}: {
  publicKey: PublicKey;
  tokenAddress: PublicKey;
  rpcUrl?: string;
}): Promise<bigint | null> => {
  try {
    //TODO: or devnet, devnet, devnet
    const connection = new Connection(rpcUrl, "confirmed");

    const accounts = await connection.getTokenAccountsByOwner(publicKey, {
      mint: tokenAddress,
    });

    // Sum up all token accounts' balances (usually there's just one)
    const balance = accounts.value.reduce((total, accountInfo) => {
      const decoded = AccountLayout.decode(accountInfo.account.data);

      return total + BigInt(decoded.amount.toString());
    }, 0n);

    return balance;
  } catch (err: unknown) {
    console.error("error fetching Solana SPL token balance", { cause: err });

    return null;
  }
};
