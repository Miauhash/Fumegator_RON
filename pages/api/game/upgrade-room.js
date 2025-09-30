// pages/api/game/upgrade-room.js
import prisma from '../../../lib/prisma';
import { loadGameState, saveGameState } from '../../../utils/server-mining-logic';
import { rateLimiter } from '../../../lib/rate-limiter';

// Dados de progressão (devem ser os mesmos do seu Game.js)
const MAX_LEVEL = 250;
const MIN_REWARD = 0.001;
const MAX_REWARD = 24;
const MIN_TIME = 60;
const MAX_TIME = 432000;

// Função para calcular a progressão
const calcProgression = (level) => {
    const tFactor = Math.pow(MAX_TIME / MIN_TIME, (level - 1) / (MAX_LEVEL - 1));
    const rFactor = Math.pow(MAX_REWARD / MIN_REWARD, (level - 1) / (MAX_LEVEL - 1));
    return { time: Math.round(MIN_TIME * tFactor), reward: MIN_REWARD * rFactor };
};

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { wallet, roomId, roomToken } = req.body;

    if (!wallet || !roomId || !roomToken) {
        return res.status(400).json({ message: 'Dados inválidos.' });
    }

    try {
        // --- INÍCIO DAS VERIFICAÇÕES DE SANIDADE ---

        // 1. Recarrega o estado do jogador DIRETAMENTE do banco de dados
        const gameState = await loadGameState(wallet);
        if (!gameState) {
            return res.status(404).json({ message: 'Jogador não encontrado.' });
        }

        const currentLevel = gameState.levels?.[roomId] || 1;
        const currentCost = gameState.costs?.[roomId] || 1;
        const currentBalance = gameState.balances?.[roomToken] || 0;

        // 2. Re-verifica todas as condições no backend
        if (currentLevel >= MAX_LEVEL) {
            return res.status(400).json({ message: 'Nível máximo já atingido.' });
        }
        if (currentBalance < currentCost) {
            return res.status(400).json({ message: 'Saldo insuficiente.' });
        }

        // --- FIM DAS VERIFICAÇÕES DE SANIDADE ---

        // Se todas as verificações passaram, executa a lógica
        const newLevel = currentLevel + 1;

        // Debita o custo
        gameState.balances[roomToken] -= currentCost;
        
        // Atualiza os dados da sala
        gameState.levels[roomId] = newLevel;
        gameState.costs[roomId] = Math.ceil(currentCost * 1.15);
        const progression = calcProgression(newLevel);
        gameState.maxTimes[roomId] = progression.time;
        gameState.rewards[roomId] = progression.reward;
        gameState.playerStats.maxLevelReached = Math.max(gameState.playerStats.maxLevelReached || 1, newLevel);

        // Salva o novo estado do jogo no banco de dados
        await saveGameState(wallet, gameState);

        // Retorna o novo estado para o frontend poder atualizar a interface
        res.status(200).json({ 
            message: 'Upgrade bem-sucedido!',
            newGameState: {
                balances: gameState.balances,
                levels: gameState.levels,
                costs: gameState.costs,
                maxTimes: gameState.maxTimes,
                rewards: gameState.rewards,
                playerStats: gameState.playerStats,
            }
        });

    } catch (error) {
        console.error(`Error upgrading room for ${wallet}:`, error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// Protege contra spam de upgrades
const limitedHandler = rateLimiter(30, 60 * 1000)(handler); // 30 upgrades por minuto

export default limitedHandler;