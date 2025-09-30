// pages/api/nfts/[wallet].js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { wallet } = req.query;
  const walletAddress = wallet.toLowerCase().replace('ronin:', '0x');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  try {
    // Esta é uma consulta de banco de dados super rápida!
    const nfts = await prisma.nft.findMany({
      where: {
        ownerWallet: walletAddress,
      },
    });

    if (!nfts) {
      return res.status(200).json([]); // Retorna uma lista vazia se não encontrar nada
    }

    res.status(200).json(nfts);

  } catch (error) {
    console.error(`[API /api/nfts] Erro ao buscar NFTs para ${walletAddress}:`, error);
    res.status(500).json({ message: 'Erro interno ao buscar NFTs.' });
  }
}