// components/DoorUnlockModal.js (VERSÃO FINAL E CORRIGIDA)
import { useState } from 'react';
import styles from '../styles/DoorUnlockModal.module.css';
import baseStyles from '../styles/ModalBase.module.css';
import { t } from '../lib/i18n';

export default function DoorUnlockModal({
  slotId,
  unlockCost,
  lang,
  onConfirmUnlock,
  onClose,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!unlockCost) {
    return null;
  }

  const handleUnlockClick = async (currency) => {
    setIsProcessing(true);
    // onConfirmUnlock é uma função async, então podemos esperar por ela
    const success = await onConfirmUnlock(slotId, currency);
    // Se a transação falhar, paramos o processamento para o usuário tentar de novo
    if (!success) {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.scene}>
          <div className={styles.door}>
            <div className={styles.doorWindow}></div>
            <div className={styles.doorHandle}></div>
            <div className={styles.doorLock}></div>
          </div>
        </div>

        <div className={styles.controls}>
            <h2 className={styles.title}>{t('unlock_slot', lang)} {slotId}</h2>
            <p className={styles.costText}>{t('choose_payment_method', lang)}:</p>
            
            <div className={styles.buttonGroup}>
                <button 
                    className={baseStyles.button} 
                    onClick={() => handleUnlockClick('INSULINE')}
                    disabled={isProcessing}
                >
                    {isProcessing ? t('processing', lang) : `${t('pay', lang)} ${unlockCost.insuline} INSULINE`}
                </button>
                <span className={styles.orText}>OR</span>
                <button 
                    className={baseStyles.button} 
                    onClick={() => handleUnlockClick('RON')}
                    disabled={isProcessing}
                >
                    {isProcessing ? t('processing', lang) : `${t('pay', lang)} ${unlockCost.ron} RON`}
                </button>
            </div>

            <button className={`${baseStyles.button} ${baseStyles.buttonSecondary} ${styles.cancelButton}`} onClick={onClose} disabled={isProcessing}>
                {t('cancel', lang)}
            </button>
        </div>
      </div>
    </div>
  );
}