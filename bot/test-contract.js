// scripts/test-contract.js
// Este script vai nos dar a resposta final.

// Carrega as variáveis de ambiente do arquivo .env.production
require('dotenv').config({ path: '.env.production' });

const { ethers } = require('ethers');
// IMPORTANTE: Estamos importando o ABI do mesmo arquivo central que suas APIs usam.
const { FUMEGATOR_SPECIALIST_ABI } = require('../lib/abi.js');

async function testContract() {
    console.log("--- INICIANDO TESTE DE CONTRATO ---");

    const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
    const MINTER_PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY;
    const RPC_URL = process.env.SAIGON_RPC_URL;

    console.log(`Endereço do Contrato: ${NFT_CONTRACT_ADDRESS}`);
    console.log(`URL RPC: ${RPC_URL}`);
    console.log(`Chave Privada do Minter Carregada: ${!!MINTER_PRIVATE_KEY}`);

    if (!NFT_CONTRACT_ADDRESS || !MINTER_PRIVATE_KEY || !RPC_URL) {
        console.error("ERRO FATAL: Uma ou mais variáveis de ambiente não foram carregadas. Verifique o arquivo .env.production.");
        return;
    }

    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const minterWallet = new ethers.Wallet(MINTER_PRIVATE_KEY, provider);
        
        console.log("\nProvider e Minter Wallet criados com sucesso.");
        console.log(`Endereço do Minter: ${minterWallet.address}`);

        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, FUMEGATOR_SPECIALIST_ABI, minterWallet);
        
        console.log("Objeto de contrato criado. Endereço: ", contract.address);
        
        console.log("\n--- FUNÇÕES ENCONTRADAS NO CONTRATO (VIA ABI) ---");
        // ESTA É A PARTE MAIS IMPORTANTE:
        // Vamos imprimir todas as funções que o ethers.js conseguiu encontrar.
        console.log(Object.keys(contract.functions));
        console.log("-------------------------------------------------");

        console.log("\nTentando chamar uma função de leitura ('totalSupply')...");
        const totalSupply = await contract.totalSupply();
        console.log(`✅ SUCESSO! Total Supply: ${totalSupply.toString()}`);
        
        console.log("\nVerificando a existência da função 'safeTransferFrom'...");
        if (typeof contract.safeTransferFrom === 'function') {
            console.log("✅ SUCESSO! A função 'safeTransferFrom' FOI encontrada no objeto do contrato.");
        } else {
            console.error("❌ ERRO FATAL: A função 'safeTransferFrom' NÃO FOI encontrada no objeto do contrato.");
        }

    } catch (error) {
        console.error("\n--- UM ERRO CRÍTICO OCORREU DURANTE O TESTE ---");
        console.error(error);
    }
}

testContract();