// pages/api/shop/buy-item.js (VERSÃO FINAL OFF-CHAIN SEGURA)

import { loadGameState, saveGameState } from "../../../utils/miningLogic";
import { getShopItems } from "../../../components/Shop";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userWallet, itemId } = req.body;
  if (!userWallet || !itemId) {
    return res.status(400).json({ message: 'Missing user wallet or item ID.' });
  }

  try {
    const gameState = await loadGameState(userWallet);
    if (!gameState) {
      return res.status(404).json({ message: 'Player state not found.' });
    }

    const allItems = getShopItems('en'); // A língua não importa para os dados
    const itemToBuy = allItems.find(item => item.id === itemId);

    if (!itemToBuy) {
      return res.status(404).json({ message: 'Item not found in shop.' });
    }

    // A VERIFICAÇÃO DE SEGURANÇA CRUCIAL NO SERVIDOR
    const userBalance = gameState.balances[itemToBuy.currency] || 0;
    if (userBalance < itemToBuy.price) {
      return res.status(400).json({ message: `Insufficient ${itemToBuy.currency} balance.` });
    }

    // Se a verificação passar, o SERVIDOR realiza a transação.
    gameState.balances[itemToBuy.currency] -= itemToBuy.price;
    
    // Adiciona o item ao inventário/buffs
    switch (itemToBuy.type) {
        case 'EQUIPMENT':
            gameState.inventory = gameState.inventory || {};
            const currentItem = gameState.inventory[itemToBuy.id] || { ...itemToBuy, quantity: 0 };
            gameState.inventory[itemToBuy.id] = { ...currentItem, quantity: currentItem.quantity + 1 };
            break;
        case 'PERMANENT_BUFF':
            gameState.permanentBuffs = gameState.permanentBuffs || {};
            gameState.permanentBuffs[itemToBuy.buffName] = true;
            break;
        case 'TIMED_BUFF':
            gameState.activeBuffs = gameState.activeBuffs || {};
            const now = Date.now();
            gameState.activeBuffs[itemToBuy.buffName] = Math.max(gameState.activeBuffs[itemToBuy.buffName] || now, now) + (itemToBuy.duration || 0);
            break;
        case 'INVENTORY':
             if (itemToBuy.itemName === 'freeSpins') {
                gameState.freeSpins = (gameState.freeSpins || 0) + itemToBuy.amount;
            }
            break;
    }

    await saveGameState(userWallet, gameState);

    res.status(200).json({ 
        message: 'Purchase successful!',
        newBalances: gameState.balances,
        newInventory: gameState.inventory,
        newPermanentBuffs: gameState.permanentBuffs,
        newActiveBuffs: gameState.activeBuffs,
        newFreeSpins: gameState.freeSpins
    });

  } catch (error) {
    console.error(`[API /buy-item] Error: ${error.message}`);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
}