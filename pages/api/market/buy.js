// pages/api/market/buy.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)

import prisma from '../../../lib/prisma';
import { fetchUserRoninNFTs } from '../../../utils/fetchNfts'; // --- MIGRAÇÃO RONIN: Usar a nova função de busca
import { ethers } from 'ethers';

// --- MIGRAÇÃO RONIN: Mesma lógica de check-access.js ---
const RPC_URL = 'https://saigon-testnet.roninchain.com/rpc';
const REQUIRED_RARITIES_FOR_MARKET = ['Rare', 'Epic', 'Legendary'];

async function hasMarketAccess(wallet) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const nfts = await fetchUserRoninNFTs(wallet, provider);
        const requiredRaritiesLower = REQUIRED_RARITIES_FOR_MARKET.map(r => r.toLowerCase());
        return nfts.some(nft => nft.rarity && requiredRaritiesLower.includes(nft.rarity.toLowerCase()));
    } catch (error) {
        console.error("Falha ao verificar NFTs para acesso ao mercado:", error);
        return false;
    }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  const { buyerWallet, listingId } = req.body;
  if (!buyerWallet || !listingId) {
    return res.status(400).json({ message: 'Dados inválidos para realizar a compra.' });
  }

  // A chamada a hasMarketAccess agora usa a versão da Ronin
  const canAccess = await hasMarketAccess(buyerWallet);
  if (!canAccess) {
    return res.status(403).json({ message: 'Você não tem permissão para comprar no mercado.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const listing = await tx.marketListing.findUnique({ where: { id: listingId } });

      if (!listing) throw new Error('Anúncio não encontrado.');
      if (!listing.isActive) throw new Error('Este anúncio não está mais ativo.');
      // O campo endsAt pode não existir no seu modelo, remova se necessário
      // if (new Date() > new Date(listing.endsAt)) throw new Error('Este anúncio expirou.');
      if (listing.sellerWallet === buyerWallet) throw new Error('Você não pode comprar seu próprio anúncio.');

      const buyerGameState = await tx.gameState.findUnique({ where: { wallet: buyerWallet } });
      if (!buyerGameState) throw new Error('Jogador (comprador) não encontrado.');

      const totalCostInVIDA = listing.amount * listing.pricePerUnitInVIDA;
      
      const buyerState = buyerGameState.state;
      const buyerVIDABalance = buyerState.balances?.['VIDA'] || 0;

      if (buyerVIDABalance < totalCostInVIDA) {
        throw new Error(`Saldo de VIDA insuficiente. Você precisa de ${totalCostInVIDA.toFixed(2)} VIDA.`);
      }

      const sellerGameState = await tx.gameState.findUnique({ where: { wallet: listing.sellerWallet } });
      if (!sellerGameState) throw new Error('Vendedor não encontrado. A transação foi cancelada para sua segurança.');

      const sellerState = sellerGameState.state;

      // Executar a troca de fundos
      buyerState.balances['VIDA'] -= totalCostInVIDA;
      buyerState.balances[listing.tokenType] = (buyerState.balances[listing.tokenType] || 0) + listing.amount;
      sellerState.balances['VIDA'] = (sellerState.balances['VIDA'] || 0) + totalCostInVIDA;

      // Atualizar os GameStates
      await tx.gameState.update({ where: { wallet: buyerWallet }, data: { state: buyerState } });
      await tx.gameState.update({ where: { wallet: listing.sellerWallet }, data: { state: sellerState } });

      // Desativar o anúncio
      return await tx.marketListing.update({
        where: { id: listingId },
        data: { isActive: false },
      });
    });

    res.status(200).json({ message: 'Compra realizada com sucesso!', listing: result });

  } catch (error) {
    console.error("Erro ao comprar item no mercado:", error);
    res.status(400).json({ message: error.message || 'Não foi possível realizar a compra.' });
  }
}