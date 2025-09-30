import prisma from '../../../lib/prisma';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${ADMIN_PASSWORD}`) return res.status(401).json({ message: 'Não autorizado.' });
  if (req.method === 'GET') {
    const items = await prisma.shopItem.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json(items);
  }
  if (req.method === 'POST') {
    const { id, ...data } = req.body;
    data.price = parseFloat(data.price);
    data.isActive = Boolean(data.isActive);
    try { data.buffData = JSON.parse(data.buffData); } catch (e) { data.buffData = {}; }
    const item = id ? await prisma.shopItem.update({ where: { id }, data }) : await prisma.shopItem.create({ data });
    return res.status(200).json(item);
  }
}