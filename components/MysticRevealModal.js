// components/MysticRevealModal.js
import { useState, useEffect } from 'react';
import styles from '../styles/MysticRevealModal.module.css';
import { t } from '../lib/i18n';

export default function MysticRevealModal({ isOpen, newNft, onClose, lang }) {
  const [showNft, setShowNft] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reseta o estado para garantir que a animação rode toda vez
      setShowNft(false);
      
      // O tempo do GIF (3Zty.gif) é de aproximadamente 2.5 segundos
      const timer = setTimeout(() => {
        setShowNft(true); // Mostra o NFT após a animação do GIF
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !newNft) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {!showNft ? (
          <img src="https://i.gifer.com/3Zty.gif" alt="Revealing NFT..." className={styles.gif} />
        ) : (
          <div className={styles.nftCard}>
            <div className={styles.rarityBanner}>MYSTIC</div>
            <img src={newNft.image} alt={newNft.name} className={styles.nftImage} />
            <h3>{newNft.name}</h3>
            <button onClick={onClose} className={styles.closeButton}>
              {t('continue', lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}