// pages/api/referrals/claim.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: "Wallet é obrigatória" });

  try {
    // Usamos uma transação para garantir que ambas as operações aconteçam ou nenhuma aconteça
    const result = await prisma.$transaction(async (tx) => {
      // 1. Encontra quantas recompensas não foram coletadas
      const rewardsToClaim = await tx.referral.count({
        where: { referrer: wallet, claimed: false },
      });

      if (rewardsToClaim === 0) {
        throw new Error("Nenhuma recompensa para coletar.");
      }

      // 2. Calcula a recompensa: 1 hora (3600 segundos) por indicado
      const rewardInSeconds = rewardsToClaim * 3600;

      // 3. Carrega o estado atual do jogo do jogador
      const user = await tx.gameState.findUnique({ where: { wallet } });
      if (!user) throw new Error("Usuário não encontrado.");
      
      const state = JSON.parse(user.state || '{}');

      // 4. Aplica a recompensa: reduz o tempo de todos os timers ativos
      let timersUpdated = false;
      for (const timerId in state.timers) {
        if (state.timers[timerId] > 0) {
          state.timers[timerId] = Math.max(0, state.timers[timerId] - rewardInSeconds);
          timersUpdated = true;
        }
      }

      if (!timersUpdated) {
        throw new Error("Nenhuma mineração ativa para acelerar. Comece a minerar e colete depois.");
      }

      // 5. Salva o novo estado do jogo
      await tx.gameState.update({
        where: { wallet },
        data: { state: JSON.stringify(state) },
      });

      // 6. Marca as indicações como coletadas
      await tx.referral.updateMany({
        where: { referrer: wallet, claimed: false },
        data: { claimed: true },
      });

      return { claimedAmount: rewardsToClaim };
    });

    res.status(200).json({ success: true, message: `Você coletou ${result.claimedAmount} hora(s) de aceleração!` });

  } catch (error) {
    console.error("Erro ao coletar recompensas:", error);
    res.status(400).json({ success: false, error: error.message });
  }
}