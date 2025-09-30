// pages/api/expeditions/claim.js

import prisma from '../../../lib/prisma';
import { rateLimiter } from '../../../lib/rate-limiter';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  const { userWallet, expeditionId } = req.body;

  if (!userWallet || !expeditionId) {
    return res.status(400).json({ message: 'Informações incompletas para coletar a recompensa.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const expedition = await tx.expedition.findUnique({
        where: { id: expeditionId },
      });

      if (!expedition) {
        throw new Error('Expedição não encontrada.');
      }
      if (expedition.userWallet !== userWallet) {
        throw new Error('Você não tem permissão para coletar esta expedição.');
      }
      if (expedition.rewardClaimed) {
        throw new Error('A recompensa para esta expedição já foi coletada.');
      }
      if (new Date() < new Date(expedition.endsAt)) {
        throw new Error('A expedição ainda não terminou.');
      }

      const gameState = await tx.gameState.findUnique({
        where: { wallet: userWallet },
      });

      if (!gameState) {
        throw new Error('Estado do jogo não encontrado para este usuário.');
      }

      const state = gameState.state;
      const { rewardToken, rewardAmount } = expedition;

      state.balances[rewardToken] = (state.balances[rewardToken] || 0) + rewardAmount;
      
      await tx.gameState.update({
        where: { wallet: userWallet },
        data: { state: state },
      });

      const updatedExpedition = await tx.expedition.update({
        where: { id: expeditionId },
        data: { rewardClaimed: true },
      });
      
      return { updatedExpedition, rewardToken, rewardAmount };
    });

    res.status(200).json({
      message: `Recompensa de ${result.rewardAmount} ${result.rewardToken} coletada com sucesso!`,
      expedition: result.updatedExpedition,
    });

  } catch (error) {
    console.error('Erro ao coletar recompensa da expedição:', error);
    res.status(400).json({ message: error.message || 'Erro interno no servidor.' });
  }
}

export default rateLimiter(20, 60 * 1000)(handler);