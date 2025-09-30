// components/MarketModal.js (COMPLETO - NENHUMA ALTERAÇÃO LÓGICA NECESSÁRIA)

import { useState, useEffect, useMemo } from 'react';
import { t } from '../lib/i18n';
import styles from '../styles/FeatureModal.module.css';
import LoadingSpinner from './LoadingSpinner';

const SELLABLE_TOKENS = ["INSULINE", "ZOLGENSMA", "LUXUTURNA", "ZYNTEGLO"];

export default function MarketModal({ userWallet, initialBalances, onClose, onTransactionComplete, lang }) {
  const [accessGranted, setAccessGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [balances, setBalances] = useState(initialBalances);
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

  const fetchData = async () => {
    if (!userWallet) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
        const [accessRes, listingsRes] = await Promise.all([
            fetch(`/api/market/check-access?wallet=${userWallet}`),
            fetch('/api/market/listings')
        ]);

        const { access } = await accessRes.json();
        setAccessGranted(access);

        if(access) {
            if (!listingsRes.ok) throw new Error(t('load_listings_error', lang));
            const listingsData = await listingsRes.json();
            setListings(listingsData);
        }
    } catch (error) {
        showFeedback(error.message, 'error');
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userWallet]);

  useEffect(() => {
    setBalances(initialBalances);
  }, [initialBalances]);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSubmitting({ form: true });
    try {
      const res = await fetch('/api/market/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerWallet: userWallet, ...newListing }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
            throw new Error(t('listing_limit_error', lang));
        }
        throw new Error(data.message);
      }
      showFeedback(t('listing_created_success', lang), 'success');
      onTransactionComplete();
      onClose();
    } catch (error) {
      showFeedback(error.message, 'error');
    } finally {
      setSubmitting({});
    }
  };
  
  const handleBuyListing = async (listingId) => {
    if (!window.confirm(t('confirm_purchase', lang))) return;
    setSubmitting({ [listingId]: true });
    try {
      const res = await fetch('/api/market/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerWallet: userWallet, listingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showFeedback(t('purchase_successful', lang), 'success');
      onTransactionComplete();
      onClose();
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
    if (isLoading) return <LoadingSpinner message={t('checking_market_access', lang)} />;
    if (!accessGranted) {
        return (
            <div className={styles.accessDenied}>
                <h2>{t('access_restricted', lang)}</h2>
                <p>{t('market_access_description', lang)}</p>
            </div>
        );
    }
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <section className={styles.card}>
              <h2>{t('sell_resources', lang)}</h2>
              <form onSubmit={handleCreateListing} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>{t('resource_to_sell', lang)}</label>
                  <select name="tokenType" value={newListing.tokenType} onChange={handleFormChange} className={styles.input}>
                    {SELLABLE_TOKENS.map(token => <option key={token} value={token}>{token}</option>)}
                  </select>
                  <span className={styles.balanceText}>{t('balance', lang)}: {(balances[newListing.tokenType] || 0).toFixed(4)}</span>
                </div>
                <div className={styles.formGroup}>
                  <label>{t('amount', lang)}</label>
                  <input name="amount" type="number" step="any" value={newListing.amount} onChange={handleFormChange} className={styles.input} placeholder="e.g., 1000" required />
                </div>
                <div className={styles.formGroup}>
                  <label>{t('price_per_unit_vida', lang)}</label>
                  <input name="pricePerUnitInVIDA" type="number" step="any" value={newListing.pricePerUnitInVIDA} onChange={handleFormChange} className={styles.input} placeholder="e.g., 0.5" required />
                </div>
                <button type="submit" className={styles.button} disabled={submitting.form}>
                  {submitting.form ? t('creating', lang) : t('create_listing', lang)}
                </button>
              </form>
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>{t('your_vida_balance', lang)}: <strong>{(balances['VIDA'] || 0).toFixed(4)}</strong></div>
            </section>
    
            <section>
              <h2>{t('open_market', lang)}</h2>
              <div className={styles.grid}>
                {listings.length > 0 ? listings.map(listing => {
                  const totalCost = listing.amount * listing.pricePerUnitInVIDA;
                  return (
                    <div key={listing.id} className={`${styles.card} ${styles.listingCard}`}>
                      <div className={styles.cardHeader}>
                        {t('selling', lang)}: <strong>{listing.amount.toLocaleString()} {listing.tokenType}</strong>
                      </div>
                      <div className={styles.cardBody}>
                        <p>{t('price_unit', lang)}: {listing.pricePerUnitInVIDA} VIDA</p>
                        <p className={styles.totalCost}>{t('total_cost', lang)}: {totalCost.toFixed(2)} VIDA</p>
                        <p className={styles.seller}>{t('seller', lang)}: {listing.sellerWallet.slice(0, 4)}...{listing.sellerWallet.slice(-4)}</p>
                      </div>
                      <button className={styles.button} style={{width: '100%', borderTopLeftRadius: 0, borderTopRightRadius: 0}} onClick={() => handleBuyListing(listing.id)} disabled={submitting[listing.id] || listing.sellerWallet === userWallet}>
                        {listing.sellerWallet === userWallet ? t('your_listing', lang) : (submitting[listing.id] ? t('buying', lang) : t('buy', lang))}
                      </button>
                    </div>
                  )
                }) : <p className={styles.centerText}>{t('market_is_empty', lang)}</p>}
              </div>
            </section>
        </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
            <h1 className={styles.title}>{t('resource_market', lang)}</h1>
            <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <main className={styles.mainContent}>
          {renderContent()}
        </main>
        {feedback.message && <div className={`${styles.notification} ${styles[feedback.type]}`}>{feedback.message}</div>}
      </div>
    </div>
  );
}