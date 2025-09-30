// pages/api/shop/unlock-slot.js (VERSÃO FINAL E CORRIGIDA)

import { loadGameState, saveGameState } from "../../../utils/miningLogic";
import { SLOT_UNLOCK_COSTS } from "../../../components/Game";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userWallet, slotId, currency } = req.body;
  if (!userWallet || !slotId || !currency) {
    return res.status(400).json({ message: 'Missing required parameters.' });
  }

  try {
    const gameState = await loadGameState(userWallet);
    if (!gameState) {
      return res.status(404).json({ message: 'Player state not found. Please refresh the game.' });
    }
    
    const costs = SLOT_UNLOCK_COSTS[slotId];
    if (!costs) {
        return res.status(404).json({ message: 'Unlock cost for this slot not found.' });
    }

    const costAmount = costs[currency.toLowerCase()];
    if (typeof costAmount !== 'number') {
        return res.status(400).json({ message: 'Invalid currency specified.'});
    }

    // A verificação de saldo para INSULINE é feita aqui
    if (currency === 'INSULINE') {
        const userBalance = gameState.balances.INSULINE || 0;
        if (userBalance < costAmount) {
            return res.status(400).json({ message: 'Insufficient INSULINE balance.' });
        }
        gameState.balances.INSULINE -= costAmount;
    }

    if (!gameState.unlockedSlots) {
        gameState.unlockedSlots = {};
    }
    gameState.unlockedSlots[slotId] = true;

    await saveGameState(userWallet, gameState);

    res.status(200).json({ 
        message: `Slot ${slotId} unlocked successfully!`,
        newUnlockedSlots: gameState.unlockedSlots,
        newBalances: gameState.balances,
    });

  } catch (error) {
    console.error(`[API /unlock-slot] Error: ${error.message}`);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
}