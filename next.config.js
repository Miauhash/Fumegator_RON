// next.config.js (VERSÃO FINAL com permissão para o GitHub)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: buildCsp(),
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

function buildCsp() {
  const policies = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'connect-src': [
      "'self'",
      'api.coingecko.com',
      'api.saigon.mavis.market', 
      'api.mavis.market',
      'saigon-testnet.roninchain.com',
      'api.roninchain.com',
      'rpc.ankr.com',
      '*.walletconnect.com',
      '*.walletconnect.org',
      // <<< ADIÇÃO IMPORTANTE AQUI >>>
      'raw.githubusercontent.com', // Permite que o jogo busque os metadados do GitHub
    ],
    'style-src': [
      "'self'", 
      "'unsafe-inline'", 
      'fonts.googleapis.com'
    ],
    'font-src': [
      "'self'", 
      'fonts.gstatic.com'
    ],
    // <<< ADIÇÃO IMPORTANTE AQUI >>>
    // A imagem do seu NFT vem do githubusercontent, então precisamos permitir aqui também.
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'storage.googleapis.com',
      'raw.githubusercontent.com', // Permite que as imagens dos NFTs sejam carregadas
      'https:', 
    ],
    'frame-src': ["'self'", '*.walletconnect.com', '*.walletconnect.org'],
  };

  return Object.entries(policies)
    .map(([key, value]) => `${key} ${value.join(' ')}`)
    .join('; ');
}

module.exports = nextConfig;