// pages/api/stats/update.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { wallet, stats } = req.body;
  if (!wallet || !stats) return res.status(400).json({ error: "Dados inválidos." });

  try {
    await prisma.playerStat.upsert({
      where: { userWallet: wallet },
      create: {
        userWallet: wallet,
        totalTokensProduced: stats.totalTokensProduced,
        maxLevelReached: stats.maxLevelReached,
      },
      update: {
        totalTokensProduced: stats.totalTokensProduced,
        maxLevelReached: stats.maxLevelReached,
      },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar estatísticas:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
}