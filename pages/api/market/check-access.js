// pages/api/market/check-access.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)

import { fetchUserRoninNFTs } from '../../../utils/fetchNfts'; // --- MIGRAÇÃO RONIN: Usar a nova função de busca
import { ethers } from 'ethers';

// --- MIGRAÇÃO RONIN: RPC da Ronin Testnet (Saigon) ---
const RPC_URL = 'https://saigon-testnet.roninchain.com/rpc';
const REQUIRED_RARITIES_FOR_MARKET = ['rare', 'epic', 'legendary'];

// --- MIGRAÇÃO RONIN: Função reescrita para a Ronin ---
async function hasMarketAccess(wallet) {
  try {
    // A conexão agora é feita com um provider da Ethers.js
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    // A nova função buscará os NFTs da carteira na Ronin
    const nfts = await fetchUserRoninNFTs(wallet, provider);
    
    const requiredRaritiesLower = REQUIRED_RARITIES_FOR_MARKET.map(r => r.toLowerCase());
	return nfts.some(nft => nft.rarity && requiredRaritiesLower.includes(nft.rarity.toLowerCase()));
  } catch (error) {
    console.error("Falha ao verificar NFTs para acesso ao mercado:", error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  const { wallet } = req.query;
  if (!wallet) {
    return res.status(400).json({ message: 'A carteira do usuário é obrigatória.' });
  }

  const canAccess = await hasMarketAccess(wallet);
  
  res.status(200).json({ access: canAccess });
}