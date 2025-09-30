// components/MysticSaleModal.js (VERSÃO COM CAMINHO DA IMAGEM CORRIGIDO)
import styles from '../styles/MysticSaleModal.module.css';
import baseStyles from '../styles/ModalBase.module.css';
import { t } from '../lib/i18n';
import { FaShieldAlt, FaTachometerAlt, FaStar, FaInfinity } from 'react-icons/fa';

export default function MysticSaleModal({ isOpen, onClose, onPurchase, isPurchasing, lang }) {
  const MYSTIC_PRICE = 15;

  if (!isOpen) {
    return null;
  }

  const handlePurchaseClick = () => {
    onPurchase('mystic_pack'); 
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>&times;</button>
        
        <div className={styles.contentWrapper}>
          <div className={styles.nftDisplay}>
            <div className={styles.rarityBanner}>MYSTIC</div>
            {/* <<< CORREÇÃO AQUI: Verifique se este caminho e nome de arquivo estão 100% corretos no seu servidor >>> */}
            <img src="/img/nfts/mystic.webp" alt="Mystic NFT" className={styles.nftImage} /> 
            <div className={styles.priceTag}>{MYSTIC_PRICE} RON</div>
          </div>

          <div className={styles.details}>
            <h2>{t('mystic_sale_title', lang)}</h2>
            <p className={styles.subtitle}>{t('mystic_sale_subtitle', lang)}</p>
            
            <ul className={styles.benefitsList}>
              <li><FaInfinity className={styles.icon} /> {t('mystic_benefit_1', lang)}</li>
              <li><FaStar className={styles.icon} /> {t('mystic_benefit_2', lang)}</li>
              <li><FaShieldAlt className={styles.icon} /> {t('mystic_benefit_3', lang)}</li>
              <li><FaTachometerAlt className={styles.icon} /> {t('mystic_benefit_4', lang)}</li>
            </ul>

            <button className={baseStyles.button} onClick={handlePurchaseClick} disabled={isPurchasing}>
              {isPurchasing ? t('processing', lang) : t('buy_now', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}