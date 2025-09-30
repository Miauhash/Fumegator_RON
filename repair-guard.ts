// repair-guard.ts (Versão com Caminho da Propriedade Final Corrigido)
import 'dotenv/config';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCandyMachine, updateCandyGuard, fetchCandyMachine, fetchCandyGuard } from "@metaplex-foundation/mpl-candy-machine";
import { keypairIdentity } from '@metaplex-foundation/umi';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { Keypair as Web3JsKeypair, PublicKey as Web3JsPublicKey } from '@solana/web3.js';

// --- CONFIGURAÇÃO ---
const CANDY_MACHINE_ID = "EHnfkRSHMAno4brDdJtMYpNpmtEfdsUyDLDQSM3YsqkZ";
// --------------------

async function repairGuard() {
    console.log("Iniciando script de reparo do Candy Guard...");

    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
        console.error("ERRO: RPC_URL não encontrada no arquivo .env");
        return;
    }

    const serverPrivateKey = JSON.parse(process.env.SERVER_PRIVATE_KEY as string);
    const serverWeb3JsKeypair = Web3JsKeypair.fromSecretKey(new Uint8Array(serverPrivateKey));
    const serverKeypair = fromWeb3JsKeypair(serverWeb3JsKeypair);

    const umi = createUmi(rpcUrl).use(mplCandyMachine());
    umi.use(keypairIdentity(serverKeypair));

    console.log(`Conectado como: ${serverKeypair.publicKey.toString()}`);

    try {
        const candyMachinePublicKey = fromWeb3JsPublicKey(new Web3JsPublicKey(CANDY_MACHINE_ID));
        
        const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
        
        // CORREÇÃO FINAL: O caminho correto para o ID do guardião é candyMachine.mintAuthority
        const candyGuardPublicKey = candyMachine.mintAuthority;
        
        if (!candyGuardPublicKey) {
            throw new Error("O Candy Guard ID não foi encontrado na Candy Machine.");
        }
        console.log(`Encontrado Candy Guard ID: ${candyGuardPublicKey.toString()}`);

        const candyGuard = await fetchCandyGuard(umi, candyGuardPublicKey);

        console.log("Enviando transação para inicializar/atualizar o guardião...");
        const result = await updateCandyGuard(umi, {
            candyGuard: candyGuardPublicKey,
            guards: candyGuard.guards,
            groups: candyGuard.groups,
        }).sendAndConfirm(umi);

        console.log("✅ SUCESSO! O guardião foi inicializado corretamente.");
        console.log("   - Assinatura da transação:", Buffer.from(result.signature).toString('base64'));

    } catch (error) {
        console.error("❌ FALHA no script de reparo:", error);
    }
}

repairGuard();