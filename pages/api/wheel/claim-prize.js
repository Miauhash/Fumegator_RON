import { ethers } from 'ethers';
import { getFumegatorTokensContract, TOKEN_IDS } from '../../../lib/contracts';

// --- CONFIGURAÇÃO DE SEGURANÇA E AMBIENTE ---
const RONIN_RPC_URL = process.env.NEXT_PUBLIC_RONIN_RPC_URL; 
const TREASURY_WALLET_PRIVATE_KEY = process.env.TREASURY_WALLET_PRIVATE_KEY; 

// Validação de configuração inicial
if (!RONIN_RPC_URL || !TREASURY_WALLET_PRIVATE_KEY) {
    // Este log aparecerá no console do seu servidor se as variáveis não estiverem definidas
    console.error("ERRO FATAL: Variáveis de ambiente RONIN_RPC_URL ou TREASURY_WALLET_PRIVATE_KEY não estão configuradas no .env.local!");
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Adicionado um log para ver o corpo da requisição
    console.log('[API /claim-prize] Requisição recebida. Corpo:', req.body);

    try {
        // Reinicializa o provedor e a carteira dentro do handler para garantir que sempre estejam atualizados
        const provider = new ethers.providers.JsonRpcProvider(RONIN_RPC_URL);
        const treasuryWallet = new ethers.Wallet(TREASURY_WALLET_PRIVATE_KEY, provider);

        const { wallet, prizeToken, prizeAmount } = req.body;

        // --- VALIDAÇÕES DE SEGURANÇA ---
        if (!wallet || !prizeToken || !prizeAmount) {
            console.error('[API /claim-prize] Erro: Dados ausentes na requisição.', req.body);
            return res.status(400).json({ message: 'Dados inválidos na requisição.' });
        }
        if (!TOKEN_IDS[prizeToken]) {
            console.error(`[API /claim-prize] Erro: Tipo de token inválido: ${prizeToken}`);
            return res.status(400).json({ message: 'Tipo de token inválido.' });
        }
        
        console.log(`[API] Requisição para reivindicar prêmio validada: ${prizeAmount} ${prizeToken} para ${wallet}`);

        // --- LÓGICA DA TRANSAÇÃO ON-CHAIN ---
        const contract = getFumegatorTokensContract(treasuryWallet);
        const tokenId = TOKEN_IDS[prizeToken];
        
        const amountInWei = ethers.utils.parseUnits(prizeAmount.toString(), 18);
        const recipientAddress = wallet.replace('ronin:', '0x');
        const fromAddress = await treasuryWallet.getAddress();
        
        console.log(`[API] Executando transferência: Do tesouro (${fromAddress}) para ${recipientAddress}`);
        console.log(`[API] Detalhes: Token ID ${tokenId}, Quantidade (wei) ${amountInWei.toString()}`);
        
        const tx = await contract.safeTransferFrom(
            fromAddress,
            recipientAddress,
            tokenId,
            amountInWei,
            '0x'
        );

        console.log(`[API] Transação enviada com hash: ${tx.hash}. Aguardando confirmação...`);
        await tx.wait();
        console.log(`[API] Transação confirmada com sucesso!`);
        
        res.status(200).json({ success: true, message: 'Prêmio reivindicado com sucesso!', transactionHash: tx.hash });

    } catch (error) {
        console.error("[API /claim-prize] ERRO CRÍTICO DURANTE A EXECUÇÃO:", error);
        // Retorna o erro real como JSON para facilitar a depuração no frontend
        res.status(500).json({ message: 'Erro no servidor ao processar o prêmio.', error: error.message });
    }
}