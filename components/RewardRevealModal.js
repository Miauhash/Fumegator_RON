// components/RewardRevealModal.js (VERSÃO CORRIGIDA E COMPLETA)

// --- CORREÇÃO: A importação de traduções deve ser consistente com o resto do projeto ---
import { t } from '../lib/i18n';
import styles from '../styles/RewardRevealModal.module.css';

function getRarityColor(rarity) {
  switch (rarity?.toLowerCase()) {
    case 'common': return '#a4a4a4';
    case 'uncommon': return '#3c8f47';
    case 'rare': return '#3978c7';
    case 'epic': return '#8d47be';
    case 'legendary': return '#f5b040';
    default: return '#555';
  }
}

export default function RewardRevealModal({ isOpen, nft, onClose }) {
  if (!isOpen || !nft) {
    return null;
  }

  const rarityColor = getRarityColor(nft.rarity);

  return (
    <div className={styles.overlay}>
      <div className={styles.revealCard} style={{ '--rarity-glow-color': rarityColor }}>
        <div className={styles.header}>
            <h3>{t('new_specialist_acquired')}</h3>
        </div>
        <div className={styles.imageContainer}>
            <img src={nft.image} alt={nft.name} className={styles.nftImage} />
        </div>
        <div className={styles.details}>
            <h4 className={styles.nftName}>{nft.name}</h4>
            <span className={styles.nftRarity} style={{ backgroundColor: rarityColor }}>
                {nft.rarity}
            </span>
        </div>
        <button className={styles.continueButton} onClick={onClose}>
            {t('continue')}
        </button>
      </div>
    </div>
  );
}