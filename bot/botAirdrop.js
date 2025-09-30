// botAirdrop.js (Versão Final convertida para Ronin/Ethers.js)
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const { ethers } = require('ethers'); // Adicionado Ethers.js para transações

const prisma = new PrismaClient();

// --- CONFIGURAÇÃO ---
const AIRDROP_CHANNEL_ID = '1410711671516692490'; // <<< ID do canal agora está aqui
const RONIN_ADDRESS_REGEX = /^ronin:[a-fA-F0-9]{40}$/i; // <<< Regex para carteiras Ronin
// --------------------

// --- Validação das Variáveis de Ambiente ---
if (!process.env.DISCORD_BOT_TOKEN || !process.env.SAIGON_RPC_URL || !process.env.MINTER_PRIVATE_KEY || !process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS) {
    console.error("ERRO FATAL: Uma ou mais variáveis de ambiente essenciais não foram definidas. Verifique seu arquivo .env");
    process.exit(1);
}

// --- Configuração da Conexão com a Blockchain (Ethers.js) ---
const provider = new ethers.JsonRpcProvider(process.env.SAIGON_RPC_URL);
const signerWallet = new ethers.Wallet(process.env.MINTER_PRIVATE_KEY, provider);

// ABI mínima para a função de transferência de um NFT (padrão ERC-721)
const NFT_CONTRACT_ABI = [
  "function safeTransferFrom(address from, address to, uint256 tokenId)"
];

const nftContract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signerWallet);

// --- Configuração do Cliente Discord ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', async () => {
    console.log(`Bot de Airdrop '${client.user.tag}' está online!`);
    console.log(`Conectado como: ${signerWallet.address}`);
    console.log(`Vigiando o canal de Airdrop: ${AIRDROP_CHANNEL_ID}`);
    const balance = await provider.getBalance(signerWallet.address);
    console.log(`Saldo da carteira do bot: ${ethers.formatEther(balance)} RON`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || message.channel.id !== AIRDROP_CHANNEL_ID) {
        return;
    }

    const userInput = message.content.trim();
    
    // <<< Validação de carteira Ronin >>>
    if (!RONIN_ADDRESS_REGEX.test(userInput)) {
        message.reply("Endereço de carteira Ronin inválido. Por favor, envie o endereço completo, começando com `ronin:`.").then(msg => {
            setTimeout(() => { try { msg.delete(); message.delete(); } catch(e) {} }, 10000);
        });
        return;
    }
    
    // Converte o endereço ronin:.. para 0x... para ser usado na transação
    const userWalletAddress = userInput.replace('ronin:', '0x');

    let feedbackMessage = await message.reply("Processando seu pedido... ⏳");

    try {
        const existingClaim = await prisma.airdropClaim.findFirst({
            where: { userWallet: userWalletAddress },
        });

        if (existingClaim) {
            feedbackMessage.edit(`❌ Erro: A carteira \`${userInput}\` já recebeu um airdrop.`);
            return;
        }

        const availableNft = await prisma.nftMintPool.findFirst({
            where: { isMinted: false },
            orderBy: { id: 'asc' },
        });

        if (!availableNft) {
            feedbackMessage.edit("❌ Desculpe, todos os NFTs do airdrop já foram distribuídos!");
            return;
        }
        
        // O tokenId do NFT. Assumindo que o `id` no seu banco de dados corresponde ao `tokenId`.
        const tokenIdToTransfer = availableNft.id;
        
        feedbackMessage.edit(`Encontramos o Especialista #${tokenIdToTransfer}. Enviando para sua carteira... 🚚`);

        // <<< LÓGICA DE TRANSFERÊNCIA ATUALIZADA PARA RONIN/ETHERS >>>
        const tx = await nftContract.safeTransferFrom(signerWallet.address, userWalletAddress, tokenIdToTransfer);
        
        console.log(`Enviando NFT #${tokenIdToTransfer} para ${userWalletAddress}. Hash: ${tx.hash}`);
        await tx.wait(); // Espera a transação ser confirmada na blockchain

        await prisma.$transaction([
            prisma.nftMintPool.update({
                where: { id: availableNft.id },
                data: { isMinted: true, mintedTo: userWalletAddress, mintedAt: new Date() },
            }),
            prisma.airdropClaim.create({
                data: {
                    userWallet: userWalletAddress,
                    // O campo nftMintAddress é legado de Solana, mas vamos preenchê-lo com o tokenId por consistência
                    nftMintAddress: tokenIdToTransfer.toString(), 
                    nftId: availableNft.id,
                },
            }),
        ]);
        
        // <<< Link do explorer atualizado para Saigon Testnet >>>
        const explorerLink = `https://saigon-app.roninchain.com/token/${process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}/instance/${tokenIdToTransfer}`;
        feedbackMessage.edit(`✅ Sucesso! O Especialista #${tokenIdToTransfer} foi enviado. Bem-vindo ao Hospital Fumegator!\n\nVeja seu NFT: ${explorerLink}`);

    } catch (error) {
        console.error("Erro no processo de airdrop:", error);
        feedbackMessage.edit(`❌ Ocorreu um erro inesperado. A equipe de desenvolvimento já foi notificada.`);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);