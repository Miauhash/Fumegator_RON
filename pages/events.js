// pages/events.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { loadGameState } from '../utils/miningLogic';
import { useRonin } from '../context/RoninContext'; // --- MIGRAÇÃO RONIN: Nova importação
import styles from '../styles/EventsPage.module.css';

export default function EventsPage() {
  const [activeEvent, setActiveEvent] = useState(null);
  // --- MIGRAÇÃO RONIN: Obter o endereço do usuário do hook ---
  const { userAddress } = useRonin();
  const [userBalances, setUserBalances] = useState({});
  const [contributionAmount, setContributionAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  
  const showFeedback = (message, type, duration = 4000) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), duration);
  };

  // --- MIGRAÇÃO RONIN: fetchData agora usa o endereço do hook ---
  const fetchData = async (address) => {
    setIsLoading(true);
    try {
      const eventRes = await fetch('/api/events/getActive');
      if (eventRes.ok) {
        const eventData = await eventRes.json();
        setActiveEvent(eventData);
      }

      if (address) {
        const gameState = await loadGameState(address);
        if (gameState?.balances) setUserBalances(gameState.balances);
      }
    } catch (err) {
      showFeedback('Falha ao carregar dados do evento.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- MIGRAÇÃO RONIN: useEffect agora depende de userAddress ---
  useEffect(() => {
    // Não precisamos mais ler do localStorage aqui
    if (userAddress) {
      fetchData(userAddress);
    } else {
      setIsLoading(false);
    }
  }, [userAddress]);

  const handleContribute = async (e) => {
    e.preventDefault();
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      return showFeedback('Por favor, insira um valor válido.', 'error');
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: userAddress, eventId: activeEvent.id, amount: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      showFeedback('Obrigado pela sua contribuição!', 'success');
      setContributionAmount('');
      // Atualiza os dados para refletir a contribuição e o novo saldo
      fetchData(userAddress);
    } catch (err) {
      showFeedback(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const progressPercent = activeEvent ? (activeEvent.currentAmount / activeEvent.goalAmount) * 100 : 0;
  const userTokenBalance = activeEvent ? (userBalances[activeEvent.targetToken] || 0) : 0;

  return (
    <div className={styles.canvas}>
      <Head>
        <title>Eventos Globais - Hospital Fumegator</title>
      </Head>
      
      <div className={styles.container}>
        <header className={styles.header}>
            <h1 className={styles.title}>Eventos Globais</h1>
            <Link href="/game" passHref> {/* --- MIGRAÇÃO RONIN: Corrigido link para apontar para a página do jogo --- */}
              <button className={styles.backButton}>Exit</button>
            </Link>
        </header>

        {isLoading ? (
            <p className={styles.centerText}>Carregando eventos...</p>
        ) : !activeEvent ? (
            <div className={styles.card}>
                <h2>Pandemia Global</h2>
                <p>Não há nenhuma pandemia ativa no momento. O mundo está em paz... por enquanto.</p>
            </div>
        ) : (
            <div className={styles.eventGrid}>
                {/* Bloco de Informações do Evento */}
                <div className={`${styles.card} ${styles.eventInfoCard}`}>
                    <h2>{activeEvent.name}</h2>
                    <p className={styles.description}>{activeEvent.description}</p>
                    <div className={styles.rewardInfo}>
                        <strong>Recompensa Global:</strong>
                        <span>{activeEvent.rewardAmount}x {activeEvent.rewardItemId}</span>
                    </div>
                </div>

                {/* Bloco de Progresso Global */}
                <div className={`${styles.card} ${styles.progressCard}`}>
                    <h3>Progresso Global</h3>
                    <div className={styles.progressContainer}>
                        <div className={styles.progressBar} style={{ width: `${Math.min(progressPercent, 100)}%` }}></div>
                        <span className={styles.progressText}>
                            {activeEvent.currentAmount.toLocaleString()} / {activeEvent.goalAmount.toLocaleString()}
                        </span>
                    </div>
                    <p className={styles.progressLabel}>{progressPercent.toFixed(2)}% Concluído</p>
                </div>

                {/* Bloco de Contribuição do Jogador */}
                <div className={`${styles.card} ${styles.contributionCard}`}>
                    <h3>Sua Contribuição</h3>
                    <p>Ajude a alcançar a meta contribuindo com <strong>{activeEvent.targetToken}</strong>!</p>
                    <div className={styles.balanceInfo}>
                        Seu Saldo: {userTokenBalance.toFixed(4)} {activeEvent.targetToken}
                    </div>
                    <form onSubmit={handleContribute} className={styles.form}>
                        <input 
                          type="number" step="any" min="0"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          placeholder="Quantidade"
                          className={styles.input}
                          disabled={!userAddress || isSubmitting || progressPercent >= 100}
                        />
                        <button 
                          type="submit" 
                          className={styles.button}
                          disabled={!userAddress || isSubmitting || progressPercent >= 100}
                        >
                          {isSubmitting ? 'Enviando...' : 'Contribuir'}
                        </button>
                    </form>
                    {!userAddress && <p className={styles.warning}>Conecte sua carteira para contribuir.</p>}
                    {progressPercent >= 100 && <p className={styles.success}>Meta alcançada! Recompensas em breve.</p>}
                </div>
            </div>
        )}
      </div>
      {feedback.message && <div className={`${styles.notification} ${styles[feedback.type]}`}>{feedback.message}</div>}
    </div>
  );
}