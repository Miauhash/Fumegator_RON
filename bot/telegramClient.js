// /var/www/Fumegator/bot/telegramClient.js

import TelegramBot from 'node-telegram-bot-api';
import { processMessage } from './commands.js';

let bot;

export function startTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  bot = new TelegramBot(token, { polling: true });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text) return;

    const result = processMessage(msg.text);

    if (result) {
      if (result.action === 'delete') {
        try {
          bot.deleteMessage(chatId, msg.message_id);
          console.log(`[TELEGRAM] Message from ${msg.from.username} deleted for: ${result.reason}`);
          bot.sendMessage(chatId, `A message from @${msg.from.username} was removed for violating community rules.`);
        } catch (err) {
          console.error('[TELEGRAM] Failed to delete message.', err);
        }
      } else if (result.action === 'reply') {
        bot.sendMessage(chatId, result.content);
      }
    }
  });
  
  console.log('[TELEGRAM] Bot started and polling for messages...');
}

export function sendToTelegramChannel(chatId, message) {
    if (!bot) return;
    bot.sendMessage(chatId, message);
}