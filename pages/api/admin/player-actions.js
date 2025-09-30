// pages/api/admin/player-actions.js
import prisma from '../../../lib/prisma';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido.' });
  if (req.headers.authorization !== `Bearer ${ADMIN_SECRET}`) return res.status(401).json({ message: 'Não autorizado.' });

  const { wallet, actionType, payload } = req.body;
  if (!wallet || !actionType) return res.status(400).json({ message: 'Carteira e tipo de ação são obrigatórios.' });

  try {
    const userGameState = await prisma.gameState.findUnique({ where: { wallet } });
    if (!userGameState) return res.status(404).json({ message: 'Jogador não encontrado.' });

    const state = userGameState.state;

    switch (actionType) {
      case 'GIVE_TOKEN':
        state.balances = state.balances || {};
        state.balances[payload.itemId] = (state.balances[payload.itemId] || 0) + payload.amount;
        break;

      case 'GIVE_ITEM':
        state.inventory = state.inventory || {};
        const itemDefinition = await prisma.shopItem.findUnique({ where: { id: payload.itemId } });
        if (!itemDefinition) return res.status(404).json({ message: `Item com ID '${payload.itemId}' não encontrado na loja.` });
        
        if (state.inventory[payload.itemId]) {
          state.inventory[payload.itemId].quantity += payload.amount;
        } else {
          state.inventory[payload.itemId] = { ...itemDefinition, quantity: payload.amount };
        }
        break;

      case 'SET_SPINS':
        state.freeSpins = payload.amount;
        break;

      case 'RESET_INVENTORY':
        state.inventory = {};
        break;

      default:
        return res.status(400).json({ message: 'Tipo de ação inválido.' });
    }

    await prisma.gameState.update({
      where: { wallet },
      data: { state },
    });

    res.status(200).json({ message: `Ação '${actionType}' executada com sucesso para ${wallet}.` });

  } catch (error) {
    console.error(`Erro ao executar ação para ${wallet}:`, error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}