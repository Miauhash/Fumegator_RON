// pages/_document.js (VERSÃO FINAL E CORRETA PARA VERIFICAÇÃO)

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Outras tags globais que você possa ter no Head, como fontes, etc. */}

        {/* 
          <<< TAG DE VERIFICAÇÃO DO ADSENSE ADICIONADA AQUI >>>
          Este é o local perfeito, pois o robô do Google lerá esta tag
          no HTML inicial de qualquer página do seu site.
        */}
        <meta name="google-adsense-account" content="ca-pub-8822559687614116"></meta>
        
        {/* O script de anúncio ainda é necessário para exibir os anúncios, 
            mas para a verificação, a meta tag é suficiente. 
            Podemos adicionar o script de volta depois que o site for verificado, se necessário.
        */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}