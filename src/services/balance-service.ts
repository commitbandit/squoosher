import { AccountLayout } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Rpc } from "@lightprotocol/stateless.js";

export const getSolanaNativeBalance = async ({
  publicKey,
  rpcConnection,
}: {
  publicKey: PublicKey;
  rpcConnection: Rpc;
}): Promise<bigint | null> => {
  try {
    const balance = await rpcConnection.getBalance(publicKey);

    return BigInt(balance);
  } catch (err: unknown) {
    console.error("error fetching Solana native balance", { cause: err });

    return null;
  }
};

export const getSolanaSplBalance = async ({
  publicKey,
  tokenAddress,
  rpcConnection,
}: {
  publicKey: PublicKey;
  tokenAddress: PublicKey;
  rpcConnection: Rpc;
}): Promise<bigint | null> => {
  try {
    const accounts = await rpcConnection.getTokenAccountsByOwner(publicKey, {
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
