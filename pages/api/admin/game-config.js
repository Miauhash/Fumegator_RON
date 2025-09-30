import prisma from '../../../lib/prisma';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${ADMIN_PASSWORD}`) return res.status(401).json({ message: 'Não autorizado.' });
  if (req.method === 'GET') {
    const configData = await prisma.gameConfig.findUnique({ where: { id: 1 } });
    return res.status(200).json(configData?.config || {});
  }
  if (req.method === 'POST') {
    const { config } = req.body;
    await prisma.gameConfig.upsert({ where: { id: 1 }, update: { config }, create: { id: 1, config } });
    return res.status(200).json({ message: 'Configurações do jogo salvas.' });
  }
}