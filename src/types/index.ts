import { PublicKey } from "@solana/web3.js";
import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface MintViewData {
  mint: PublicKey;
  transactions: Record<string, string>;
  decimals: number;
  ata?: PublicKey;
}
