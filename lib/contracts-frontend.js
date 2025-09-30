// lib/contracts-frontend.js (VERSÃO FINAL USANDO ABI CENTRAL)
import { ethers } from 'ethers';
import { FUMEGATOR_SPECIALIST_ABI } from './abi.js';

export const getFumegatorSpecialistContract_READONLY = (provider) => {
    // ... (o resto do código que já corrigimos, sem o ABI gigante)
    const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
    if (!NFT_CONTRACT_ADDRESS || !provider) return null;
    return new ethers.Contract(NFT_CONTRACT_ADDRESS, FUMEGATOR_SPECIALIST_ABI, provider);
};

// ... (o resto do seu código para tokens ERC-20, que já estava bom)
const ERC20_ABI = [ "function name() view returns (string)", "function symbol() view returns (string)", "function balanceOf(address account) view returns (uint256)" ];
export const TOKEN_CONTRACT_ADDRESSES = { INSULINE: process.env.NEXT_PUBLIC_INSULINE_CONTRACT_ADDRESS, ZOLGENSMA: process.env.NEXT_PUBLIC_ZOLGENSMA_CONTRACT_ADDRESS, LUXUTURNA: process.env.NEXT_PUBLIC_LUXUTURNA_CONTRACT_ADDRESS, ZYNTEGLO: process.env.NEXT_PUBLIC_ZYNTEGLO_CONTRACT_ADDRESS, VIDA: process.env.NEXT_PUBLIC_VIDA_CONTRACT_ADDRESS, };
export const getTokenContract = (tokenSymbol, providerOrSigner) => { const tokenKey = tokenSymbol.toUpperCase(); const address = TOKEN_CONTRACT_ADDRESSES[tokenKey]; if (!address) throw new Error(`Endereço de contrato não encontrado para o token: ${tokenSymbol}`); return new ethers.Contract(address, ERC20_ABI, providerOrSigner); };