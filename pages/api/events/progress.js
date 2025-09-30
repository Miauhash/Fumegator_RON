// pages/api/events/progress.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { wallet, eventId, progressAmount } = req.body;

  if (!wallet || !eventId || progressAmount == null || progressAmount <= 0) {
    return res.status(400).json({ error: 'Missing required or invalid fields' });
  }

  try {
    // --- ETAPA DE VERIFICAÇÃO (ANTES DA TRANSAÇÃO) ---
    // 1. Pega o evento para saber qual token deduzir.
    const event = await prisma.globalEvent.findUnique({ where: { id: eventId } });
    if (!event) {
        return res.status(404).json({ error: "Event not found." });
    }
    const tokenToDeduct = event.targetToken;

    // 2. Pega o estado atual do jogador.
    const gameState = await prisma.gameState.findUnique({ where: { wallet } });
    if (!gameState) {
        return res.status(404).json({ error: "Player state not found." });
    }

    // 3. Verifica se o jogador tem saldo suficiente.
    const playerBalances = gameState.state.balances || {};
    const playerBalance = playerBalances[tokenToDeduct] || 0;
    if (playerBalance < progressAmount) {
        return res.status(400).json({ error: "Insufficient balance to contribute." });
    }

    // --- ETAPA DE TRANSAÇÃO (TUDO OU NADA) ---
    // O Prisma garante que todas as 3 operações abaixo aconteçam, ou nenhuma delas.
    await prisma.$transaction([
      // A. DEDUZ O SALDO DO JOGADOR
      prisma.gameState.update({
        where: { wallet },
        data: {
          state: {
            ...gameState.state,
            balances: {
              ...gameState.state.balances,
              [tokenToDeduct]: playerBalance - progressAmount,
            },
          },
        },
      }),

      // B. CRIA O REGISTRO DE CONTRIBUIÇÃO
      prisma.eventContribution.create({
        data: {
          userWallet: wallet,
          eventId: eventId,
          amount: progressAmount,
        },
      }),
      
      // C. ATUALIZA O TOTAL DO EVENTO GLOBAL
      prisma.globalEvent.update({
        where: { id: eventId },
        data: {
          currentAmount: { increment: progressAmount },
        },
      }),
    ]);
    
    res.status(200).json({ success: true, message: 'Contribution successful!' });

  } catch (error) {
    console.error('API Error updating progress:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}