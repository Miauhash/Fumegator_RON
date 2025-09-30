// /var/www/Fumegator/bot/index.js

import dotenv from 'dotenv';
import path from 'path';
import { startDiscordBot, sendToDiscordChannel } from './discordClient.js';
import { startTelegramBot, sendToTelegramChannel } from './telegramClient.js';

// Carrega as variáveis de ambiente do arquivo .env na raiz do projeto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Iniciando Bots Gerenciadores...');

startDiscordBot();
startTelegramBot();

// Exemplo de como você poderia usar uma função de anúncio
function broadcast(message) {
    console.log(`Transmitindo a mensagem: "${message}"`);
    // Envie para o canal de anúncios do Discord
    sendToDiscordChannel('SEU_ID_DE_CANAL_DISCORD_AQUI', message);
    // Envie para o canal de anúncios do Telegram (use @username do canal ou ID)
    sendToTelegramChannel('@SEU_CANAL_TELEGRAM_AQUI', message);
}

// Exemplo de uso: transmitir uma mensagem a cada hora
// setInterval(() => {
//     broadcast("Lembrete: O evento semanal termina em 24 horas!");
// }, 3600000); // 1 hora