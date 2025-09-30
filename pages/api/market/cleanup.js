// pages/api/market/cleanup.js

import prisma from '../../../lib/prisma';

// Usaremos uma chave secreta separada ou a mesma de admin para proteger este endpoint
const CRON_SECRET = process.env.CRON_SECRET || process.env.ADMIN_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  // 1. Segurança: Apenas o serviço de Cron pode acionar esta API
  const { authorization } = req.headers;
  if (authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const now = new Date();

    // 2. Encontrar todos os anúncios que estão ativos, mas já expiraram
    const expiredListings = await prisma.marketListing.findMany({
      where: {
        isActive: true,
        endsAt: {
          lt: now, // lt = "less than" (menor que)
        },
      },
    });

    if (expiredListings.length === 0) {
      return res.status(200).json({ message: 'Nenhum anúncio expirado para limpar.' });
    }

    // 3. Processar cada anúncio expirado
    for (const listing of expiredListings) {
      // Usamos uma transação para cada anúncio para garantir a devolução segura
      await prisma.$transaction(async (tx) => {
        // A. Buscar o GameState do vendedor
        const sellerGameState = await tx.gameState.findUnique({
          where: { wallet: listing.sellerWallet },
        });

        if (sellerGameState) {
          const sellerState = sellerGameState.state;

          // B. Devolver os tokens ao saldo do vendedor
          sellerState.balances[listing.tokenType] = (sellerState.balances[listing.tokenType] || 0) + listing.amount;

          await tx.gameState.update({
            where: { wallet: listing.sellerWallet },
            data: { state: sellerState },
          });
        }

        // C. Marcar o anúncio como inativo, finalizando o processo
        await tx.marketListing.update({
          where: { id: listing.id },
          data: { isActive: false },
        });
      });
    }

    res.status(200).json({ message: `Limpeza concluída. ${expiredListings.length} anúncios expirados foram processados.` });

  } catch (error) {
    console.error("Erro na limpeza de anúncios do mercado:", error);
    res.status(500).json({ message: 'Erro interno no servidor durante a limpeza.' });
  }
}