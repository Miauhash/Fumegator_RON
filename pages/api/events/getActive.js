// pages/api/events/getActive.js

import prisma from '../../../lib/prisma'; // Ajuste o caminho se necessário

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  try {
    const activeEvent = await prisma.globalEvent.findFirst({
      where: {
        isActive: true,
      },
    });

    if (!activeEvent) {
      return res.status(404).json({ message: 'Nenhum evento global ativo no momento.' });
    }

    res.status(200).json(activeEvent);

  } catch (error) {
    console.error("Erro ao buscar evento ativo:", error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}