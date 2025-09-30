// pages/api/mint/starter-pack.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)
import prisma from '../../../lib/prisma';
// --- MIGRAÇÃO RONIN: Importar a função de transferência de NFT diretamente ---
import { transferNftFromGameWallet } from '../../../utils/nftTransferRonin';

// Não precisamos mais do 'exec', a chamada será direta e mais segura.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // A requisição ainda contém a assinatura da transação de pagamento, que pode ser verificada aqui se necessário.
    const { userWallet, transactionSignature } = req.body;
    if (!userWallet) {
        return res.status(400).json({ error: 'User wallet is required' });
    }

    try {
        // A lógica para prevenir mints duplicados permanece a mesma.
        const existingMint = await prisma.nftMintPool.findFirst({ where: { mintedTo: userWallet } });
        if (existingMint) {
            return res.status(400).json({ error: "Starter pack already claimed for this wallet." });
        }

        const raritiesToMint = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
        const transferredNfts = [];

        for (const rarity of raritiesToMint) {
            // 1. Reservar o NFT no banco de dados
            const availableNft = await prisma.$transaction(async (tx) => {
                const nft = await tx.nftMintPool.findFirst({
                    where: { rarity, isMinted: false },
                    // --- MIGRAÇÃO RONIN: Garantir que temos os dados corretos do NFT ---
                    select: { id: true, contractAddress: true, tokenId: true }
                });

                if (!nft) throw new Error(`No available NFTs of rarity '${rarity}' found.`);
                
                await tx.nftMintPool.update({
                    where: { id: nft.id },
                    data: { isMinted: true, mintedTo: userWallet, mintedAt: new Date() },
                });
                return nft;
            });
            
            // 2. Executar a transferência on-chain
            try {
                console.log(`[API] Transferindo NFT... Contrato: ${availableNft.contractAddress}, TokenID: ${availableNft.tokenId} para ${userWallet}`);
                await transferNftFromGameWallet(
                    userWallet,
                    availableNft.contractAddress,
                    availableNft.tokenId
                );
            } catch (transferError) {
                // Se a transferência on-chain falhar, devemos reverter a reserva no banco de dados.
                await prisma.nftMintPool.update({
                    where: { id: availableNft.id },
                    data: { isMinted: false, mintedTo: null, mintedAt: null },
                });
                // Lança o erro para que a requisição inteira falhe.
                throw transferError;
            }

            transferredNfts.push({
                id: availableNft.id,
                address: availableNft.contractAddress,
                tokenId: availableNft.tokenId,
                rarity
            });
        }

        res.status(200).json({ success: true, message: 'Starter pack transferred successfully!', nfts: transferredNfts });

    } catch (error) {
        console.error('[API] Erro no Orquestrador de NFT:', error);
        res.status(500).json({ success: false, error: `Server-side error: ${error.message}` });
    }
}