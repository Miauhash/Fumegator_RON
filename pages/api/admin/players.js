// pages/api/admin/players.js (VERSÃO COMPLETA E CORRIGIDA)
import prisma from '../../../lib/prisma';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${ADMIN_SECRET}`) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  // Lida com a busca da lista de todos os jogadores
  if (req.method === 'GET') {
    try {
      const players = await prisma.gameState.findMany({
        select: { wallet: true, isWithdrawalBlocked: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(players);
    } catch (error) {
      console.error("Erro ao buscar jogadores:", error);
      return res.status(500).json({ message: 'Erro interno ao buscar jogadores.' });
    }
  }

  // Lida com o bloqueio/desbloqueio de um jogador
  if (req.method === 'POST') {
    try {
      const { wallet, block } = req.body;
      if (!wallet || typeof block !== 'boolean') {
        return res.status(400).json({ message: 'Dados inválidos.' });
      }
      await prisma.gameState.update({
        where: { wallet },
        data: { isWithdrawalBlocked: block },
      });
      return res.status(200).json({ message: `Saques para ${wallet} foram ${block ? 'bloqueados' : 'desbloqueados'}.` });
    } catch (error) {
      console.error("Erro ao atualizar status do jogador:", error);
      return res.status(500).json({ message: 'Erro interno ao atualizar status.' });
    }
  }

  // Se o método não for GET nem POST, retorna o erro
  return res.status(405).json({ message: 'Método não permitido.' });
}