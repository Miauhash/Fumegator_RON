// pages/api/shop/buy-product.js (VERSÃO FINAL COM LÓGICA CORRETA)
import { ethers } from 'ethers';
import { getFumegatorSpecialistContract_WRITE } from '../../../lib/contracts-backend'; 
import prisma from '../../../lib/prisma';

const PRODUCTS = {
    'starter_pack': {
        price: "0.5",
        /**
         * Minta 5 novos NFTs para o comprador.
         * Falha se o totalSupply for maior ou igual a 5000.
         */
        deliver: async (contract, recipient) => {
            console.log(`[buy-product][deliver] Iniciando MINT do Starter Pack para: ${recipient}`);
            
            const totalSupply = await contract.totalSupply();
            if (totalSupply.toNumber() >= 5000) {
                throw new Error("O estoque de Starter Packs (NFTs mintáveis) se esgotou.");
            }

            const quantity = 5;
            const tx = await contract.mintBatch(recipient, quantity);
            await tx.wait(1);

            console.log(`[buy-product][deliver] Mint de ${quantity} NFTs para ${recipient} confirmado.`);
        }
    },
    'mystic_pack': {
        price: "15.0",
        /**
         * Transfere um NFT Mystic da carteira MINTER para o comprador.
         */
        deliver: async (contract, recipient) => {
            console.log(`[buy-product][deliver] Iniciando TRANSFERÊNCIA do Mystic Pack para: ${recipient}`);
            
            const minterAddress = process.env.MINTER_WALLET_ADDRESS.toLowerCase();

            // Encontra o primeiro NFT Mystic disponível no banco de dados que pertence à carteira Minter
            const availableMystic = await prisma.nft.findFirst({
                where: {
                    rarity: 'Mystic',
                    ownerWallet: minterAddress,
                },
                orderBy: { tokenId: 'asc' }
            });

            if (!availableMystic) {
                throw new Error("Estoque de NFTs Mystic esgotado na carteira Minter.");
            }
            
            const tokenIdToTransfer = availableMystic.tokenId;
            console.log(`[buy-product][deliver] Mystic encontrado: Token ID #${tokenIdToTransfer}. Preparando transferência...`);

            // Transfere o NFT da carteira Minter para o comprador
            const tx = await contract.safeTransferFrom(minterAddress, recipient, tokenIdToTransfer);
            await tx.wait(1);

            console.log(`[buy-product][deliver] Transferência do Mystic NFT #${tokenIdToTransfer} confirmada.`);

            // Atualiza o dono no banco de dados
            await prisma.nft.update({
                where: { tokenId: tokenIdToTransfer },
                data: { ownerWallet: recipient.toLowerCase() }
            });

            return {
                message: "Mystic NFT transferido com sucesso!",
                tokenId: tokenIdToTransfer
            };
        }
    }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido.' });

    const { userWallet, productId, transactionHash } = req.body;
    const product = PRODUCTS[productId];
    const walletAddress = userWallet.toLowerCase().replace('ronin:', '0x');

    if (!userWallet || !product || !transactionHash) {
        return res.status(400).json({ message: "Dados inválidos." });
    }

    try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.SAIGON_RPC_URL);
        const tx = await provider.getTransaction(transactionHash);
        const expectedValue = ethers.utils.parseEther(product.price);
        const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS_RONIN.toLowerCase().replace('ronin:', '0x');

        if (!tx || tx.from.toLowerCase() !== walletAddress || tx.to.toLowerCase() !== treasuryAddress || !tx.value.eq(expectedValue)) {
            throw new Error("Verificação da transação de pagamento falhou.");
        }

        const contract = getFumegatorSpecialistContract_WRITE();
        if (!contract) {
            throw new Error("Falha ao inicializar o contrato no servidor.");
        }
        
        const result = await product.deliver(contract, walletAddress);

        res.status(200).json({ 
            success: true, 
            message: 'Operação concluída com sucesso!',
            deliveryResult: result || null
        });

    } catch (error) {
        console.error(`[buy-product] ERRO CRÍTICO NO HANDLER para ${walletAddress}:`, error);
        res.status(500).json({ message: error.message || "Erro ao processar a entrega." });
    }
}