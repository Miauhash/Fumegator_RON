// pages/api/expeditions/status.js

import prisma from '../../../lib/prisma'; // Ajuste o caminho para o seu prisma client

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  // A carteira do usuário virá como um parâmetro na URL (query parameter)
  // Exemplo: /api/expeditions/status?wallet=SUA_CARTEIRA_AQUI
  const { wallet } = req.query;

  if (!wallet) {
    return res.status(400).json({ message: 'A carteira do usuário é obrigatória.' });
  }

  try {
    // 1. Buscar todas as expedições para a carteira fornecida
    const expeditions = await prisma.expedition.findMany({
      where: {
        userWallet: wallet,
      },
      // Ordena as expedições para mostrar as mais recentes primeiro
      orderBy: {
        startedAt: 'desc',
      },
    });

    // 2. Retorna a lista de expedições encontradas (pode ser uma lista vazia)
    res.status(200).json(expeditions);

  } catch (error)
 {
    console.error('Erro ao buscar status das expedições:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}