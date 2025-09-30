// components/Events.js

import { useState, useEffect } from 'react';
import { loadGameState } from '../utils/miningLogic';
import styles from '../styles/FeaturePage.module.css';

export default function EventsComponent() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [userWallet, setUserWallet] = useState(null);
  const [userBalances, setUserBalances] = useState({});
  const [contributionAmount, setContributionAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const savedWallet = localStorage.getItem("user_wallet");
    if (savedWallet) {
      setUserWallet(savedWallet);
    } else {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // CORRIGIDO: Chamando a nova API '/api/events/current'
        const eventRes = await fetch('/api/events/current');
        if (eventRes.ok) {
          const { event } = await eventRes.json(); // Desestruturando para pegar o objeto 'event'
          setActiveEvent(event);
        }

        if (userWallet) {
          const gameState = await loadGameState(userWallet);
          if (gameState && gameState.balances) {
            setUserBalances(gameState.balances);
          }
        }
      } catch (err) {
        setError('Falha ao carregar dados do evento.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userWallet]);

  const handleContribute = async (e) => {
    e.preventDefault();
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Por favor, insira um valor válido.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // CORRIGIDO: A API de progresso é '/api/events/progress'
      const res = await fetch('/api/events/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: userWallet,
          eventId: activeEvent.id,
          progressAmount: amount, // O nome do campo é progressAmount
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      
      setSuccess('Obrigado pela sua contribuição!');
      setActiveEvent(prev => ({ ...prev, currentAmount: prev.currentAmount + amount }));
      setUserBalances(prev => ({ ...prev, [activeEvent.targetToken]: prev[activeEvent.targetToken] - amount }));
      setContributionAmount('');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !activeEvent) {
    return <div className={styles.container}><p>Carregando evento...</p></div>;
  }
  
  const progressPercent = activeEvent ? (activeEvent.currentAmount / activeEvent.goalAmount) * 100 : 0;
  const userTokenBalance = activeEvent ? (userBalances[activeEvent.targetToken] || 0) : 0;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pandemia Global</h1>
      
      {!activeEvent ? (
        <div className={styles.card}>
          <p>Não há nenhuma pandemia ativa no momento. O mundo está em paz... por enquanto.</p>
        </div>
      ) : (
        <div className={styles.card}>
          <h2>{activeEvent.name}</h2>
          <p className={styles.description}>{activeEvent.description}</p>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${Math.min(progressPercent, 100)}%` }}></div>
            <span className={styles.progressText}>
              {activeEvent.currentAmount.toFixed(2)} / {activeEvent.goalAmount.toFixed(2)} ({progressPercent.toFixed(2)}%)
            </span>
          </div>
          
          <p>Contribua com <strong>{activeEvent.targetToken}</strong> para ajudar a alcançar o objetivo global e ganhar recompensas!</p>
          
          <div className={styles.balanceInfo}>
            Seu Saldo: {userTokenBalance.toFixed(4)} {activeEvent.targetToken}
          </div>

          <form onSubmit={handleContribute} className={styles.form}>
            <input 
              type="number"
              step="any"
              min="0"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              placeholder="Quantidade para contribuir"
              className={styles.input}
              disabled={!userWallet || isSubmitting}
            />
            <button 
              type="submit" 
              className={styles.button}
              disabled={!userWallet || isSubmitting || progressPercent >= 100}
            >
              {isSubmitting ? 'Enviando...' : 'Contribuir'}
            </button>
          </form>

          {!userWallet && <p className={styles.warning}>Conecte sua carteira para poder contribuir.</p>}
          {progressPercent >= 100 && <p className={styles.success}>O objetivo foi alcançado! Aguardando distribuição de recompensas.</p>}
          
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}
        </div>
      )}
    </div>
  );
}