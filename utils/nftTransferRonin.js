// utils/nftTransferRonin.js (NOVO ARQUIVO)

import { ethers } from 'ethers';

// Configurações da Ronin
const RONIN_CLUSTER = process.env.RONIN_CLUSTER || "saigon";
const RPC_URL = RONIN_CLUSTER === 'mainnet'
    ? 'https://api.roninchain.com/rpc'
    : 'https://saigon-testnet.roninchain.com/rpc';

// ABI (Application Binary Interface) mínima para um NFT ERC-721
const ERC721_ABI = [
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
];

// Esta função será chamada pelas suas APIs de backend (claim, buy-mystic, etc.)
export async function transferNftFromGameWallet(destinationWalletAddress, nftContractAddress, nftTokenId) {
    console.log(`Iniciando transferência do NFT (Contrato: ${nftContractAddress}, ID: ${nftTokenId}) para ${destinationWalletAddress}`);

    // 1. Carregar a chave privada da carteira "cofre" do jogo.
    const gameWalletPrivateKey = process.env.GAME_WALLET_PRIVATE_KEY; 
    if (!gameWalletPrivateKey) {
        throw new Error("A chave privada da carteira do jogo (GAME_WALLET_PRIVATE_KEY) não está configurada no .env");
    }
    
    // 2. Conectar-se à rede Ronin e criar uma instância da carteira do jogo
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const gameWallet = new ethers.Wallet(gameWalletPrivateKey, provider);

    // 3. Criar uma instância do contrato do NFT
    const nftContract = new ethers.Contract(nftContractAddress, ERC721_ABI, gameWallet);

    try {
        // 4. Executar a transferência chamando a função 'safeTransferFrom' do contrato
        console.log(`De: ${gameWallet.address}, Para: ${destinationWalletAddress}, TokenID: ${nftTokenId}`);
        const tx = await nftContract.safeTransferFrom(
            gameWallet.address,          // De (a própria carteira do jogo)
            destinationWalletAddress,    // Para (o jogador)
            nftTokenId                   // O ID do token a ser transferido
        );

        // 5. Esperar a transação ser confirmada na blockchain
        await tx.wait();

        console.log(`Transferência bem-sucedida! Hash da transação: ${tx.hash}`);
        return tx.hash; // Retorna o hash da transação em caso de sucesso

    } catch (error) {
        console.error("Falha na transferência do NFT:", error);
        // Lança o erro para que a API que chamou possa tratá-lo
        const errorMessage = error.reason || error.message;
        throw new Error(`Falha ao transferir o NFT de recompensa: ${errorMessage}`); 
    }
}