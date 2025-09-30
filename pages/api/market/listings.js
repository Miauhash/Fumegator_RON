// pages/api/market/listings.js

import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  try {
    const now = new Date();

    // 1. Buscar todos os anúncios que cumprem os critérios de "ativo"
    const activeListings = await prisma.marketListing.findMany({
      where: {
        isActive: true,       // O anúncio deve estar marcado como ativo
        endsAt: {
          gt: now,            // A data de expiração deve ser maior que a data/hora atual
        },
      },
      // Ordena os anúncios para mostrar os mais recentes primeiro
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(activeListings);

  } catch (error) {
    console.error("Erro ao buscar anúncios do mercado:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}