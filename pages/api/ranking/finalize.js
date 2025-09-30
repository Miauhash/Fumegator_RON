import prisma from '../../../lib/prisma';

// Use a mesma variável de ambiente que definimos antes
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  const { authorization } = req.headers;
  if (authorization !== `Bearer ${ADMIN_SECRET_KEY}`) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  try {
    // 1. Buscar os 3 melhores jogadores pelo novo campo 'weeklyScore'
    const topPlayers = await prisma.playerStat.findMany({
      orderBy: {
        weeklyScore: 'desc',
      },
      take: 3,
      where: {
        weeklyScore: {
          gt: 0 // Apenas premia quem pontuou
        }
      }
    });

    if (topPlayers.length === 0) {
      // Também resetamos o score caso ninguém tenha jogado, para limpar a semana
      await prisma.playerStat.updateMany({ data: { weeklyScore: 0 } });
      return res.status(200).json({ message: 'Nenhum jogador pontuou esta semana. Ranking zerado.' });
    }

    // 2. Adicionar a recompensa ao novo modelo 'Inventory'
    const REWARD_ITEM_ID = "SPECIAL_RANKING_NFT_WINNER_S1"; // Use um ID descritivo

    for (const player of topPlayers) {
      await prisma.inventory.upsert({ // 'upsert' é seguro, cria ou atualiza
        where: { userWallet_itemId: { userWallet: player.userWallet, itemId: REWARD_ITEM_ID } },
        update: { quantity: { increment: 1 } }, // Se já tiver, dá mais um
        create: {
          userWallet: player.userWallet,
          itemId: REWARD_ITEM_ID,
          quantity: 1,
        },
      });
    }
    
    // 3. Resetar a pontuação semanal de TODOS os jogadores
    await prisma.playerStat.updateMany({
      data: {
        weeklyScore: 0,
      },
    });

    // 4. Retornar sucesso
    const winnerWallets = topPlayers.map(p => p.userWallet).join(', ');
    res.status(200).json({
      message: `Ranking finalizado! Prêmios enviados para as wallets: ${winnerWallets}. A pontuação semanal foi zerada.`,
    });

  } catch (error) {
    console.error("Erro ao finalizar o ranking:", error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}