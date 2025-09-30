// pages/api/admin/sync-nft-owners.js (VERSÃO FINAL COM SINTAXE CORRIGIDA)
import { ethers } from 'ethers';
import prisma from '../../../lib/prisma';
import { FUMEGATOR_SPECIALIST_ABI } from '../../../lib/abi.js';

function getContract() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.SAIGON_RPC_URL);
    const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
    return new ethers.Contract(contractAddress, FUMEGATOR_SPECIALIST_ABI, provider);
}

async function fetchMetadata(url) {
    if (!url) return null;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Falha ao buscar metadados de ${url}. Status: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.warn(`Erro de rede ao buscar metadados de ${url}:`, error.message);
        return null;
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;
    const authHeader = req.headers.authorization;
    if (!ADMIN_SECRET || authHeader !== `Bearer ${ADMIN_SECRET}`) {
        return res.status(401).json({ message: 'Não autorizado.' });
    }
    
    res.status(202).json({ message: "Sincronização iniciada. Monitore os logs do servidor." });

    console.log("Iniciando sincronização completa de NFTs (donos e metadados)...");
    try {
        const contract = getContract();
        const totalSupply = (await contract.totalSupply()).toNumber();
        console.log(`Total de NFTs para verificar na blockchain: ${totalSupply}`);

        if (totalSupply === 0) {
            console.log("Nenhum NFT mintado ainda. Sincronização concluída.");
            return;
        }

        for (let i = 0; i < totalSupply; i++) {
            const tokenId = i;
            try {
                const owner = await contract.ownerOf(tokenId);
                const ownerAddress = owner.toLowerCase();
                const tokenUri = await contract.tokenURI(tokenId);
                
                let metadata = {
                    name: `Specialist #${tokenId}`,
                    image: '',
                    rarity: 'Unknown'
                };

                const fetchedMeta = await fetchMetadata(tokenUri);
                if (fetchedMeta) {
                    metadata.name = fetchedMeta.name;
                    metadata.image = fetchedMeta.image;
                    const rarityAttr = fetchedMeta.attributes?.find(a => a.trait_type === 'Rarity');
                    if (rarityAttr) {
                        metadata.rarity = rarityAttr.value;
                    }
                }
                
                await prisma.nft.upsert({
                    where: { tokenId: tokenId },
                    update: { 
                        ownerWallet: ownerAddress,
                        name: metadata.name,
                        image: metadata.image,
                        rarity: metadata.rarity
                    },
                    create: {
                        tokenId: tokenId,
                        ownerWallet: ownerAddress,
                        name: metadata.name,
                        image: metadata.image,
                        rarity: metadata.rarity
                    }
                });
                
                if (i > 0 && i % 100 === 0) {
                    console.log(`Sincronizado até o Token ID: ${i}`);
                }

            } catch (error) {
                if (error.message && !error.message.includes("execution reverted")) {
                    console.warn(`Erro ao processar Token ID ${tokenId}:`, error.message);
                }
            }
        }

        console.log("Sincronização completa (donos e metadados) concluída com sucesso!");

    } catch (error) { // <<< CHAVES CORRIGIDAS AQUI
        console.error("ERRO CRÍTICO DURANTE A SINCRONIZAÇÃO:", error);
    }
}