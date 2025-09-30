// utils/server-mining-logic.js

import prisma from '../lib/prisma';

/**
 * Loads the game state for a given wallet directly from the database.
 * To be used by server-side code (API routes).
 * @param {string} wallet The user's wallet address.
 * @returns {Promise<object|null>} The player's game state object or null if not found.
 */
export async function loadGameState(wallet) {
    if (!wallet) return null;
    try {
        const playerState = await prisma.gameState.findUnique({
            where: { wallet: wallet },
        });

        if (!playerState) {
            return null; // Player not found
        }
        
        return playerState.state; // Prisma already parses the JSON
    } catch (error) {
        console.error(`Error loading game state for ${wallet} on the server:`, error);
        return null;
    }
}

/**
 * Saves the game state for a given wallet directly to the database.
 * To be used by server-side code (API routes).
 * @param {string} wallet The user's wallet address.
 * @param {object} gameState The complete game state object to save.
 * @returns {Promise<void>}
 */
export async function saveGameState(wallet, gameState) {
    if (!wallet || !gameState) return;
    try {
        await prisma.gameState.upsert({
            where: { wallet: wallet },
            update: { state: gameState },
            create: { wallet: wallet, state: gameState },
        });

        // Also update the separate stats table for leaderboards/ranking
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
    } catch (error) {
        console.error(`Error saving game state for ${wallet} on the server:`, error);
    }
}