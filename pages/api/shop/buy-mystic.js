// pages/api/shop/buy-mystic.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)
import { ethers } from 'ethers';
import prisma from '../../../lib/prisma';
import { transferNftFromGameWallet } from '../../../utils/nftTransferRonin';

// --- MIGRAÇÃO RONIN: Configurações da Ronin e Ethers.js ---
const MYSTIC_PRICE_RON = "15.0"; // Preço em RON, deve ser consistente com o frontend
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS_RONIN;
const RONIN_CLUSTER = process.env.RONIN_CLUSTER || "saigon";
const RPC_URL = RONIN_CLUSTER === 'mainnet'
    ? 'https://api.roninchain.com/rpc'
    : 'https://saigon-testnet.roninchain.com/rpc';
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    // --- MIGRAÇÃO RONIN: O frontend agora envia um 'signature' que é o hash da transação ---
    const { wallet, signature } = req.body;
    if (!wallet || !signature) {
        return res.status(400).json({ message: "Wallet and transaction hash are required." });
    }

    try {
        // --- MIGRAÇÃO RONIN: Lógica de verificação de transação na Ronin ---
        const txReceipt = await provider.getTransactionReceipt(signature);
        if (!txReceipt) {
            throw new Error('Transaction not found on the blockchain yet.');
        }
        if (txReceipt.status !== 1) {
            throw new Error('Payment transaction failed (reverted).');
        }

        // Validação robusta da transação
        const tx = await provider.getTransaction(signature);
        const expectedValue = ethers.utils.parseEther(MYSTIC_PRICE_RON);

        if (!tx || 
            tx.to.toLowerCase() !== TREASURY_ADDRESS.toLowerCase() || 
            tx.from.toLowerCase() !== wallet.toLowerCase() ||
            !tx.value.eq(expectedValue)) 
        {
            throw new Error('Payment transaction details are invalid.');
        }
        // Fim da verificação da transação

        // 1. Encontra um NFT Místico disponível no pool de recompensas
        const mysticToAward = await prisma.rewardNft.findFirst({
            where: { isAwarded: false, rarity: 'Mystic' },
            select: { id: true, name: true, imageUrl: true, contractAddress: true, tokenId: true }
        });
        
        if (!mysticToAward) {
            // Se não houver NFTs, é um problema sério. O ideal é ter um sistema de alerta.
            throw new Error("No Mystic NFTs available in the reward pool. Please contact support.");
        }

        // 2. Transfere o NFT da carteira-cofre para o jogador
        await transferNftFromGameWallet(
            wallet, // `to` address
            mysticToAward.contractAddress,
            mysticToAward.tokenId
        );

        // 3. Marca o NFT como premiado no DB
        await prisma.rewardNft.update({
            where: { id: mysticToAward.id },
            data: { isAwarded: true, ownerWallet: wallet }
        });

        // 4. Retorna os dados do NFT para o frontend
        res.status(200).json({ 
            success: true, 
            message: 'Purchase successful!',
            newlyMintedNft: {
                name: mysticToAward.name,
                image: mysticToAward.imageUrl,
                // --- MIGRAÇÃO RONIN: Retorna os identificadores corretos ---
                address: mysticToAward.contractAddress,
                tokenId: mysticToAward.tokenId,
                rarity: 'Mystic'
            }
        });
        
    } catch (error) {
        console.error("[Buy Mystic API Error]:", error);
        res.status(500).json({ message: error.message || 'An internal server error occurred.' });
    }
}