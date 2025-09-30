// components/ExpeditionsModal.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)

import { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
// --- MIGRAÇÃO RONIN: Importações da Solana removidas ---
// import { Connection, clusterApiUrl } from '@solana/web3.js';
import { useRonin } from '../context/RoninContext'; // Adicionado para obter o provider, se necessário
import { fetchUserRoninNFTs } from '../utils/fetchNfts'; // --- MIGRAÇÃO RONIN: Usar a nova função
import { t } from '../lib/i18n';
import styles from '../styles/FeatureModal.module.css';
import LoadingSpinner from './LoadingSpinner';
import { getMissionConfig } from '../lib/missionConfig';

// Componente Countdown (sem alterações)
function Countdown({ endsAt, onComplete }) {
    const [timeLeft, setTimeLeft] = useState(new Date(endsAt) - new Date());
    useEffect(() => {
      if (timeLeft <= 0) { onComplete(); return; }
      const interval = setInterval(() => setTimeLeft(prev => prev - 1000), 1000);
      return () => clearInterval(interval);
    }, [timeLeft, onComplete]);
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);
    return <span className={styles.timer}>{`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>;
}

// --- MIGRAÇÃO RONIN: `onStart` agora usa `nft.id` ou `nft.tokenId`
function AvailableNftCard({ nft, lang, onStart, isSubmitting }) {
    const selectRef = useRef(null);
    const [missionType, setMissionType] = useState("");
    const MISSION_CONFIG = useMemo(() => getMissionConfig(lang), [lang]);

    return (
        <div className={styles.card}>
            <img src={nft.image} alt={nft.name} className={styles.nftImage} />
            <div className={styles.cardContent}>
                <p><strong>{nft.name}</strong></p>
                <select 
                    ref={selectRef}
                    className={styles.select}
                    value={missionType}
                    onChange={(e) => setMissionType(e.target.value)}
                >
                    <option value="" disabled>{t('select_a_mission', lang)}</option>
                    {Object.keys(MISSION_CONFIG).map(key => (
                        <option key={key} value={key}>{MISSION_CONFIG[key].name}</option>
                    ))}
                </select>
                <button 
                    className={styles.button}
                    onClick={() => onStart(nft.id || nft.tokenId, selectRef.current.value)}
                    disabled={isSubmitting || !missionType}
                >
                    {isSubmitting ? t('sending', lang) : t('start_expedition', lang)}
                </button>
            </div>
        </div>
    );
}

export default function ExpeditionsModal({ userWallet, onClose, onTransactionComplete, lang }) {
  // --- MIGRAÇÃO RONIN: Obtém o provider do nosso hook centralizado
  const { provider } = useRonin();
  const [userNFTs, setUserNFTs] = useState([]);
  const [expeditions, setExpeditions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [submitting, setSubmitting] = useState({});
  
  const MISSION_CONFIG = useMemo(() => getMissionConfig(lang), [lang]);

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  const fetchData = async (wallet) => {
    if (!wallet) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
      // --- MIGRAÇÃO RONIN: Lógica de conexão com Solana removida. A busca de NFTs agora usa a nova função.
      const nfts = await fetchUserRoninNFTs(wallet, provider);
      setUserNFTs(nfts);
      const expeditionsRes = await fetch(`/api/expeditions/status?wallet=${wallet}`);
      if (!expeditionsRes.ok) throw new Error(t('fetch_expeditions_error', lang));
      const expeditionsData = await expeditionsRes.json();
      setExpeditions(expeditionsData);
    } catch (error) {
      showFeedback(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(userWallet);
  }, [userWallet]);

  const handleStartExpedition = async (nftId, missionType) => {
    if (!missionType) {
      showFeedback(t('invalid_mission_type_error', lang), 'error');
      return;
    }
    setSubmitting(prev => ({ ...prev, [nftId]: true }));
    try {
      const res = await fetch('/api/expeditions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // --- MIGRAÇÃO RONIN: O backend deve ser ajustado para receber `nftId` em vez de `nftMint`
        body: JSON.stringify({ userWallet, nftId, missionType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showFeedback(data.message, 'success');
      await fetchData(userWallet);
    } catch (error) {
      showFeedback(error.message, 'error');
    } finally {
      setSubmitting(prev => ({ ...prev, [nftId]: false }));
    }
  };
  
  const handleClaimReward = async (expeditionId) => {
    setSubmitting(prev => ({ ...prev, [expeditionId]: true }));
    try {
      const res = await fetch('/api/expeditions/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userWallet, expeditionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showFeedback(data.message, 'success');
      await fetchData(userWallet);
      onTransactionComplete();
    } catch (error) {
      showFeedback(error.message, 'error');
    } finally {
      setSubmitting(prev => ({ ...prev, [expeditionId]: false }));
    }
  };

  // --- MIGRAÇÃO RONIN: Lógica de filtro agora usa `nft.id` ou `nft.tokenId`
  const activeExpeditionNftIds = new Set(expeditions.filter(e => !e.rewardClaimed).map(e => e.nftId)); // Supondo que o backend retorne `nftId`
  const availableNFTs = userNFTs.filter(nft => !activeExpeditionNftIds.has(nft.id || nft.tokenId));
  const expeditionsInProgress = expeditions.filter(e => !e.rewardClaimed && new Date() < new Date(e.endsAt));
  const expeditionsToClaim = expeditions.filter(e => !e.rewardClaimed && new Date() >= new Date(e.endsAt));

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Head>
                <title>{t('expeditions_title', lang)}</title>
            </Head>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('medical_expeditions', lang)}</h1>
                <button onClick={onClose} className={styles.closeButton}>&times;</button>
            </div>
            
            <main className={styles.mainContent}>
                {isLoading ? (
                    <LoadingSpinner message={t('loading_data', lang)} />
                ) : (
                    <>
                        <section style={{ marginBottom: '2rem' }}>
                            <h2>{t('in_progress', lang)}</h2>
                            {expeditionsInProgress.length > 0 ? (
                                <div className={styles.grid}>
                                    {expeditionsInProgress.map(exp => (
                                        <div key={exp.id} className={styles.card}>
                                            <img src={userNFTs.find(n => (n.id || n.tokenId) === exp.nftId)?.image} alt="NFT in expedition" className={styles.nftImage} />
                                            <div className={styles.cardContent}>
                                                <p><strong>{t('mission', lang)}:</strong> {MISSION_CONFIG[exp.missionType]?.name}</p>
                                                <p><strong>{t('reward', lang)}:</strong> {exp.rewardAmount} {exp.rewardToken}</p>
                                                <Countdown endsAt={exp.endsAt} onComplete={() => fetchData(userWallet)} />
                                                <button className={styles.button} disabled>{t('on_mission', lang)}</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className={styles.centerText}>{t('no_expeditions_in_progress', lang)}</p>}
                        </section>
                        
                        <section style={{ marginBottom: '2rem' }}>
                            <h2>{t('rewards_to_claim', lang)}</h2>
                            {expeditionsToClaim.length > 0 ? (
                                <div className={styles.grid}>
                                    {expeditionsToClaim.map(exp => (
                                        <div key={exp.id} className={styles.card}>
                                            <img src={userNFTs.find(n => (n.id || n.tokenId) === exp.nftId)?.image} alt="NFT ready to claim" className={styles.nftImage} />
                                            <div className={styles.cardContent}>
                                                <p><strong>{t('mission_complete', lang)}</strong></p>
                                                <p><strong>{t('reward', lang)}:</strong> {exp.rewardAmount} {exp.rewardToken}</p>
                                                <button className={styles.button} onClick={() => handleClaimReward(exp.id)} disabled={submitting[exp.id]}>
                                                    {submitting[exp.id] ? t('claiming', lang) : t('claim_reward', lang)}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className={styles.centerText}>{t('no_rewards_ready', lang)}</p>}
                        </section>

                        <section>
                            <h2>{t('available_nfts', lang)}</h2>
                            {availableNFTs.length > 0 ? (
								<div className={styles.nftSelectionGrid}> {/* <-- USE A CLASSE CORRETA AQUI */}
                                    {availableNFTs.map(nft => (
                                        <AvailableNftCard 
                                            key={nft.id || nft.tokenId}
                                            nft={nft}
                                            lang={lang}
                                            onStart={handleStartExpedition}
                                            isSubmitting={!!submitting[nft.id || nft.tokenId]}
                                        />
                                    ))}
                                </div>
                            ) : <p className={styles.centerText}>{t('no_nfts_available', lang)}</p>}
                        </section>
                    </>
                )}
            </main>
            {feedback.message && <div className={`${styles.notification} ${styles[feedback.type]}`}>{feedback.message}</div>}
        </div>
    </div>
  );
}