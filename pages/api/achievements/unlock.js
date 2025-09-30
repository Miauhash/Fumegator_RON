// pages/api/achievements/unlock.js
// (Esta lógica pode ser integrada à sua API de salvamento de progresso)

import prisma from '../../../lib/prisma';

// Copie a mesma lista de conquistas aqui para que o backend saiba quais existem
const achievementsList = [
    { id: 'level_5', requiredLevel: 5 }, { id: 'level_18', requiredLevel: 18 },
    { id: 'level_27', requiredLevel: 27 }, { id: 'level_39', requiredLevel: 39 },
    { id: 'level_45', requiredLevel: 45 }, { id: 'level_60', requiredLevel: 60 },
    { id: 'level_85', requiredLevel: 85 }, { id: 'level_97', requiredLevel: 97 },
    { id: 'level_110', requiredLevel: 110 }, { id: 'level_140', requiredLevel: 140 },
    { id: 'level_183', requiredLevel: 183 }, { id: 'level_201', requiredLevel: 201 },
    { id: 'level_211', requiredLevel: 211 }, { id: 'level_223', requiredLevel: 223 },
    { id: 'level_237', requiredLevel: 237 }, { id: 'level_246', requiredLevel: 246 },
    { id: 'level_250', requiredLevel: 250 },
];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    const { wallet, maxLevelReached } = req.body;

    if (!wallet || !maxLevelReached) {
        return res.status(400).json({ message: 'Dados insuficientes.' });
    }

    try {
        // 1. Busca as conquistas que o usuário já desbloqueou para não checar de novo
        const existingAchievements = await prisma.userAchievement.findMany({
            where: { userWallet: wallet },
            select: { achievementId: true },
        });
        const existingIds = new Set(existingAchievements.map(a => a.achievementId));

        // 2. Determina quais novas conquistas foram alcançadas
        const newAchievementsToCreate = achievementsList
            .filter(ach => maxLevelReached >= ach.requiredLevel && !existingIds.has(ach.id))
            .map(ach => ({
                userWallet: wallet,
                achievementId: ach.id,
            }));

        // 3. Se houver novas conquistas, salva no banco de dados
        if (newAchievementsToCreate.length > 0) {
            await prisma.userAchievement.createMany({
                data: newAchievementsToCreate,
                skipDuplicates: true, // Apenas por segurança
            });
            console.log(`Usuário ${wallet} desbloqueou ${newAchievementsToCreate.length} nova(s) conquista(s).`);
        }
        
        res.status(200).json({ message: 'Verificação de conquistas concluída.' });

    } catch (error) {
        console.error("Erro ao verificar conquistas:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}