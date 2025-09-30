// pages/api/roleta/verificar.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)
import { ethers } from 'ethers';

// --- MIGRAÇÃO RONIN: Configurações da Ronin Testnet (Saigon) ---
const RONIN_CLUSTER = process.env.RONIN_CLUSTER || "saigon";
const RPC_URL = RONIN_CLUSTER === 'mainnet'
    ? 'https://api.roninchain.com/rpc'
    : 'https://saigon-testnet.roninchain.com/rpc';

// Criamos uma única instância do provider para reutilização
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

export default async function handler(req, res) {
  // --- MIGRAÇÃO RONIN: O frontend enviará um 'hash' em vez de 'signature' ---
  const { hash } = req.query;

  if (!hash) {
    return res.status(400).json({ error: "O hash da transação é obrigatório" });
  }

  try {
    // --- MIGRAÇÃO RONIN: Usar o provider da Ethers.js para buscar o recibo da transação ---
    const receipt = await provider.getTransactionReceipt(hash);

    // Se o 'receipt' não for nulo e o status for 1, a transação foi bem-sucedida.
    // O status é 0 se a transação falhou (foi revertida).
    // Se o recibo for nulo, a transação ainda não foi minerada.
    const confirmed = !!receipt && receipt.status === 1;

    res.status(200).json({ confirmed });
  } catch (error) {
    // Se a API RPC der um erro (ex: hash inválido), consideramos não confirmado.
    console.warn(`Aviso ao verificar o hash ${hash}:`, error.message);
    res.status(200).json({ confirmed: false });
  }
}