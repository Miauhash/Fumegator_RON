// pages/api/market/create.js

import prisma from '../../../lib/prisma';
import { loadGameState, saveGameState } from '../../../utils/server-mining-logic'; // Agora esta importação funciona

const SELLABLE_TOKENS = ["INSULINE", "ZOLGENSMA", "LUXUTURNA", "ZYNTEGLO"];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { sellerWallet, tokenType, amount, pricePerUnitInVIDA } = req.body;
    const amountFloat = parseFloat(amount);
    const priceFloat = parseFloat(pricePerUnitInVIDA);

    if (!sellerWallet || !SELLABLE_TOKENS.includes(tokenType) || isNaN(amountFloat) || amountFloat <= 0 || isNaN(priceFloat) || priceFloat <= 0) {
        return res.status(400).json({ message: 'Invalid input data.' });
    }

    try {
        const activeListingsCount = await prisma.marketListing.count({
            where: {
                sellerWallet: sellerWallet,
                isActive: true,
            },
        });

        if (activeListingsCount >= 3) {
            return res.status(403).json({ message: 'You can only have 3 active listings at a time.' });
        }

        const gameState = await loadGameState(sellerWallet);
        
        if (!gameState || !gameState.balances) {
             return res.status(404).json({ message: 'Player game state not found.' });
        }
        
        const currentBalance = parseFloat(gameState.balances[tokenType] || 0);

        if (currentBalance < amountFloat) {
            return res.status(400).json({ message: 'Insufficient token balance.' });
        }

        gameState.balances[tokenType] = currentBalance - amountFloat;
        await saveGameState(sellerWallet, gameState);

        const newListing = await prisma.marketListing.create({
            data: {
                sellerWallet,
                tokenType,
                amount: amountFloat,
                pricePerUnitInVIDA: priceFloat,
                isActive: true,
            },
        });

        res.status(201).json({ message: 'Listing created successfully!', listing: newListing });

    } catch (error) {
        console.error("Error creating market listing:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}