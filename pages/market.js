// pages/market.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { loadGameState } from '../utils/miningLogic';
import { useRonin } from '../context/RoninContext'; // --- MIGRAÇÃO RONIN: Nova importação
import styles from '../styles/MarketPage.module.css';

// Tokens que podem ser vendidos (exclui VIDA, que é a moeda)
const SELLABLE_TOKENS = ["INSULINE", "ZOLGENSMA", "LUXUTURNA", "ZYNTEGLO"];

export default function MarketPage() {
  // --- MIGRAÇÃO RONIN: Usar o hook para obter o endereço do usuário ---
  const { userAddress } = useRonin();

  const [accessGranted, setAccessGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [balances, setBalances] = useState({});
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [submitting, setSubmitting] = useState({});

  const [newListing, setNewListing] = useState({
    tokenType: SELLABLE_TOKENS[0],
    amount: '',
    pricePerUnitInVIDA: '',
  });

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
  };

  const fetchData = async (address) => {
    if (!address) return;
    setSubmitting({});
    try {
      const [listingsRes, gameState] = await Promise.all([
        fetch('/api/market/listings'),
        loadGameState(address)
      ]);

      if (!listingsRes.ok) throw new Error('Falha ao carregar anúncios.');
      const listingsData = await listingsRes.json();
      setListings(listingsData);
      
      if (gameState && gameState.balances) {
        setBalances(gameState.balances);
      } else {
        setBalances({});
      }
    } catch (error) {
      showFeedback(error.message, 'error');
    }
  };

  // --- MIGRAÇÃO RONIN: useEffect atualizado para depender de userAddress ---
  useEffect(() => {
    if (userAddress) {
      (async () => {
        try {
          const accessRes = await fetch(`/api/market/check-access?wallet=${userAddress}`);
          if (!accessRes.ok) {
              setAccessGranted(false);
              throw new Error("Falha na verificação de acesso.");
          }
          const { access } = await accessRes.json();
          setAccessGranted(access);
          if (access) {
            await fetchData(userAddress);
          }
        } catch (error) {
          console.error(error.message);
        } finally {
          setIsLoading(false);
        }
      })();
    } else {
      setIsLoading(false);
    }
  }, [userAddress]);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSubmitting({ form: true });
    try {
      const res = await fetch('/api/market/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerWallet: userAddress, ...newListing }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showFeedback('Anúncio criado com sucesso!', 'success');
      setNewListing({ tokenType: SELLABLE_TOKENS[0], amount: '', pricePerUnitInVIDA: '' });
      await fetchData(userAddress);
    } catch (error) {
      showFeedback(error.message, 'error');
    } finally {
      setSubmitting({});
    }
  };
  
  const handleBuyListing = async (listingId) => {
    if (!window.confirm("Você confirma a compra deste item?")) return;
    setSubmitting({ [listingId]: true });
    try {
      const res = await fetch('/api/market/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerWallet: userAddress, listingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showFeedback('Compra realizada com sucesso!', 'success');
      await fetchData(userAddress);
    } catch (error) {
      showFeedback(error.message, 'error');
    } finally {
      setSubmitting({});
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewListing(prev => ({ ...prev, [name]: value }));
  };
  
  const renderContent = () => {
    if (isLoading) {
        return <p className={styles.centerText}>Verificando acesso ao mercado...</p>;
    }
    
    if (!userAddress) {
        return <p className={styles.centerText}>Conecte sua carteira para acessar o mercado.</p>;
    }
  
    if (!accessGranted) {
        return (
            <div className={styles.accessDenied}>
            <h2>Acesso Restrito</h2>
            <p>Para garantir a segurança e a seriedade das transações, o acesso ao mercado é restrito a jogadores que possuem ao menos um NFT de raridade Rara, Épica ou Lendária.</p>
            </div>
        );
    }

    return (
        <div className={styles.marketGrid}>
            <section className={styles.card}>
              <h2>Vender Recursos</h2>
              <form onSubmit={handleCreateListing} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Recurso para Vender</label>
                  <select name="tokenType" value={newListing.tokenType} onChange={handleFormChange} className={styles.input}>
                    {SELLABLE_TOKENS.map(token => <option key={token} value={token}>{token}</option>)}
                  </select>
                  <span className={styles.balanceText}>Saldo: {(balances[newListing.tokenType] || 0).toFixed(4)}</span>
                </div>
                <div className={styles.formGroup}>
                  <label>Quantidade</label>
                  <input name="amount" type="number" step="any" value={newListing.amount} onChange={handleFormChange} className={styles.input} placeholder="ex: 1000" required />
                </div>
                <div className={styles.formGroup}>
                  <label>Preço por Unidade (em VIDA)</label>
                  <input name="pricePerUnitInVIDA" type="number" step="any" value={newListing.pricePerUnitInVIDA} onChange={handleFormChange} className={styles.input} placeholder="ex: 0.5" required />
                </div>
                <button type="submit" className={styles.button} disabled={submitting.form}>
                  {submitting.form ? 'Criando...' : 'Criar Anúncio'}
                </button>
              </form>
              <div className={styles.balanceInfo}>Seu Saldo de VIDA: <strong>{(balances['VIDA'] || 0).toFixed(4)}</strong></div>
            </section>
    
            <section className={`${styles.card} ${styles.openMarketCard}`}>
              <h2>Mercado Aberto</h2>
              <div className={styles.grid}>
                {listings.length > 0 ? listings.map(listing => {
                  const totalCost = listing.amount * listing.pricePerUnitInVIDA;
                  return (
                    <div key={listing.id} className={styles.listingCard}>
                      <div className={styles.cardHeader}>
                        Vendendo: <strong>{listing.amount.toLocaleString()} {listing.tokenType}</strong>
                      </div>
                      <div className={styles.cardBody}>
                        <p>Preço/un: {listing.pricePerUnitInVIDA} VIDA</p>
                        <p className={styles.totalCost}>Custo Total: {totalCost.toFixed(2)} VIDA</p>
                        <p className={styles.seller}>Vendedor: {listing.sellerWallet.slice(0, 4)}...{listing.sellerWallet.slice(-4)}</p>
                      </div>
                      <button className={styles.button} onClick={() => handleBuyListing(listing.id)} disabled={submitting[listing.id] || listing.sellerWallet === userAddress}>
                        {listing.sellerWallet === userAddress ? 'Seu Anúncio' : (submitting[listing.id] ? 'Comprando...' : 'Comprar')}
                      </button>
                    </div>
                  )
                }) : <p className={styles.centerText}>O mercado está vazio no momento. Seja o primeiro a vender!</p>}
              </div>
            </section>
        </div>
    );
  }

  return (
    <div className={styles.canvas}>
      <Head>
        <title>Mercado - Hospital Fumegator</title>
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
            <h1 className={styles.title}>Mercado de Recursos</h1>
            <Link href="/game" passHref>
              <button className={styles.backButton}>Voltar ao Jogo</button>
            </Link>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
      {feedback.message && <div className={`${styles.notification} ${styles[feedback.type]}`}>{feedback.message}</div>}
    </div>
  );
}