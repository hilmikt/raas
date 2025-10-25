import { formatUnits } from "viem";

export function formatAddress(address?: string | null, size = 4) {
  if (!address) return "";
  const prefix = address.slice(0, size + 2);
  const suffix = address.slice(-size);
  return `${prefix}...${suffix}`;
}

export function formatAmount(
  value: bigint | undefined | null,
  decimals: number,
  precision = 2,
) {
  if (value === undefined || value === null) return "0";
  const formatted = Number(formatUnits(value, decimals));
  return formatted.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
}

export function shortHash(hash?: string | null, size = 6) {
  if (!hash) return "";
  return `${hash.slice(0, size + 2)}...${hash.slice(-size)}`;
}
