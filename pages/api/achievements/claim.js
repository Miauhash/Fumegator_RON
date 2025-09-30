// pages/api/achievements/claim.js (VERSÃO CORRIGIDA E COMPLETA PARA RONIN)

import prisma from '../../../lib/prisma';
import { transferNftFromGameWallet } from '../../../utils/nftTransferRonin'; 

const achievementsList = [
    { id: 'level_5', reward: 10 }, { id: 'level_18', reward: 10 },
    { id: 'level_27', reward: 10 }, { id: 'level_39', reward: 10 },
    { id: 'level_45', reward: 10 },
    { id: 'level_60', reward: 100 }, { id: 'level_85', reward: 100 },
    { id: 'level_97', reward: 100 }, { id: 'level_110', reward: 100 },
    { id: 'level_140', reward: 1000 }, { id: 'level_183', reward: 1000 },
    { id: 'level_201', reward: 1000 }, { id: 'level_211', reward: 1000 },
    { id: 'level_223', reward: 1000 }, { id: 'level_237', reward: 1000 },
    { id: 'level_246', reward: 1000 },
    { id: 'level_250', reward: 5000, specialReward: 'NFT_LEGENDARY' },
];

const LEGENDARY_NFT_CONTRACT_ADDRESS = 'SEU_ENDERECO_DE_CONTRATO_DE_NFT_LENDARIO_AQUI';
const LEGENDARY_NFT_TOKEN_ID = 123; // Substitua pelo ID real do seu NFT prêmio.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const { wallet } = req.body;
    if (!wallet) {
        return res.status(400).json({ error: 'A carteira do usuário é obrigatória.' });
    }

    try {
        const achievementsToClaim = await prisma.userAchievement.findMany({
            where: {
                userWallet: wallet,
                isClaimed: false,
            },
        });

        if (achievementsToClaim.length === 0) {
            return res.status(400).json({ error: 'Nenhuma recompensa para coletar.' });
        }

        let totalVIDAReward = 0;
        let hasLegendaryReward = false;
        
        for (const achToClaim of achievementsToClaim) {
            const achInfo = achievementsList.find(a => a.id === achToClaim.achievementId);
            if (achInfo) {
                totalVIDAReward += achInfo.reward;
                if (achInfo.specialReward === 'NFT_LEGENDARY') {
                    hasLegendaryReward = true;
                }
            }
        }

        await prisma.$transaction(async (tx) => {
            const gameState = await tx.gameState.findUnique({ where: { wallet } });
            if (!gameState) throw new Error('GameState não encontrado.');

            const state = gameState.state;
            state.balances['VIDA'] = (state.balances['VIDA'] || 0) + totalVIDAReward;

            await tx.gameState.update({
                where: { wallet },
                data: { state },
            });

            const achievementIdsToUpdate = achievementsToClaim.map(a => a.id);
            await tx.userAchievement.updateMany({
                where: {
                    id: { in: achievementIdsToUpdate },
                },
                data: {
                    isClaimed: true,
                },
            });
        });

        let nftTransferSignature = null;
        if (hasLegendaryReward) {
            try {
                nftTransferSignature = await transferNftFromGameWallet(
                    wallet,
                    LEGENDARY_NFT_CONTRACT_ADDRESS,
                    LEGENDARY_NFT_TOKEN_ID
                );
            } catch (nftError) {
                console.error(`FALHA CRÍTICA: Não foi possível transferir o NFT Lendário para ${wallet}. Hash da transação: ${nftTransferSignature}`, nftError);
            }
        }

        let successMessage = `Recompensas coletadas! Você ganhou ${totalVIDAReward} VIDA.`;
        if (hasLegendaryReward) {
            successMessage += ' E um NFT Lendário foi enviado para sua carteira!';
        }

        res.status(200).json({ message: successMessage });

    } catch (error) {
        // <<< CORREÇÃO APLICADA AQUI: Removido o texto de comentário que causava o erro >>>
        console.error("Erro ao coletar recompensas:", error);
        res.status(500).json({ error: 'Não foi possível coletar as recompensas.' });
    }
}