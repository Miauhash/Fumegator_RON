// pages/api/player.js (COMPLETO - NENHUMA ALTERAÇÃO NECESSÁRIA)

import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    // --- LÓGICA DE CARREGAMENTO (GET) ---
    if (req.method === 'GET') {
        const { wallet } = req.query;
        if (!wallet) {
            return res.status(400).json({ message: 'A carteira do usuário é obrigatória.' });
        }

        try {
            const playerState = await prisma.gameState.findUnique({
                where: { wallet: wallet },
            });

            if (!playerState) {
                return res.status(404).json({ message: 'Nenhum progresso salvo encontrado.' });
            }
            
            return res.status(200).json({ gameState: playerState.state });

        } catch (error) {
            console.error(`Erro ao carregar progresso para ${wallet}:`, error);
            return res.status(500).json({ message: 'Erro interno ao carregar o progresso.' });
        }
    }

    // --- LÓGICA DE SALVAMENTO (POST) ---
    if (req.method === 'POST') {
        const { wallet, gameState } = req.body;
        if (!wallet || !gameState) {
            return res.status(400).json({ message: 'Dados insuficientes.' });
        }

        try {
            await prisma.gameState.upsert({
                where: { wallet: wallet },
                update: { state: gameState },
                create: { wallet: wallet, state: gameState },
            });
            
            if (gameState.playerStats) {
                await prisma.playerStat.upsert({
                    where: { userWallet: wallet },
                    update: {
                        totalTokensProduced: gameState.playerStats.totalTokensProduced || 0,
                        maxLevelReached: gameState.playerStats.maxLevelReached || 1,
                    },
                    create: {
                        userWallet: wallet,
                        totalTokensProduced: gameState.playerStats.totalTokensProduced || 0,
                        maxLevelReached: gameState.playerStats.maxLevelReached || 1,
                    }
                });
            }
            
            return res.status(200).json({ message: 'Progresso salvo com sucesso.' });

        } catch (error) {
            console.error(`Erro ao salvar progresso para ${wallet}:`, error);
            return res.status(500).json({ message: 'Erro interno ao salvar o progresso.' });
        }
    }

    // Se não for GET ou POST
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}