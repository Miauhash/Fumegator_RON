// pages/api/admin/players/[wallet].js (NOVO ARQUIVO)
import prisma from '../../../../lib/prisma';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${ADMIN_SECRET}`) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  const { wallet } = req.query;

  try {
    // Buscar dados completos de um jogador
    if (req.method === 'GET') {
      const player = await prisma.gameState.findUnique({ where: { wallet } });
      if (!player) return res.status(404).json({ message: 'Jogador não encontrado.' });
      return res.status(200).json(player);
    }

    // Atualizar/Sobrescrever o estado de um jogador
    if (req.method === 'POST') {
      const { newState } = req.body;
      if (typeof newState !== 'object' || newState === null) {
        return res.status(400).json({ message: 'O novo estado deve ser um objeto JSON válido.' });
      }
      
      const updatedPlayer = await prisma.gameState.update({
        where: { wallet },
        data: { state: newState },
      });
      return res.status(200).json({ message: 'Estado do jogador atualizado com sucesso!', player: updatedPlayer });
    }

    return res.status(405).json({ message: 'Método não permitido.' });

  } catch (error) {
    console.error(`Erro ao gerenciar jogador ${wallet}:`, error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}