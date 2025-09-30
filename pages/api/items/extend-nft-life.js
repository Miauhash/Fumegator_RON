// pages/api/items/extend-nft-life.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: "Method not allowed" });

    // --- MIGRAÇÃO RONIN: O frontend agora envia 'nftKey' em vez de 'nftMint' ---
    const { wallet, nftKey, days } = req.body;
    if (!wallet || !nftKey || !days) return res.status(400).json({ success: false, error: "Dados insuficientes." });

    try {
        const userState = await prisma.gameState.findUnique({ where: { wallet } });
        if (!userState) throw new Error("Usuário não encontrado.");

        const state = userState.state;
        let nftMetaFound = false;

        // Procura o NFT em 'selectedMeta' usando a nova chave (nftKey)
        for (const slotId in state.selectedMeta) {
            // --- MIGRAÇÃO RONIN: A comparação agora é feita com 'nftKey' ---
            if (state.selectedMeta[slotId]?.key === nftKey) {
                const meta = state.selectedMeta[slotId];
                const extensionInMillis = days * 24 * 60 * 60 * 1000;
                
                // A lógica de diminuir 'assignedAt' para estender a vida útil permanece a mesma.
                // Isso efetivamente "empurra" a data de expiração para o futuro.
                meta.assignedAt -= extensionInMillis; 
                nftMetaFound = true;
                break;
            }
        }

        if (!nftMetaFound) throw new Error("O NFT alvo não está atualmente em uso.");

        await prisma.gameState.update({
            where: { wallet },
            data: { state },
        });

        res.status(200).json({ success: true, message: `NFT life extended successfully.` });
    } catch (error) {
        console.error("Error extending NFT life:", error);
        res.status(400).json({ success: false, error: error.message });
    }
}