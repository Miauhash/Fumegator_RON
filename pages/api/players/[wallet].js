// pages/api/player/[wallet].js (VERSÃO FINAL E CORRIGIDA)

import prisma from '../../../lib/prisma';

// Função para criar um estado de jogo padrão para um novo jogador
const createDefaultGameState = () => ({
  balances: {}, levels: {}, timers: {}, costs: {}, maxTimes: {}, rewards: {},
  selectedNFTs: {}, selectedMeta: {}, usedNFTKeys: [], burnedNFTKeys: [],
  activeBuffs: {}, permanentBuffs: {}, freeSpins: 0, inventory: {},
  playerStats: { totalTokensProduced: 0, maxLevelReached: 1 },
  unlockedSlots: {
    '1': true, '2': true, '3': true, '4': true, '5': true,
    '16': true, '17': true, '18': true, '19': true, '20': true,
    '31': true, '32': true, '33': true, '34': true, '35': true,
    '46': true, '47': true, '48': true, '49': true, '50': true,
    '61': true, '62': true, '63': true, '64': true, '65': true,
  }
});

export default async function handler(req, res) {
    const { wallet } = req.query;
    const walletAddress = wallet.toLowerCase();

    if (!wallet) {
        return res.status(400).json({ message: 'Wallet address is required.' });
    }

    // --- LÓGICA DE CARREGAMENTO (GET) ---
    if (req.method === 'GET') {
        try {
            let playerState = await prisma.gameState.findUnique({
                where: { wallet: walletAddress },
            });

            if (!playerState) {
                const defaultState = createDefaultGameState();
                playerState = await prisma.gameState.create({
                    data: {
                        wallet: walletAddress,
                        state: defaultState,
                    }
                });
            }
            
            return res.status(200).json({ gameState: playerState.state });

        } catch (error) {
            console.error(`Error loading progress for ${walletAddress}:`, error);
            return res.status(500).json({ message: 'Internal server error while loading progress.' });
        }
    }

    // --- LÓGICA DE SALVAMENTO (POST) ---
    if (req.method === 'POST') {
        const { gameState } = req.body;
        if (!gameState) {
            return res.status(400).json({ message: 'GameState data is required.' });
        }

        try {
            // A LINHA PROBLEMÁTICA "prisma.user.upsert" FOI REMOVIDA DAQUI

            await prisma.gameState.upsert({
                where: { wallet: walletAddress },
                update: { state: gameState },
                create: { wallet: walletAddress, state: gameState },
            });
            
            if (gameState.playerStats) {
                await prisma.playerStat.upsert({
                    where: { userWallet: walletAddress },
                    update: {
                        totalTokensProduced: gameState.playerStats.totalTokensProduced || 0,
                        maxLevelReached: gameState.playerStats.maxLevelReached || 1,
                    },
                    create: {
                        userWallet: walletAddress,
                        totalTokensProduced: gameState.playerStats.totalTokensProduced || 0,
                        maxLevelReached: gameState.playerStats.maxLevelReached || 1,
                    }
                });
            }
            
            return res.status(200).json({ message: 'Progress saved successfully.' });

        } catch (error) {
            console.error(`Error saving progress for ${walletAddress}:`, error);
            return res.status(500).json({ message: 'Internal server error while saving progress.' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}