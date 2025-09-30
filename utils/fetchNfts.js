// utils/fetchNfts.js (VERSÃO OTIMIZADA COM BACKEND)
import getBaseUrl from './get-base-url'; // Você pode precisar criar este helper

export const MYSTIC_RARITY_VALUE = "Mystic"; 

export async function fetchUserRoninNFTs(userWalletAddress) {
  if (!userWalletAddress) return [];

  const BASE_URL = getBaseUrl(); // ex: http://localhost:3000 ou https://www.fumegator.xyz

  try {
    // UMA ÚNICA CHAMADA DE REDE!
    const response = await fetch(`${BASE_URL}/api/nfts/${userWalletAddress}`);
    if (!response.ok) {
        console.error("Falha ao buscar NFTs do nosso backend.");
        return [];
    }
    
    const nftsFromDb = await response.json();

    // A API já retorna os dados que precisamos, basta formatar se necessário.
    return nftsFromDb.map(nft => ({
        name: nft.name || `Specialist #${nft.tokenId}`,
        image: nft.image || `URL_PADRAO/${nft.tokenId}.png`, // Coloque sua URL de imagem aqui
        address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
        tokenId: nft.tokenId,
        attributes: nft.attributes || [], // Supondo que você salve os atributos como JSON no DB
        rarity: nft.rarity || 'Common',
    }));

  } catch (error) {
    console.error("[ERRO EM fetchUserRoninNFTs via backend]:", error);
    return [];
  }
}