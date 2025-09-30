// context/RoninContext.js (VERSÃO FINAL E CORRIGIDA)

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';

// Criando o contexto
const RoninContext = createContext();

// Definições de rede para fácil manutenção
const SAIGON_NETWORK = {
  chainId: '0x7e5', // 2021 em hexadecimal
  chainName: 'Ronin Saigon Testnet',
  rpcUrls: ['https://saigon-testnet.roninchain.com/rpc'],
  nativeCurrency: { name: 'RON', symbol: 'RON', decimals: 18 },
  blockExplorerUrls: ['https://saigon-explorer.roninchain.com/'],
};

const MAINNET_NETWORK = {
  chainId: '0x7e4', // 2020 em hexadecimal
  chainName: 'Ronin Mainnet',
  rpcUrls: ['https://api.roninchain.com/rpc'],
  nativeCurrency: { name: 'RON', symbol: 'RON', decimals: 18 },
  blockExplorerUrls: ['https://app.roninchain.com/'],
};

// Componente Provedor
export function RoninProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Função para conectar a carteira
  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!window.ronin || !window.ronin.provider) {
        throw new Error('Por favor, instale a Ronin Wallet.');
      }

      // Conecta ao provedor da carteira no navegador
      const web3Provider = new ethers.providers.Web3Provider(window.ronin.provider, 'any');

      // Solicita ao usuário para conectar sua conta
      await web3Provider.send('eth_requestAccounts', []);

      const currentSigner = web3Provider.getSigner();
      const address = await currentSigner.getAddress();
      const net = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(currentSigner);
      setUserAddress(address);
      setNetwork(net);

    } catch (error) {
      console.error("Falha ao conectar a carteira Ronin:", error);
      // Limpa o estado em caso de erro na conexão
      disconnectWallet();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para desconectar
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setUserAddress(null);
    setNetwork(null);
  };

  // Efeito para lidar com mudanças de conta ou rede
  useEffect(() => {
    const roninProvider = window.ronin?.provider;
    if (roninProvider) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          // Recarrega a página para reiniciar o estado do jogo com a nova conta
          window.location.reload();
        }
      };
      
      const handleChainChanged = () => {
        // Recarrega para obter o novo provider e informações da rede
        window.location.reload();
      };

      roninProvider.on('accountsChanged', handleAccountsChanged);
      roninProvider.on('chainChanged', handleChainChanged);

      return () => {
        roninProvider.removeListener('accountsChanged', handleAccountsChanged);
        roninProvider.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const value = {
    provider,
    signer,
    userAddress,
    network,
    isLoading,
    connectWallet,
    disconnectWallet,
  };

  return <RoninContext.Provider value={value}>{children}</RoninContext.Provider>;
}

// Hook customizado para usar o contexto facilmente
export const useRonin = () => {
  return useContext(RoninContext);
};