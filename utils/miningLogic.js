// utils/miningLogic.js (VERSÃO FINAL E CORRIGIDA PARA PRISMA E ROTAS DINÂMICAS)
import getBaseUrl from './get-base-url';

const BASE_URL = getBaseUrl();

export async function loadGameState(walletAddress) {
  if (!walletAddress) {
    console.error("loadGameState chamado sem walletAddress.");
    return null;
  }
  try {
    // ALTERADO: A URL agora usa o formato de rota dinâmica para corresponder ao arquivo [wallet].js
    const response = await fetch(`${BASE_URL}/api/player/${walletAddress}`);
    
    if (response.status === 404) {
      console.log('Nenhum estado de jogo encontrado para o jogador, um novo será criado.');
      return null;
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro na API ao carregar o estado: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.gameState; // A API Prisma já retorna o objeto 'state' aninhado.

  } catch (error) {
    console.error('Erro crítico em loadGameState:', error);
    return null;
  }
}

export async function saveGameState(walletAddress, gameState) {
  if (!walletAddress || !gameState) {
    console.error("saveGameState chamado sem walletAddress ou gameState.");
    return;
  }
  try {
    // ALTERADO: A URL do POST também usa a rota dinâmica para ser consistente e atingir o endpoint correto.
    const response = await fetch(`${BASE_URL}/api/player/${walletAddress}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // O corpo da requisição continua o mesmo
      body: JSON.stringify({ wallet: walletAddress, gameState }),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro na API ao salvar o estado: ${response.statusText}`);
    }
    
    return await response.json();

  } catch (error) {
    console.error('Erro crítico em saveGameState:', error);
  }
}