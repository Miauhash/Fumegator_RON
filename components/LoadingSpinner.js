// components/LoadingSpinner.js (VERSÃO FINAL com Animação de Sprite e Barra Ativa)

import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/LoadingSpinner.module.css';
import { loadingTips } from '../lib/loading-tips';

export default function LoadingSpinner({ message }) {
  const [tip, setTip] = useState(null);
  const [progress, setProgress] = useState(0); // Novo estado para o progresso real

  const pickNewTip = useCallback(() => {
    let newTip = tip;
    if (loadingTips.length > 1) {
      while (newTip === tip) {
        newTip = loadingTips[randomIndex];
      }
    }
    setTip(newTip);
  }, [tip]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * loadingTips.length);
    setTip(loadingTips[randomIndex]);

    // Simula o progresso do carregamento.
    // Em um jogo real, você poderia atualizar isso com base no carregamento de assets.
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) { // Deixa o final para quando o jogo realmente carregar
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 5; // Adiciona um progresso irregular
      });
    }, 400);

    return () => clearInterval(progressInterval);
  }, []);

  const handleClick = () => {
    pickNewTip();
  };

  return (
    <div className={styles.gibiContainer} onClick={handleClick}>
      
      {/* O painel de dicas, agora posicionado no centro */}
      <div className={styles.gibiPanel}>
        {tip && (
          <div key={tip.title} className={styles.dialogueBox}>
            <div className={styles.dialogueTitle}>{tip.title}</div>
            <p className={styles.dialogueText}>{tip.text}</p>
          </div>
        )}
        <div className={styles.clickPrompt}>
            Click for another tip...
        </div>
      </div>

      {/* A animação de corrida e a barra de progresso, agora no fundo */}
      <div className={styles.animationTrack}>
        {/* Container para o sprite que será animado */}
        <div className={styles.spriteContainer}>
            <div className={styles.runningMascot}></div>
        </div>
        <div className={styles.loadingBarContainer}>
            <div className={styles.loadingBarFill} style={{ width: `${progress}%` }}></div>
        </div>
        <p className={styles.loadingMessage}>{message || "Loading Game Data..."}</p>
      </div>

    </div>
  );
}