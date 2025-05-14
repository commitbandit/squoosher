// TODO: devnet, mainnet
export const getScanTxUrl = (tx: string) => {
  return `https://solscan.io/tx/${tx}?cluster=devnet`;
};

export const getScanAddressUrl = (address: string) => {
  return `https://solscan.io/address/${address}?cluster=devnet`;
};
