export const normalizeKey = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

export const truncateAddress = (address: string) => {
  return address.slice(0, 4) + "..." + address.slice(-4);
};
