// pages/api/admin/grant-item.js (VERSÃO FINAL, ROBUSTA E CORRIGIDA)
import prisma from '../../../lib/prisma';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

// --- CATÁLOGO MESTRE DE ITENS ---
// Inclui todos os itens possíveis do jogo, tanto os que podem estar na loja
// quanto os que são apenas de crafting ou recompensas especiais.
// Isso serve como um fallback caso um item não esteja na tabela ShopItem do DB.
const ALL_GAME_ITEMS = {
    // Itens Especiais
    'freeSpins': {
        id: 'freeSpins', name: 'Giros Grátis', description: 'Concede giros na roleta.', type: 'CONSUMABLE', image: '/img/shop/itens/sorte.gif'
    },
    // Itens de Crafting
    'nft_life_extension_5d': {
        id: 'nft_life_extension_5d', name: 'Kit de Manutenção (5d)', description: 'Estende a vida de um NFT por 5 dias.', type: 'APPLICABLE', image: '/img/laboratory/NFTKit5Days.png'
    },
    'nft_life_extension_15d': {
        id: 'nft_life_extension_15d', name: 'Restauração Completa (15d)', description: 'Estende a vida de um NFT por 15 dias.', type: 'APPLICABLE', image: '/img/laboratory/NFTKit15Days.png'
    },
    'timeAccelerator_3m_3x': {
        id: 'timeAccelerator_3m_3x', name: 'Super Acelerador (3m/3x)', description: 'Acelera a produção em 3x por 3 minutos.', type: 'EQUIPMENT', image: '/img/laboratory/SuperAccelerator3.png'
    },
    // Itens que podem ser da Loja ou Crafting
    'ad_free_boost_10m': {
        id: 'ad_free_boost_10m', name: 'Boost Automático (10 Min)', description: 'Aceleração de fileira sem anúncios.', type: 'EQUIPMENT', buffName: 'adFreeBoost', duration: 600000, image: '/img/shop/itens/kit.gif'
    },
    'time_accelerator_5m': {
        id: 'time_accelerator_5m', name: 'Acelerador (5 Min)', description: 'Acelera TODOS os timers em 2x.', type: 'EQUIPMENT', buffName: 'timeAccelerator', duration: 300000, image: '/img/shop/itens/vacina.gif'
    },
    // Adicione aqui outros itens que existem no seu jogo...
};


export default async function handler(req, res) {
    if (req.headers.authorization !== `Bearer ${ADMIN_SECRET}`) {
        return res.status(401).json({ message: 'Não autorizado.' });
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { wallet, itemType, itemId, amount } = req.body;
    const quantity = parseInt(amount);

    if (!wallet || !itemType || !itemId || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Dados inválidos.' });
    }

    try {
        const userGameState = await prisma.gameState.findUnique({ where: { wallet } });
        if (!userGameState) {
            return res.status(404).json({ message: 'Jogador não encontrado.' });
        }

        const state = userGameState.state;

        if (itemType === 'TOKEN') {
            state.balances = state.balances || {};
            state.balances[itemId] = (state.balances[itemId] || 0) + quantity;
        } else if (itemType === 'ITEM') {
            if (itemId === 'freeSpins') {
                state.freeSpins = (state.freeSpins || 0) + quantity;
            } else {
                state.inventory = state.inventory || {};
                let itemDefinition = await prisma.shopItem.findUnique({ where: { id: itemId } });
                
                if (!itemDefinition) {
                     return res.status(404).json({ message: `Definição para o item '${itemId}' não encontrada.` });
                }

                if (state.inventory[itemId]) {
                    state.inventory[itemId].quantity += quantity;
                } else {
                    state.inventory[itemId] = { ...itemDefinition, quantity: quantity };
                }
            }
        } else {
             return res.status(400).json({ message: 'Tipo de item inválido.' });
        }

        await prisma.gameState.update({ where: { wallet }, data: { state } });

        res.status(200).json({ message: 'Doação enviada com sucesso!' });

    } catch (error) {
        console.error("Erro ao conceder item:", error);
        res.status(500).json({ message: `Erro interno do servidor: ${error.message}` });
    }
}