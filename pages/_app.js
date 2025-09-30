// pages/_app.js (VERSÃO FINAL com Autoplay da Música)
import React, { useRef, useState, useEffect } from 'react'; // <<< MUDANÇA: Importado o useEffect
import { RoninProvider } from '../context/RoninContext';
import '../styles/globals.css';
import { FaPlay, FaPause } from 'react-icons/fa';

import musicStyles from '../styles/MusicPlayer.module.css';

const saigonChain = {
  chainId: '0x7e5',
  chainName: 'Saigon Testnet',
  nativeCurrency: { name: 'Saigon RON', symbol: 'RON', decimals: 18 },
  rpcUrls: ['https://saigon-testnet.roninchain.com/rpc'],
  blockExplorerUrls: ['https://saigon-explorer.roninchain.com/'],
};

function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(true); // <<< MUDANÇA: Começa como true
  const audioRef = useRef(null);

  // <<< MUDANÇA: useEffect para iniciar a música no carregamento >>>
  useEffect(() => {
    const audio = audioRef.current;
    // Tenta tocar a música. O .catch() evita erros caso o navegador bloqueie o autoplay
    audio.play().catch(error => {
      console.warn("Autoplay da música foi bloqueado pelo navegador. O usuário precisará iniciar manualmente.", error);
      setIsPlaying(false); // Se for bloqueado, atualiza o ícone para 'Play'
    });
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <audio ref={audioRef} src="/music/background-music.mp3" loop />
      <button className={musicStyles.musicToggle} onClick={toggleMusic} aria-label="Toggle Music">
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
    </>
  );
}

function MyApp({ Component, pageProps }) {
    return (
        <RoninProvider chain={saigonChain}>
            <Component {...pageProps} />
            <MusicPlayer />
        </RoninProvider>
    );
}

export default MyApp;