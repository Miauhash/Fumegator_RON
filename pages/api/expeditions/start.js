// pages/api/expeditions/start.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)
import prisma from '../../../lib/prisma';
import { getMissionConfig } from '../../../lib/missionConfig';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // --- MIGRAÇÃO RONIN: Parâmetro renomeado de nftMint para nftId ---
    const { userWallet, nftId, missionType } = req.body;

    const MISSION_CONFIG = getMissionConfig();
    // --- MIGRAÇÃO RONIN: Validação agora checa por nftId ---
    if (!userWallet || !nftId || !missionType || !MISSION_CONFIG[missionType]) {
        return res.status(400).json({ message: 'Invalid mission data provided.' });
    }

    try {
        // --- MIGRAÇÃO RONIN: Verificar se o nftId já está em uma expedição ---
        const existingExpedition = await prisma.expedition.findFirst({
            where: {
                nftId: nftId, // Usar o novo campo
                rewardClaimed: false,
            },
        });

        if (existingExpedition) {
            return res.status(400).json({ message: 'This Specialist is already on an expedition.' });
        }
        
        const mission = MISSION_CONFIG[missionType];
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + mission.duration * 1000);

        const newExpedition = await prisma.expedition.create({
            data: {
                userWallet,
                nftId: nftId, // --- MIGRAÇÃO RONIN: Salvar o nftId no banco de dados
                missionType,
                startedAt: startTime,
                endsAt: endTime,
                rewardToken: mission.rewardToken,
                rewardAmount: mission.rewardAmount,
                rewardClaimed: false,
            },
        });

        res.status(200).json({ message: 'Expedition started successfully!', expedition: newExpedition });

    } catch (error) {
        console.error("Error starting expedition:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}