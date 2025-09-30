// components/SlotMachine.js

import { useState, useEffect } from 'react';
import styles from '../styles/SlotMachine.module.css';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const TREASURY_ADDRESS = new PublicKey('BZWxW8oAnRQeFxEoyvFjdeP3Gg1U8nSyzKajJzCsjdf');

// A mesma lista de prêmios de antes. A ordem aqui é importante.
const prizes = [
  { name: '10 INSU', type: 'TOKEN', value: 10, token: 'INSULINE', weight: 40000, icon: '/img/prizes/prize_0.png' },
  { name: '5 ZOLG', type: 'TOKEN', value: 5, token: 'ZOLGENSMA', weight: 30000, icon: '/img/prizes/prize_1.png' },
  { name: '50 INSU', type: 'TOKEN', value: 50, token: 'INSULINE', weight: 10000, icon: '/img/prizes/prize_2.png' },
  { name: '3 LUXU', type: 'TOKEN', value: 3, token: 'LUXUTURNA', weight: 15000, icon: '/img/prizes/prize_3.png' },
  { name: '1 ZYNT', type: 'TOKEN', value: 1, token: 'ZYNTEGLO', weight: 4999, icon: '/img/prizes/prize_4.png' },
  { name: '1 VIDA', type: 'TOKEN', value: 1, token: 'VIDA', weight: 1000, icon: '/img/prizes/prize_5.png' },
  { name: '1 NFT RARO', type: 'NFT', value: 'ID_DO_NFT_RARO', weight: 1, icon: '/img/prizes/prize_6.png' },
];

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

// Gera uma lista embaralhada de ícones para preencher os rolos
const generateReelStrip = () => {
    let strip = [];
    for (let i = 0; i < 5; i++) { // Repete os ícones várias vezes
        strip = strip.concat([...prizes].sort(() => 0.5 - Math.random()));
    }
    return strip;
};

export default function SlotMachine({ 
  onPrizeWon, spinCostSol, isPriceLoading, solConnection,
  userWallet, solBalanceLamports, onTransactionSuccess, showNotification
}) {
  const [spinning, setSpinning] = useState(false);
  const [resultIndexes, setResultIndexes] = useState([0, 0, 0]); // Posição de cada um dos 3 rolos
  const [reelStrips, setReelStrips] = useState([]);
  const [canSpin, setCanSpin] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Gera os rolos uma vez quando o componente é montado
  useEffect(() => {
    setReelStrips([generateReelStrip(), generateReelStrip(), generateReelStrip()]);
  }, []);
  
  // Lógica de cooldown (copiada e adaptada)
  useEffect(() => { /* ... (a mesma lógica de cooldown do FortuneWheel) ... */ }, [spinning]);

  const handleSpin = async () => {
    if (!canSpin || spinning || !userWallet || !solConnection || !spinCostSol) return;
    const costInLamports = Math.ceil(spinCostSol * LAMPORTS_PER_SOL);
    if (solBalanceLamports < costInLamports) {
      showNotification("Saldo de SOL insuficiente para jogar.", "error");
      return;
    }

    setSpinning(true);

    try {
      const wallet = window.solana;
      if (!wallet.publicKey) throw new Error("Carteira Phantom não está conectada.");
      
      const transaction = new Transaction().add(SystemProgram.transfer({
        fromPubkey: wallet.publicKey, toPubkey: TREASURY_ADDRESS, lamports: costInLamports,
      }));
      const { blockhash } = await solConnection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await solConnection.sendRawTransaction(signedTransaction.serialize());
      await solConnection.confirmTransaction(signature, 'confirmed');

      if (onTransactionSuccess) onTransactionSuccess(userWallet);

      // Escolhe o prêmio vencedor
      const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
      let randomNum = Math.random() * totalWeight;
      let winningIndex = -1;
      for (let i = 0; i < prizes.length; i++) {
        randomNum -= prizes[i].weight;
        if (randomNum <= 0) { winningIndex = i; break; }
      }

      // Define o resultado para os 3 rolos
      setResultIndexes([
        Math.floor(Math.random() * prizes.length), // Rolo 1 aleatório
        winningIndex,                              // Rolo 2 é o prêmio real
        Math.floor(Math.random() * prizes.length), // Rolo 3 aleatório
      ]);
      
      setTimeout(() => {
        setSpinning(false);
        onPrizeWon(prizes[winningIndex]);
        localStorage.setItem('lastSpinTimestamp', Date.now().toString());
        setCanSpin(false);
      }, 4000); // Duração da animação em CSS

    } catch (error) {
      console.error("Falha na transação da roleta:", error);
      showNotification("Ocorreu um erro ao processar o pagamento.", "error");
      setSpinning(false);
    }
  };
  
  const getButtonText = () => { /* ... (mesma lógica do FortuneWheel) ... */ };

  return (
    <div className={styles.slotMachineContainer}>
      <div className={styles.reelsWindow}>
        {reelStrips.map((strip, reelIndex) => (
          <div key={reelIndex} className={styles.reel}>
            <div 
              className={`${styles.reelStrip} ${spinning ? styles.spinning : ''}`}
              style={{ transform: !spinning ? `translateY(-${resultIndexes[reelIndex] * 80}px)` : '' }}
            >
              {strip.map((prize, i) => (
                <div key={i} className={styles.symbol}>
                  <img src={prize.icon} alt={prize.name} style={{ imageRendering: 'pixelated' }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.controls}>
        <div className={styles.priceDisplay}>Custo: {isPriceLoading ? '...' : spinCostSol ? `${spinCostSol.toFixed(4)} SOL` : 'N/A'}</div>
        <button onClick={handleSpin} disabled={!canSpin || spinning || isPriceLoading || !spinCostSol} className={styles.leverHandle}>
          Girar
        </button>
      </div>
    </div>
  );
}