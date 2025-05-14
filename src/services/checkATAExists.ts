import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

export const checkATAExists = async (
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  tokenProgramId: PublicKey,
): Promise<{ exists: boolean; ata: PublicKey }> => {
  const ata = await getAssociatedTokenAddress(
    mint,
    owner,
    undefined,
    tokenProgramId,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  try {
    await getAccount(connection, ata);
    console.log("ATA exists:", ata.toBase58());

    return { exists: true, ata };
  } catch (err: any) {
    if (err.name === "TokenAccountNotFoundError") {
      console.log("ATA not found:", ata.toBase58());

      return { exists: false, ata };
    } else {
      throw err;
    }
  }
};
