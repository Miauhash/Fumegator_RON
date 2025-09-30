// components/EventsModal.js (COMPLETO - NENHUMA ALTERAÇÃO NECESSÁRIA PARA RONIN)

import { useState, useEffect, useCallback } from 'react';
import { loadGameState } from '../utils/miningLogic';
import { t } from '../lib/i18n';
import styles from '../styles/FeatureModal.module.css';
import LoadingSpinner from './LoadingSpinner';

export default function EventsModal({ userWallet, onClose, onTransactionComplete, isFinalPremium, onClaimMysticReward, lang }) {
  const [activeEvent, setActiveEvent] = useState(null);
  const [userBalances, setUserBalances] = useState({});
  const [contributionAmount, setContributionAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [canClaimMystic, setCanClaimMystic] = useState(false);

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  const checkMysticClaimStatus = useCallback(() => {
    if (!userWallet) return;
    const lastMysticClaim = localStorage.getItem(`lastMysticClaim_${userWallet}`);
    if (!lastMysticClaim) {
        setCanClaimMystic(true);
        return;
    }
    const lastClaimDate = new Date(Number(lastMysticClaim));
    const now = new Date();
    if (now.toDateString() !== lastClaimDate.toDateString()) {
        setCanClaimMystic(true);
    } else {
        setCanClaimMystic(false);
    }
  }, [userWallet]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const eventRes = await fetch('/api/events/current');
        if (eventRes.ok) {
          const { event } = await eventRes.json();
          setActiveEvent(event);
        }

        if (userWallet) {
          const gameState = await loadGameState(userWallet);
          if (gameState?.balances) {
            setUserBalances(gameState.balances);
          }
        }
        
        if (isFinalPremium) {
            checkMysticClaimStatus();
        }

      } catch (err) {
        console.error("Error fetching event data:", err);
        showFeedback(t('event_load_error', lang), 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userWallet, isFinalPremium, checkMysticClaimStatus, lang]);
  
  const handleClaimMystic = () => {
    if (!canClaimMystic) return;
    onClaimMysticReward();
    localStorage.setItem(`lastMysticClaim_${userWallet}`, Date.now().toString());
    showFeedback(t('mystic_reward_claimed_success', lang), 'success');
    setCanClaimMystic(false);
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      return showFeedback(t('invalid_amount_error', lang), 'error');
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            wallet: userWallet, 
            eventId: activeEvent.id, 
            progressAmount: amount
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Contribution failed');
      
      showFeedback(t('contribution_success', lang), 'success');
      setContributionAmount('');

      if (onTransactionComplete) {
        onTransactionComplete();
      }
      
      onClose();

    } catch (err) {
      showFeedback(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const progressPercent = activeEvent ? (activeEvent.currentAmount / activeEvent.goalAmount) * 100 : 0;
  const userTokenBalance = activeEvent ? (userBalances[activeEvent.targetToken] || 0) : 0;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('global_events', lang)}</h1>
                <button onClick={onClose} className={styles.closeButton}>&times;</button>
            </div>

            <main className={styles.mainContent}>
                {isLoading ? (
                    <LoadingSpinner message={t('loading_events', lang)} />
                ) : (
                    <>
                        {isFinalPremium && (
                            <section className={styles.card} style={{borderColor: '#f5b040', marginBottom: '2rem'}}>
                                <h3>{t('mystic_daily_benefit', lang)}</h3>
                                <p>{t('mystic_benefit_description', lang)}</p>
                                <button 
                                    className={styles.button}
                                    onClick={handleClaimMystic}
                                    disabled={!canClaimMystic}
                                >
                                    {canClaimMystic ? t('claim_daily_reward', lang) : t('reward_claimed_today', lang)}
                                </button>
                            </section>
                        )}

                        {!activeEvent ? (
                            <div className={styles.card} style={{ textAlign: 'center' }}>
                                <h2>{t('global_pandemic', lang)}</h2>
                                <p>{t('no_active_pandemic', lang)}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem'}}>
                                <div className={styles.card}>
                                    <h2>{activeEvent.name}</h2>
                                    <p>{activeEvent.description}</p>
                                    <div>
                                        <strong>{t('global_reward', lang)}:</strong>
                                        <span> {activeEvent.rewardAmount}x {activeEvent.rewardItemId}</span>
                                    </div>
                                </div>

                                <div className={styles.card}>
                                    <h3>{t('global_progress', lang)}</h3>
                                    <div style={{ background: '#08121e', borderRadius: '4px', padding: '0.2rem', marginBottom: '0.5rem' }}>
                                        <div style={{ width: `${Math.min(progressPercent, 100)}%`, background: '#4a90e2', height: '20px', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                                    </div>
                                    <p style={{ textAlign: 'center' }}>
                                        {activeEvent.currentAmount.toLocaleString()} / {activeEvent.goalAmount.toLocaleString()} ({progressPercent.toFixed(2)}% {t('completed', lang)})
                                    </p>
                                </div>

                                <div className={styles.card}>
                                    <h3>{t('your_contribution', lang)}</h3>
                                    <p>{t('contribute_with', lang, { token: activeEvent.targetToken })}</p>
                                    <div>
                                        {t('your_balance', lang)}: {userTokenBalance.toFixed(4)} {activeEvent.targetToken}
                                    </div>
                                    <form onSubmit={handleContribute} className={styles.form} style={{ marginTop: '1rem' }}>
                                        <input 
                                          type="number" step="any" min="0"
                                          value={contributionAmount}
                                          onChange={(e) => setContributionAmount(e.target.value)}
                                          placeholder={t('amount', lang)}
                                          className={styles.input}
                                          disabled={!userWallet || isSubmitting || progressPercent >= 100}
                                        />
                                        <button 
                                          type="submit" 
                                          className={styles.button}
                                          disabled={!userWallet || isSubmitting || progressPercent >= 100}
                                        >
                                          {isSubmitting ? t('submitting', lang) : t('contribute', lang)}
                                        </button>
                                    </form>
                                    {!userWallet && <p style={{ color: '#f5b040', textAlign: 'center' }}>{t('connect_wallet_to_contribute', lang)}</p>}
                                    {progressPercent >= 100 && <p style={{ color: '#28a745', textAlign: 'center' }}>{t('goal_reached', lang)}</p>}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
            {feedback.message && <div className={`${styles.notification} ${styles[feedback.type]}`}>{feedback.message}</div>}
        </div>
    </div>
  );
}