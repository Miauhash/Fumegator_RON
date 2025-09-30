import prisma from '../../../lib/prisma';

// Defina sua lógica de recompensas aqui
const REWARD_LOGIC = {
  1: { // ID do Evento "Viral Outbreak"
    tiers: [
      { threshold: 5000, rewards: { vida: 200, freeSpins: 5 } },
      { threshold: 2000, rewards: { vida: 50, items: ['accelerator_1h'] } },
      { threshold: 500, rewards: { vida: 10, freeSpins: 1 } },
    ]
  },
  // ... adicione a lógica para os eventos 2 e 3
};

export default async function handler(req, res) {
  try {
    const eventsToEnd = await prisma.globalEvent.findMany({
      where: { isActive: true, endsAt: { lt: new Date() } },
      include: { contributions: true },
    });

    if (eventsToEnd.length === 0) {
      return res.status(200).json({ success: true, message: "No events to end." });
    }

    for (const event of eventsToEnd) {
      const playerTotals = event.contributions.reduce((acc, c) => {
        acc[c.userWallet] = (acc[c.userWallet] || 0) + c.amount;
        return acc;
      }, {});
      
      for (const wallet in playerTotals) {
        const tier = REWARD_LOGIC[event.id]?.tiers.find(t => playerTotals[wallet] >= t.threshold);
        if (tier) {
          const gameState = await prisma.gameState.findUnique({ where: { wallet } });
          if (!gameState) continue;

          const state = gameState.state; // Assumindo que o estado é um objeto JSON
          state.balances = state.balances || {};
          state.balances.VIDA = (state.balances.VIDA || 0) + (tier.rewards.vida || 0);
          state.freeSpins = (state.freeSpins || 0) + (tier.rewards.freeSpins || 0);
          
          await prisma.gameState.update({ where: { wallet }, data: { state } });
        }
      }
      
      await prisma.globalEvent.update({ where: { id: event.id }, data: { isActive: false } });
    }
    res.status(200).json({ success: true, message: "Events ended and rewards distributed." });
  } catch (error) {
    console.error("Error ending event:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}