// pages/api/withdraw.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)

import prisma from '../../lib/prisma';
import { rateLimiter } from '../../lib/rate-limiter';
import { ethers } from 'ethers';

// --- MIGRAÇÃO RONIN: Configurações da Ronin Testnet (Saigon) ---
const RONIN_CLUSTER = process.env.RONIN_CLUSTER || "saigon";
const RPC_URL = RONIN_CLUSTER === 'mainnet'
    ? 'https://api.roninchain.com/rpc'
    : 'https://saigon-testnet.roninchain.com/rpc';

// --- MIGRAÇÃO RONIN: Endereços dos contratos dos seus tokens ERC-20 na Ronin ---
// ATENÇÃO: Estes são endereços de exemplo. Você deve substituí-los pelos endereços
// reais dos seus contratos de token após fazê-los na Ronin.
const TOKEN_CONTRACT_ADDRESSES = {
  INSULINE: "0x...",
  ZOLGENSMA: "0x...",
  LUXUTURNA: "0x...",
  ZYNTEGLO: "0x...",
  VIDA: "0x...",
};

// --- MIGRAÇÃO RONIN: ABI (Application Binary Interface) mínima para um token ERC-20 ---
// Esta é a "linguagem" que o Ethers.js usa para falar com o contrato do token.
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

// Função auxiliar para converter um número float para a menor unidade do token (ex: wei)
function toBaseUnits(amountFloat, decimals) {
  if (!Number.isFinite(amountFloat)) return ethers.BigNumber.from(0);
  // Ethers.js tem uma função utilitária para isso, que é mais segura.
  return ethers.utils.parseUnits(amountFloat.toString(), decimals);
}

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const { wallet, tokenKey } = req.body;
    const tokenContractAddress = TOKEN_CONTRACT_ADDRESSES[tokenKey];
    if (!wallet || !tokenKey || !tokenContractAddress) {
      return res.status(400).json({ ok: false, error: "Dados inválidos ou token desconhecido" });
    }

    const db = await prisma.gameState.findUnique({ where: { wallet } });
    const state = db?.state;

    if (!db || !state?.balances) {
      return res.status(404).json({ ok: false, error: "Usuário ou saldos não encontrados" });
    }
    
    const currentBalance = Number(state.balances[tokenKey] || 0);
    if (currentBalance < 10) {
      return res.status(400).json({ ok: false, error: "Saque mínimo é 10 tokens" });
    }
    
    // --- MIGRAÇÃO RONIN: Usar a chave privada da carteira do jogo no formato EVM (começa com 0x)
    const gameWalletPrivateKey = process.env.GAME_WALLET_PRIVATE_KEY;
    if (!gameWalletPrivateKey) {
        throw new Error("Carteira do jogo não configurada no servidor.");
    }

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const gameWallet = new ethers.Wallet(gameWalletPrivateKey, provider);
    const tokenContract = new ethers.Contract(tokenContractAddress, ERC20_ABI, gameWallet);

    const decimals = await tokenContract.decimals();
    const amountBaseUnits = toBaseUnits(currentBalance, decimals);

    if (amountBaseUnits.isZero()) {
      return res.status(400).json({ ok: false, error: "Saldo insuficiente" });
    }

    // Executa a transação de transferência do token ERC-20
    const tx = await tokenContract.transfer(wallet, amountBaseUnits);
    
    // Opcional, mas recomendado: esperar a transação ser confirmada
    await tx.wait();

    // Zera o saldo no banco de dados
    state.balances[tokenKey] = 0;
    await prisma.gameState.update({ where: { wallet }, data: { state } });

    // Salva o registro da transação
    await prisma.withdrawTransaction.create({
        data: {
            wallet: wallet,
            token: tokenKey,
            amount: currentBalance,
            signature: tx.hash, // O 'hash' da transação é a assinatura no mundo EVM
        }
    });
    
    const explorerLink = `https://app.roninchain.com/tx/${tx.hash}`;
    return res.status(200).json({ ok: true, signature: tx.hash, explorerLink });

  } catch (e) {
    console.error("[ERRO NA API DE WITHDRAW]", e);
    // Ethers.js fornece mensagens de erro mais detalhadas
    const errorMessage = e.reason || e.message || "Erro interno no servidor";
    return res.status(500).json({ ok: false, error: errorMessage });
  }
}

export default rateLimiter(5, 10 * 60 * 1000)(handler);