// components/HorizontalWheel.js (VERSÃO FINAL CORRIGIDA COM EFEITOS)

import { useState, useMemo, useCallback } from 'react';
import styles from '../styles/HorizontalWheel.module.css';
import { ethers } from 'ethers';
import { t } from '../lib/i18n';
import ParticleEffect from './ParticleEffect'; // <<< IMPORTA O COMPONENTE DE PARTÍCULAS

const TREASURY_ADDRESS_FROM_ENV = process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS_RONIN;

const prizes = [
  { id: 'insuline_1', name: '1 INSU', type: 'TOKEN', value: 1, token: 'INSULINE', weight: 50000, color: '#a4a4a4' },
  { id: 'zolgensma_0.005',  name: '0.005 ZOLG',  type: 'TOKEN', value: 0.005,  token: 'ZOLGENSMA', weight: 20000, color: '#3c8f47' },
  { id: 'insuline_3', name: '3 INSU', type: 'TOKEN', value: 3, token: 'INSULINE', weight: 10000, color: '#a4a4a4' },
  { id: 'luxuturna_0.3',  name: '0.3 LUXU',  type: 'TOKEN', value: 0.3,  token: 'LUXUTURNA', weight: 15000, color: '#3978c7' },
  { id: 'zynteglo_0.19',  name: '0.19 ZYNT',  type: 'TOKEN', value: 0.19,  token: 'ZYNTEGLO', weight: 4989, color: '#8d47be' },
  { id: 'vida_1',  name: '1 VIDA',  type: 'TOKEN', value: 1,  token: 'VIDA', weight: 10, color: '#f5b040' },
  { id: 'nft_raro_1', name: '1 NFT RARO', type: 'NFT', value: 'DCDX8KJ89umMytjUzCNfv7AEKiD6Y5e6ZionjBak28QP', weight: 1, color: '#3978c7' },
];

export default function HorizontalWheel({ 
  onPrizeWon, spinCostRon, isPriceLoading, 
  userAddress, signer, onTransactionSuccess, showNotification,
  freeSpins, onUseFreeSpin, lang
}) {
  const [spinning, setSpinning] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [finalPosition, setFinalPosition] = useState(0);
  const extendedPrizes = useMemo(() => [...Array(20)].flatMap(() => prizes), []);

  // <<< NOVOS ESTADOS PARA CONTROLAR OS EFEITOS VISUAIS >>>
  const [showParticles, setShowParticles] = useState(false);
  const [isWheelVisible, setIsWheelVisible] = useState(true);

  // Função chamada quando a animação de partículas termina
  const handleParticleAnimationEnd = useCallback(() => {
    setShowParticles(false); // Esconde as partículas
    setFinalPosition(0);     // <<< PONTO CHAVE DA CORREÇÃO: Reseta a posição da roleta
    setIsWheelVisible(true); // Reexibe a roleta, agora na posição inicial
  }, []);

  const spinTheWheel = useCallback((winningIndex) => {
    const winningPrize = prizes[winningIndex];
    const baseIndex = prizes.findIndex(p => p.id === winningPrize.id);
    const targetItemIndex = Math.floor(extendedPrizes.length * 0.8) + baseIndex;
    const itemWidth = 120;
    const randomOffset = (Math.random() - 0.5) * (itemWidth * 0.8);
    const newFinalPosition = (targetItemIndex * itemWidth) + randomOffset;
    
    setFinalPosition(newFinalPosition);
    setSpinning(true);

    // Quando o giro termina, a sequência de efeitos é iniciada
    setTimeout(() => {
      setSpinning(false);
      onPrizeWon(winningPrize);
      setIsWheelVisible(false); // Esconde a roleta
      setShowParticles(true);   // Mostra a explosão de partículas
    }, 6000); // Duração da animação de giro
  }, [extendedPrizes, onPrizeWon]);
  
  const handlePayment = useCallback(async () => {
    if (!signer) throw new Error("Assinante da carteira não encontrado.");
    const formattedTreasuryAddress = TREASURY_ADDRESS_FROM_ENV.replace('ronin:', '0x');
    const transactionValue = ethers.utils.parseEther(spinCostRon.toString());
    const transaction = { to: formattedTreasuryAddress, value: transactionValue };
    const txResponse = await signer.sendTransaction(transaction);
    await txResponse.wait();
    return true;
  }, [signer, spinCostRon]);

  const handleSpin = useCallback(async () => {
    // Impede novo giro se a roleta não estiver visível (durante o efeito de partículas)
    if (spinning || isConfirming || !isWheelVisible) return;

    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
    let randomNum = Math.random() * totalWeight;
    let winningIndex = -1;
    for (let i = 0; i < prizes.length; i++) {
      randomNum -= prizes[i].weight;
      if (randomNum <= 0) { winningIndex = i; break; }
    }

    if (freeSpins > 0) {
      onUseFreeSpin();
      spinTheWheel(winningIndex);
      return;
    }
    
    if (!signer || !userAddress) return showNotification(t('connect_wallet_to_spin', lang), 'error');
    if (typeof spinCostRon !== 'number' || spinCostRon <= 0) return showNotification(t('spin_cost_error', lang), "error");
    if (!TREASURY_ADDRESS_FROM_ENV) return showNotification("Erro de configuração do servidor.", "error");

    setIsConfirming(true);
    try {
      const paymentSuccessful = await handlePayment();
      if (paymentSuccessful) {
        if (onTransactionSuccess) onTransactionSuccess();
        spinTheWheel(winningIndex);
      }
    } catch (error) {
      console.error("[Roleta] ERRO CAPTURADO:", error);
      showNotification(t('transaction_rejected', lang), "error");
    } finally {
      setIsConfirming(false);
    }
  }, [spinning, isConfirming, freeSpins, onUseFreeSpin, spinTheWheel, handlePayment, onTransactionSuccess, showNotification, t, userAddress, signer, spinCostRon, isWheelVisible]);

  const getButtonText = () => {
    if (isConfirming) return t('confirming_spin', lang);
    if (spinning) return t('spinning', lang);
    if (freeSpins > 0) return `${t('spin_free', lang)} (${freeSpins})`;
    if (isPriceLoading) return t('loading_price', lang);
    if (spinCostRon) return t('spin_for_ron', lang, { cost: spinCostRon.toFixed(4) });
    return t('unavailable', lang);
  };
  
  // Estilo dinâmico para a faixa de prêmios
  const stripStyle = {
    transform: `translateX(-${finalPosition}px)`,
    transition: `
        ${spinning ? `transform 6s cubic-bezier(0.26, 1, 0.45, 1)` : 'none'},
        opacity 0.3s ease-out
    `,
    opacity: isWheelVisible ? 1 : 0, // Controla a visibilidade da roleta
  };

  return (
    <div className={styles.wheelContainer}>
      {/* Renderiza o efeito de partículas quando ativado */}
      {showParticles && <ParticleEffect onAnimationEnd={handleParticleAnimationEnd} />}

      <div className={styles.track}>
        <div className={styles.pointer}></div>
        <div className={styles.strip} style={stripStyle}>
          {extendedPrizes.map((prize, index) => (
            <div key={index} className={styles.prizeItem} style={{ borderBottomColor: prize.color }}>
              <span>{prize.name}</span>
            </div>
          ))}
        </div>
      </div>
      <button 
        onClick={handleSpin} 
        disabled={spinning || isConfirming || isPriceLoading || !userAddress || !isWheelVisible}
        className={styles.spinButton}
      >
        {getButtonText()}
      </button>
    </div>
  );
}