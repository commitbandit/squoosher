export const trimNumber = (value: number, decimals = 4): string => {
  const parts = value.toString().split(".");

  if (decimals === 0 || parts.length === 1) {
    return parts[0];
  }

  const trimmedFraction = parts[1].substring(0, decimals).replace(/0+$/, "");

  return trimmedFraction ? `${parts[0]}.${trimmedFraction}` : parts[0];
};
