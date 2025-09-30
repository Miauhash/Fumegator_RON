import prisma from '../../../lib/prisma';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${ADMIN_PASSWORD}`) return res.status(401).json({ message: 'Não autorizado.' });
  if (req.method === 'POST') {
    const { name, description, targetToken, goalAmount, endsAt, rewardItemId, rewardAmount } = req.body;
    if (!name || !description || !targetToken || !goalAmount || !endsAt || !rewardItemId || !rewardAmount) {
      return res.status(400).json({ message: 'Todos os campos do evento são obrigatórios.' });
    }
    await prisma.globalEvent.updateMany({ where: { isActive: true }, data: { isActive: false } });
    const newEvent = await prisma.globalEvent.create({
      data: { name, description, targetToken, rewardItemId, goalAmount: parseFloat(goalAmount), rewardAmount: parseFloat(rewardAmount), endsAt: new Date(endsAt), isActive: true, currentAmount: 0 },
    });
    return res.status(201).json({ message: 'Evento criado com sucesso!', event: newEvent });
  }
}