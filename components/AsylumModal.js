// components/AsylumModal.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)
import { useState, useMemo } from 'react';
import { t } from '../lib/i18n';
import styles from '../styles/Asylum.module.css';

// A função nftKey é crucial e já está bem escrita para ser compatível.
const nftKey = (nft) => {
  if (!nft) return "";
  // --- MIGRAÇÃO RONIN: Priorizar tokenId e address para EVM
  return ( nft.tokenId && nft.address ? `${nft.address}-${nft.tokenId}` : (nft.mint || nft.id || nft.uri || nft.name || JSON.stringify(nft)) );
};

export default function AsylumModal({ userWallet, allUserNfts, burnedKeys, onClose, onRerollComplete, lang }) {
    const availableNfts = useMemo(() => {
        if (!allUserNfts || !burnedKeys) {
            return [];
        }
        const burnedKeysArray = Array.from(burnedKeys);
        return allUserNfts.filter(nft => burnedKeysArray.includes(nftKey(nft)));
    }, [allUserNfts, burnedKeys]);

    const [selectedNfts, setSelectedNfts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');

    const toggleSelectNft = (nft) => {
        setFeedback(''); 
        setSelectedNfts(prev => {
            const currentKey = nftKey(nft);
            const isSelected = prev.some(n => nftKey(n) === currentKey);
            if (isSelected) {
                return prev.filter(n => nftKey(n) !== currentKey);
            }
            if (prev.length < 4) {
                if (prev.length > 0 && nft.rarity !== prev[0].rarity) {
                    setFeedback('All selected Specialists must have the same rarity.');
                    setTimeout(() => setFeedback(''), 3000);
                    return prev;
                }
                return [...prev, nft];
            }
            return prev;
        });
    };

    const handleReroll = async () => {
        if (selectedNfts.length !== 4) {
            setFeedback('You must select exactly 4 Specialists.');
            return;
        }
        setIsSubmitting(true);
        setFeedback('');

        try {
            const res = await fetch('/api/asylum/reroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userWallet, 
                    // --- MIGRAÇÃO RONIN: O backend precisará saber como identificar os NFTs.
                    // Enviar uma lista de objetos com address e tokenId é o mais seguro.
                    sacrificedNfts: selectedNfts.map(n => ({ address: n.address, tokenId: n.tokenId })) 
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            onRerollComplete(data); 
            onClose();

        } catch (error) {
            setFeedback(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className={styles.closeButton}>&times;</button>
                <h2>{t('asylum_the_fumegator', lang)}</h2>
                <p>{t('asylum_description_updated', lang)}</p>
                <p style={{fontSize: '0.8rem', color: '#8899a6', marginTop: '-1rem'}}>{t('asylum_legendary_reroll_info', lang)}</p>
                
                <div className={styles.nftSelectionGrid}>
                    {availableNfts.length > 0 ? availableNfts.map(nft => {
                        const key = nftKey(nft);
                        const isSelected = selectedNfts.some(n => nftKey(n) === key);
                        return (
                            <div 
                                key={key} 
                                className={`${styles.nftCard} ${isSelected ? styles.selected : ''}`}
                                onClick={() => toggleSelectNft(nft)}
                            >
                                <img src={nft.image} alt={nft.name} />
                                <p>{nft.name}</p>
                            </div>
                        );
                    }) : <p style={{gridColumn: '1 / -1', textAlign: 'center'}}>{t('no_retired_nfts', lang)}</p>}
                </div>

                <div className={styles.footer}>
                    <p>{t('selected_count', lang, { count: selectedNfts.length })}</p>
                    <button onClick={handleReroll} disabled={isSubmitting || selectedNfts.length !== 4}>
                        {isSubmitting ? t('processing', lang) : t('combine_specialists', lang)}
                    </button>
                    {feedback && <p className={styles.feedback}>{feedback}</p>}
                </div>
            </div>
        </div>
    );
}