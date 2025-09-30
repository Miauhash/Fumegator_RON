// components/ReferralsModal.js

import { t } from '../lib/i18n';
import styles from '../styles/FeatureModal.module.css';
import { useState } from 'react'; // Importa o useState para feedback

export default function ReferralsModal({ userWallet, onClose, lang }) {
  const [copied, setCopied] = useState(false);
  const referralLink = userWallet ? `https://fumegator.xyz/game?ref=${userWallet}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // O feedback some após 2 segundos
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
            <h1 className={styles.title}>{t('referral_program', lang)}</h1>
            <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <main className={styles.mainContent} style={{textAlign: 'center'}}>
            <p>{t('referral_description', lang)}</p>
            <div style={{ marginTop: '2rem' }}>
              <p><strong>{t('your_referral_link', lang)}:</strong></p>
              <input type="text" value={referralLink} readOnly className={styles.input} style={{ textAlign: 'center' }} />
              <button onClick={handleCopyLink} className={styles.button} style={{ marginTop: '1rem' }}>
                {copied ? t('copied_feedback', lang) : t('copy_link', lang)}
              </button>
            </div>
        </main>
      </div>
    </div>
  );
}