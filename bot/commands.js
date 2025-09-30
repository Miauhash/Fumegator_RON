// /var/www/Fumegator/bot/commands.js

const commands = {
  ping: () => 'Pong! Connected',
  socials: () => 'Follow us on all social networks! Twitter: https://x.com/FumegatorP2E, Telegram: https://t.me/Fumegator, Discord: https://discord.gg/9kfJTarXU8',
  whitepaper: () => 'Read all about the project in our Whitepaper: https://fumegator.xyz/whitepaper.pdf',
};

const forbiddenWords = [
  'palavrão1', 'palavrão2', 'fdp', 'vsf', 'scam', 'rug pull', 
  'outroprojeto.com', 'investorscam.net',
  'fud', 'shitcoin', 'lixo', 'merd',
];

const allowedDomains = ['fumegator.xyz', 'twitter.com', 't.me', 'discord.gg', 'magiceden.io'];

function moderateMessage(text) {
  if (!text) return false;
  const lowerCaseText = text.toLowerCase();

  for (const word of forbiddenWords) {
    if (lowerCaseText.includes(word)) {
      console.log(`[MODERAÇÃO] Palavra proibida detectada: "${word}"`);
      return true;
    }
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = lowerCaseText.match(urlRegex);
  if (urls) {
    for (const url of urls) {
      if (!allowedDomains.some(domain => url.includes(domain))) {
        console.log(`[MODERAÇÃO] Link não permitido detectado: ${url}`);
        return true;
      }
    }
  }

  return false;
}

// <<< ESTA É A ÚNICA FUNÇÃO EXPORTADA >>>
export function processMessage(messageText) {
  if (moderateMessage(messageText)) {
    return { action: 'delete', reason: 'Message contained inappropriate content.' };
  }

  if (messageText && messageText.startsWith('!')) {
    const command = messageText.slice(1).toLowerCase().split(' ')[0];
    if (commands[command]) {
      return { action: 'reply', content: commands[command]() };
    }
  }

  return null;
}