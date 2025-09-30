// /var/www/Fumegator/bot/discordClient.js

import { Client, Intents } from 'discord.js';
import { processMessage } from './commands.js';

let client;

export function startDiscordBot() {
  client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

  client.on('ready', () => {
    console.log(`[DISCORD] Bot logged in as ${client.user.tag}!`);
  });

  client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const result = processMessage(message.content);

    if (result) {
      if (result.action === 'delete') {
        try {
          await message.delete();
          console.log(`[DISCORD] Message from ${message.author.tag} deleted for: ${result.reason}`);
          message.author.send(`Your message on the Fumegator server was removed for containing inappropriate content. Please respect the community rules.`);
        } catch (err) {
          console.error('[DISCORD] Failed to delete message (do I have permissions?)', err);
        }
      } else if (result.action === 'reply') {
        message.channel.send(result.content);
      }
    }
  });

  client.login(process.env.DISCORD_BOT_TOKEN);
  console.log('[DISCORD] Starting client...');
}

export function sendToDiscordChannel(channelId, message) {
    if (!client) return;
    const channel = client.channels.cache.get(channelId);
    if (channel) {
        channel.send(message);
    } else {
        console.error(`[DISCORD] Channel with ID ${channelId} not found.`);
    }
}