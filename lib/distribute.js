import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import fs from "fs";
import { TOKENS } from "./tokens";

// conexão
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Wallet do jogo (cofre)
const secret = JSON.parse(fs.readFileSync("C:/solana-keys/game-wallet.json"));
const gameWallet = Keypair.fromSecretKey(new Uint8Array(secret));

/**
 * Distribui tokens para o jogador
 * @param {string} playerAddress - Carteira Phantom do jogador
 * @param {string} tokenSymbol - Qual token (chave do TOKENS, ex: "FUME")
 * @param {number} amount - Quantidade a transferir
 */
export async function distributeTokens(playerAddress, tokenSymbol, amount) {
  try {
    if (!TOKENS[tokenSymbol]) throw new Error(`Token ${tokenSymbol} não existe`);

    const mint = TOKENS[tokenSymbol];
    const playerWallet = new PublicKey(playerAddress);

    // ATA do jogo
    const fromAta = await getOrCreateAssociatedTokenAccount(
      connection,
      gameWallet,
      mint,
      gameWallet.publicKey
    );

    // ATA do jogador
    const toAta = await getOrCreateAssociatedTokenAccount(
      connection,
      gameWallet,
      mint,
      playerWallet
    );

    // Transferir
    const tx = await transfer(
      connection,
      gameWallet,
      fromAta.address,
      toAta.address,
      gameWallet.publicKey,
      amount
    );

    console.log(`✅ Transferido ${amount} ${tokenSymbol} para ${playerAddress} (tx: ${tx})`);
    return tx;
  } catch (err) {
    console.error("❌ Erro na distribuição:", err);
    throw err;
  }
}
