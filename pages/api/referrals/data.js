// pages/api/referrals/data.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: "Wallet é obrigatória" });

  try {
    // Conta o total de indicados
    const totalReferrals = await prisma.referral.count({
      where: { referrer: wallet },
    });

    // Conta quantas recompensas ainda não foram coletadas
    const rewardsToClaim = await prisma.referral.count({
      where: { referrer: wallet, claimed: false },
    });

    res.status(200).json({ count: totalReferrals, rewardsToClaim });
  } catch (error) {
    console.error("Erro ao buscar dados de referência:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
}