// pages/api/proxy.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL é obrigatória" });
  }

  // Validação de segurança: permite buscar de domínios confiáveis de metadados para Ronin.
  // Adicione outros domínios de marketplaces ou APIs de metadados se necessário.
  const targetUrl = decodeURIComponent(url);
  const allowedPrefixes = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://api.mavis.market/', // Exemplo para o marketplace oficial
    // Adicione aqui outros gateways ou APIs de metadados confiáveis
  ];

  if (!allowedPrefixes.some(prefix => targetUrl.startsWith(prefix))) {
    return res.status(400).json({ error: "URL não permitida" });
  }

  try {
    const response = await fetch(targetUrl);

    if (!response.ok) {
      throw new Error(`Falha ao buscar metadados: Status ${response.status}`);
    }

    const data = await response.json();

    // Envia o JSON de volta para o jogo
    res.status(200).json(data);

  } catch (error) {
    console.error(`Erro no proxy para a URL: ${targetUrl}`, error);
    res.status(500).json({ error: "Falha ao buscar metadados do NFT" });
  }
}