// ERC-20 bem mínimo
export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// Staking por turno (igual ao contrato que te passei)
export const STAKING_ABI = [
  "function startShift()",
  "function endShift()",
  "function pendingRewards(address) view returns (uint256)",
  "function inShift(address) view returns (bool)",
  "function startedAt(address) view returns (uint256)",
];
