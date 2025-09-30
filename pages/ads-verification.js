// pages/ads-verification.js

import Head from 'next/head';

export default function AdsVerificationPage() {
  // Estilos inline para garantir que tudo funcione sem depender de arquivos CSS externos
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#0d1a2a',
    color: '#cdd3d9',
    fontFamily: 'sans-serif',
  };

  const adFrameStyle = {
    border: '1px dashed #4a90e2',
    padding: '1rem',
    backgroundColor: '#08121e',
  };

  const iframeStyle = {
    border: 0,
    padding: 0,
    width: '300px', // Um tamanho fixo e comum para verificação
    height: '250px',
    overflow: 'hidden',
    display: 'block',
  };

  return (
    <>
      <Head>
        <title>Ad Verification</title>
        <meta name="robots" content="noindex" /> {/* Impede que o Google indexe esta página */}
      </Head>
      <div style={containerStyle}>
        <h1>Ad Verification Page</h1>
        <p>This page is used for ad network verification purposes only.</p>
        <div style={adFrameStyle}>
          {/* Este é o código exato que a A-ADS procura */}
          <iframe 
            data-aa='2408589' 
            src='//acceptable.a-ads.com/2408589/?size=300x250' // Usando um tamanho fixo para garantir a visibilidade
            style={iframeStyle}
          ></iframe>
        </div>
      </div>
    </>
  );
}