// pages/expeditions.js (VERSÃO CORRIGIDA E COMPLETA PARA RONIN)

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRonin } from '../context/RoninContext';
import { fetchUserRoninNFTs } from '../utils/fetchNfts';
import styles from '../styles/ExpeditionsPage.module.css';

const MISSION_CONFIG = {
  'mission_1h': { name: 'Expedição Curta (1h)', duration: 3600, rewardToken: 'INSULINE', rewardAmount: 0.1 },
  'mission_4h': { name: 'Expedição Média (4h)', duration: 14400, rewardToken: 'INSULINE', rewardAmount: 0.5 },
  'mission_12h': { name: 'Expedição Longa (12h)', duration: 43200, rewardToken: 'INSULINE', rewardAmount: 1 },
  'mission_24h': { name: 'Expedição de Elite (24h)', duration: 86400, rewardToken: 'INSULINE', rewardAmount: 2.2 },
  'mission_48h': { name: 'Exploração Profunda (48h)', duration: 172800, rewardToken: 'INSULINE', rewardAmount: 4.5 },
};

function Countdown({ endsAt, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(new Date(endsAt) - new Date());

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, onComplete]);

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return <span>{`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>;
}

export default function ExpeditionsPage() {
  const { userAddress, provider } = useRonin();

  const [userNFTs, setUserNFTs] = useState([]);
  const [expeditions, setExpeditions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [submitting, setSubmitting] = useState({});

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  const fetchData = async (address) => {
    if (!address) return;
    setIsLoading(true);
    try {
      const nfts = await fetchUserRoninNFTs(address, provider);
      setUserNFTs(nfts);
      
      const expeditionsRes = await fetch(`/api/expeditions/status?wallet=${address}`);
      if (!expeditionsRes.ok) throw new Error('Falha ao buscar expedições.');
      const expeditionsData = await expeditionsRes.json();
      setExpeditions(expeditionsData);
    } catch (error) {
      showFeedback(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (userAddress) {
      fetchData(userAddress);
    } else {
      setIsLoading(false);
    }
  }, [userAddress]);

  const handleStartExpedition = async (nftId, missionType) => {
    if (!missionType) {
      showFeedback('Por favor, selecione uma missão.', 'error');
      return;
    }
    setSubmitting(prev => ({ ...prev, [nftId]: true }));
    try {
      const res = await fetch('/api/expeditions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userWallet: userAddress, nftId, missionType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showFeedback(data.message, 'success');
      await fetchData(userAddress);
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
        body: JSON.stringify({ userWallet: userAddress, expeditionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showFeedback(data.message, 'success');
      await fetchData(userAddress);
    } catch (error) {
        // <<< CORREÇÃO APLICADA AQUI: Adicionadas as chaves { } >>>
        showFeedback(error.message, 'error');
    } finally {
      setSubmitting(prev => ({ ...prev, [expeditionId]: false }));
    }
  };

  const activeExpeditionNftIds = new Set(expeditions.filter(e => !e.rewardClaimed).map(e => e.nftId));
  const availableNFTs = userNFTs.filter(nft => !activeExpeditionNftIds.has(nft.id || nft.tokenId));
  const expeditionsInProgress = expeditions.filter(e => !e.rewardClaimed && new Date() < new Date(e.endsAt));
  const expeditionsToClaim = expeditions.filter(e => !e.rewardClaimed && new Date() >= new Date(e.endsAt));

  return (
    <div className={styles.canvas}>
      <Head>
        <title>Expedições Médicas - Hospital Fumegator</title>
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Expedições Médicas</h1>
        {!userAddress ? (
          <p className={styles.centerText}>Por favor, conecte sua carteira no jogo para acessar as expedições.</p>
        ) : isLoading ? (
          <p className={styles.centerText}>Carregando dados...</p>
        ) : (
          <>
            <section className={styles.section}>
              <h2>Em Andamento</h2>
              {expeditionsInProgress.length > 0 ? (
                <div className={styles.grid}>
                  {expeditionsInProgress.map(exp => (
                    <div key={exp.id} className={`${styles.card} ${styles.inProgress}`}>
                      <img src={userNFTs.find(n => (n.id || n.tokenId) === exp.nftId)?.image} alt="NFT" className={styles.nftImage} />
                      <div className={styles.cardContent}>
                        <p><strong>Missão:</strong> {MISSION_CONFIG[exp.missionType]?.name}</p>
                        <p><strong>Recompensa:</strong> {exp.rewardAmount} {exp.rewardToken}</p>
                        <div className={styles.timer}>
                          <Countdown endsAt={exp.endsAt} onComplete={() => fetchData(userAddress)} />
                        </div>
                        <button className={styles.button} disabled>Em Missão...</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p>Nenhuma expedição em andamento.</p>}
            </section>
            
            <section className={styles.section}>
              <h2>Recompensas para Coletar</h2>
              {expeditionsToClaim.length > 0 ? (
                <div className={styles.grid}>
                  {expeditionsToClaim.map(exp => (
                    <div key={exp.id} className={`${styles.card} ${styles.readyToClaim}`}>
                      <img src={userNFTs.find(n => (n.id || n.tokenId) === exp.nftId)?.image} alt="NFT" className={styles.nftImage} />
                      <div className={styles.cardContent}>
                        <p><strong>Missão Concluída!</strong></p>
                        <p><strong>Recompensa:</strong> {exp.rewardAmount} {exp.rewardToken}</p>
                        <button className={styles.button} onClick={() => handleClaimReward(exp.id)} disabled={submitting[exp.id]}>
                          {submitting[exp.id] ? 'Coletando...' : 'Coletar Recompensa'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p>Nenhuma recompensa pronta.</p>}
            </section>

            <section className={styles.section}>
              <h2>NFTs Disponíveis para Expedição</h2>
              {availableNFTs.length > 0 ? (
                <div className={styles.grid}>
                  {availableNFTs.map(nft => {
                    const missionKey = `${nft.id || nft.tokenId}_mission`;
                    return(
                      <div key={nft.id || nft.tokenId} className={styles.card}>
                        <img src={nft.image} alt={nft.name} className={styles.nftImage} />
                        <div className={styles.cardContent}>
                          <p><strong>{nft.name}</strong></p>
                          <select 
                            className={styles.select}
                            onChange={(e) => setSubmitting(prev => ({...prev, [missionKey]: e.target.value}))}
                            defaultValue=""
                          >
                            <option value="" disabled>Selecione uma missão</option>
                            {Object.keys(MISSION_CONFIG).map(key => (
                              <option key={key} value={key}>{MISSION_CONFIG[key].name}</option>
                            ))}
                          </select>
                          <button 
                            className={styles.button}
                            onClick={() => handleStartExpedition(nft.id || nft.tokenId, submitting[missionKey])}
                            disabled={submitting[nft.id || nft.tokenId] || !submitting[missionKey]}
                          >
                            {submitting[nft.id || nft.tokenId] ? 'Enviando...' : 'Iniciar Expedição'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : <p>Nenhum NFT disponível. Eles podem estar em missões ou em uso no jogo.</p>}
            </section>
          </>
        )}
      </div>
      {feedback.message && <div className={`${styles.notification} ${styles[feedback.type]}`}>{feedback.message}</div>}
    </div>
  );
}