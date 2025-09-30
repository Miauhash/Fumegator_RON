// scripts/mint-mystics.js (com IDs de 8500 a 8749 gerados automaticamente)
require('dotenv').config({ path: '.env.production' });
const { ethers } = require('ethers');

// --- GERA AUTOMATICAMENTE A LISTA DE IDs ---
const MYSTIC_TOKEN_IDS = [];
for (let i = 8500; i <= 8749; i++) {
    MYSTIC_TOKEN_IDS.push(i);
}
// ------------------------------------------

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
const MINTER_PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY;
const MINTER_WALLET_ADDRESS = process.env.MINTER_WALLET_ADDRESS;
const RPC_URL = process.env.SAIGON_RPC_URL;

// ABI mínimo necessário para a função _safeMint do seu contrato V1
const ABI = [
    "function _safeMint(address to, uint256 tokenId)"
];

async function mintMystics() {
    console.log("--- INICIANDO MINT DE MYSTICS PARA A CARTEIRA MINTER ---");
    if (!MINTER_PRIVATE_KEY || !RPC_URL || !NFT_CONTRACT_ADDRESS || !MINTER_WALLET_ADDRESS) {
        console.error("ERRO: Variáveis de ambiente faltando.");
        return;
    }

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const minterWallet = new ethers.Wallet(MINTER_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ABI, minterWallet);

    console.log(`Mintando ${MYSTIC_TOKEN_IDS.length} NFTs Mystic para o endereço: ${MINTER_WALLET_ADDRESS}`);

    for (const tokenId of MYSTIC_TOKEN_IDS) {
        try {
            console.log(`Mintando Mystic ID #${tokenId}...`);
            // Se o seu contrato V1 usa uma função de mint diferente, ajuste o nome aqui.
            // Ex: contract.mint(MINTER_WALLET_ADDRESS, tokenId)
            const tx = await contract._safeMint(MINTER_WALLET_ADDRESS, tokenId);
            await tx.wait(1);
            console.log(`✅ SUCESSO: Mystic ID #${tokenId} mintado.`);
        } catch (error) {
            console.error(`❌ ERRO ao mintar Mystic ID #${tokenId}:`, error.message);
        }
    }
    console.log("--- PROCESSO DE MINT CONCLUÍDO ---");
}

mintMystics();