// pages/api/ranking/get.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const topPlayers = await prisma.playerStat.findMany({
      take: 20, // Pega os 20 melhores
      orderBy: [
        { totalTokensProduced: 'desc' },
        { maxLevelReached: 'desc' },
      ],
      select: {
        userWallet: true,
        totalTokensProduced: true,
        maxLevelReached: true,
      },
    });
    res.status(200).json(topPlayers);
  } catch (error) {
    console.error("Erro ao buscar o ranking:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
}