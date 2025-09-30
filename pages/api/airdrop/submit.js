// pages/api/airdrop/submit.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  // --- MIGRAÇÃO RONIN: Renomeada a variável de endereço ---
  const { name, email, roninAddress, twitter } = req.body;

  // Validação simples no servidor
  if (!name || !email || !roninAddress) {
    return res.status(400).json({ message: 'Please fill out all required fields.' });
  }

  // Pega a URL do Webhook a partir das variáveis de ambiente
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL is not set in environment variables.");
    return res.status(500).json({ message: 'Server configuration error.' });
  }

  // Cria uma mensagem bonita e formatada (embed) para o Discord
  const embed = {
    color: 0x0099ff, // Uma cor azulada
    title: 'New Airdrop Registration! ✨',
    timestamp: new Date().toISOString(),
    fields: [
      { name: 'Name', value: name, inline: true },
      { name: 'Email', value: email, inline: true },
      // --- MIGRAÇÃO RONIN: Atualizado o título do campo ---
      { name: 'Ronin Wallet', value: `\`${roninAddress}\`` },
      { name: 'Twitter', value: twitter || 'Not provided' },
    ],
  };

  try {
    // Envia a mensagem para o Discord
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    res.status(200).json({ message: 'Submission successful!' });
  } catch (error) {
    console.error('Error sending message to Discord:', error);
    res.status(500).json({ message: 'Failed to submit to Discord.' });
  }
}