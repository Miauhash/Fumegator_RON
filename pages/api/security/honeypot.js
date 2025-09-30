// pages/api/security/honeypot.js

import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    const { wallet, trapId } = req.body;

    if (!wallet || !trapId) {
        return res.status(400).json({ message: 'Dados insuficientes.' });
    }

    try {
        console.log(`ALERTA DE SEGURANÇA: Honeypot ativado pela carteira ${wallet}. Armadilha: ${trapId}`);

        // Marca o jogador como 'shadowbanned' no banco de dados.
        // O upsert é seguro: ele atualiza se o jogador existir, ou cria caso seja um novo jogador
        // (embora seja improvável que um bot seja um jogador sem GameState).
        await prisma.gameState.update({
            where: { wallet: wallet },
            data: { isShadowbanned: true },
        });

        // Retorna uma resposta genérica de sucesso para não dar pistas ao bot.
        res.status(200).json({ status: 'ok' });

    } catch (error) {
        console.error(`Erro ao processar honeypot para a carteira ${wallet}:`, error);
        // Mesmo em caso de erro, retorna uma resposta de sucesso.
        res.status(200).json({ status: 'ok' });
    }
}