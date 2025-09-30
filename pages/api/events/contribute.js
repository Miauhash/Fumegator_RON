// pages/api/events/contribute.js

import prisma from '../../../lib/prisma'; // Ajuste o caminho se necessário

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  const { wallet, eventId, amount } = req.body;
  const contributionAmount = parseFloat(amount);

  if (!wallet || !eventId || isNaN(contributionAmount) || contributionAmount <= 0) {
    return res.status(400).json({ message: 'Dados inválidos fornecidos.' });
  }

  try {
    // Usamos uma transação para garantir que todas as operações funcionem ou falhem juntas
    const result = await prisma.$transaction(async (tx) => {
      // 1. Encontrar o evento e garantir que ele está ativo
      const event = await tx.globalEvent.findUnique({
        where: { id: eventId },
      });

      if (!event || !event.isActive) {
        throw new Error('Este evento não está ativo.');
      }

      // 2. Encontrar o estado do jogo do usuário para pegar o saldo
      const gameState = await tx.gameState.findUnique({
        where: { wallet: wallet },
      });
      
      if (!gameState) {
        throw new Error('Jogador não encontrado.');
      }
      
      const state = gameState.state; // O Prisma já deve retornar o JSON parseado
      const userBalance = state.balances?.[event.targetToken] || 0;

      if (userBalance < contributionAmount) {
        throw new Error(`Saldo insuficiente de ${event.targetToken}.`);
      }

      // 3. Subtrair o valor do saldo do jogador no JSON
      state.balances[event.targetToken] -= contributionAmount;

      // 4. Atualizar o GameState do jogador com o novo saldo
      await tx.gameState.update({
        where: { wallet: wallet },
        data: { state: state },
      });

      // 5. Adicionar a contribuição ao progresso total do evento
      await tx.globalEvent.update({
        where: { id: eventId },
        data: {
          currentAmount: { increment: contributionAmount },
        },
      });

      // 6. Registrar a contribuição para futuras recompensas
      await tx.eventContribution.create({
        data: {
          userWallet: wallet,
          eventId: eventId,
          amount: contributionAmount,
        },
      });

      return { newBalance: state.balances[event.targetToken] };
    });

    res.status(200).json({ message: 'Contribuição registrada com sucesso!', newBalance: result.newBalance });

  } catch (error) {
    console.error("Erro ao processar contribuição:", error);
    res.status(500).json({ message: error.message || 'Erro interno no servidor.' });
  }
}