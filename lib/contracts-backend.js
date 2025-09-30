// lib/contracts-backend.js (VERSÃO FINAL COM LÓGICA DE MINT)
import { ethers } from 'ethers';

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
const MINTER_PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY;
const RPC_URL = process.env.SAIGON_RPC_URL;

// ABI MÍNIMO E CORRETO para o seu contrato Specialist
const SPECIALIST_ABI = [
    "function mintBatch(address to, uint256 quantity, string memory baseURI)",
    "function totalSupply() view returns (uint256)"
];

export const getFumegatorSpecialistContract_WRITE = () => {
    if (!MINTER_PRIVATE_KEY || !RPC_URL || !NFT_CONTRACT_ADDRESS) {
        console.error("[contracts-backend] ERRO CRÍTICO: Variáveis de ambiente faltando.");
        return null;
    }
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const minterWallet = new ethers.Wallet(MINTER_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, SPECIALIST_ABI, provider);
        return contract.connect(minterWallet);
    } catch (error) {
        console.error("[contracts-backend] ERRO ao criar instância do contrato:", error);
        return null;
    }
};