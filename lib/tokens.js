import { PublicKey } from "@solana/web3.js";

// Lista de tokens do jogo (seus Mints criados na Devnet)
export const TOKENS = {
  FUME: new PublicKey("7VXeddYi9hbAKpGSrNcBpmrLsXRxErQbkZDXfGNYkNyK"),  // Token principal
  GEM: new PublicKey("ApUc4EfWwYwpeL1MM3ULVJMnd6Yq5p5nHgmVTNFExY9K"),   // Token secundário
  MED: new PublicKey("8be3GQF6BznhxgtraqHEqSKvfzYBJdw6iHuYkaS3Komk"),   // Token premium
  BOX: new PublicKey("3hXo4emN8c76XaFceY9Sy99Dp5zU4BkCkBWhK3CJ5Fu9"),   // Loot box
  EXP: new PublicKey("B12UPE57QRCE58mTHj47AUGeUHHpGqxDvu3oa4DMb82R"),   // XP ou Level
};
