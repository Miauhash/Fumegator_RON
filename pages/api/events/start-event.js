import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  try {
    const lastEvent = await prisma.globalEvent.findFirst({ where: { isActive: true } });
    
    const totalEvents = await prisma.globalEvent.count();
    const lastEventId = lastEvent ? lastEvent.id : totalEvents;
    const nextEventId = (lastEventId % totalEvents) + 1;

    if (lastEvent) {
      await prisma.globalEvent.update({
        where: { id: lastEvent.id },
        data: { isActive: false },
      });
    }

    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()) % 7);
    nextSunday.setHours(23, 59, 59, 999);

    await prisma.globalEvent.update({
      where: { id: nextEventId },
      data: { isActive: true, endsAt: nextSunday, currentAmount: 0 },
    });
    
    // Limpa as contribuições do evento que acabou de ser ativado
    await prisma.eventContribution.deleteMany({
        where: { eventId: nextEventId }
    });

    res.status(200).json({ success: true, message: `Event ${nextEventId} started.` });
  } catch (error) {
    console.error('Error starting weekly event:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}