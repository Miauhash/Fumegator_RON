// pages/game.js (VERSÃO FINAL OTIMIZADA)

import GameComponent from '../components/Game';
import gameConfig from '../lib/gameConfig'; // <<< Importa a configuração diretamente

// Esta função é executada no servidor durante a build do site.
// Ela pega a configuração e a "injeta" na página antes mesmo do usuário a acessar.
export function getStaticProps() {
  return {
    props: {
      // Passamos a configuração importada como uma "prop" para a nossa página.
      initialConfig: gameConfig,
    },
  };
}

// A página agora recebe 'initialConfig' diretamente, sem precisar de loading.
export default function GamePage({ initialConfig }) {
  // Não precisamos mais do useState ou useEffect para carregar a config.
  // O componente do jogo é renderizado imediatamente com os dados prontos.
  return <GameComponent initialConfig={initialConfig} />;
}