import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const activeEvent = await prisma.globalEvent.findFirst({
      where: {
        isActive: true,
        endsAt: { gt: new Date() },
      },
    });
    
    res.status(200).json({ success: true, event: activeEvent });

  } catch (error) {
    console.error('API Error fetching current event:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}