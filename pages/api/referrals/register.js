// pages/api/referrals/register.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { referrer, newUser } = req.body;

  if (!referrer || !newUser || referrer === newUser) {
    return res.status(400).json({ error: "Dados de referência inválidos" });
  }

  try {
    // Tenta criar o registro. O @unique no schema impede duplicatas.
    await prisma.referral.create({
      data: {
        referrer: referrer,
        referred: newUser,
      },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    // Se der erro (provavelmente porque o 'referred' já existe),
    // ainda retornamos sucesso para não quebrar o fluxo do novo jogador.
    res.status(200).json({ success: false, message: "Indicação já registrada." });
  }
}