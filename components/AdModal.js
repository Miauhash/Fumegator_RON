// components/AdModal.js (VERSÃO CORRIGIDA COM ESTILOS JSX)

import { useEffect, useState } from 'react';
import styles from '../styles/AdModal.module.css';
import { t } from '../lib/i18n';

const UNLOCK_SECONDS = 20;

export default function AdModal({ onClose, onReward, lang }) {
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [countdown, setCountdown] = useState(UNLOCK_SECONDS);

  useEffect(() => {
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown(prevCountdown => prevCountdown - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0) {
      onReward();
      setIsButtonEnabled(true);
    }
  }, [countdown, onReward]);

  // <<< ESTILOS INLINE CONVERTIDOS PARA OBJETOS JAVASCRIPT >>>
  // Estilos para a div externa
  const frameContainerStyle = {
    width: '100%',
    margin: 'auto',
    position: 'relative',
    zIndex: 99998,
  };

  // Estilos para o iframe interno
  const iframeStyle = {
    border: 0,
    padding: 0,
    width: '70%', // Como no seu código original
    height: 'auto',
    overflow: 'hidden',
    display: 'block',
    margin: 'auto',
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <p>{t('ad_modal_title', lang)}</p>
        </div>
        
        {/* Usando o seu código original, mas com os estilos aplicados via objetos JSX */}
        <div id="frame" style={frameContainerStyle}>
          <iframe 
            data-aa='2408589' 
            src='//acceptable.a-ads.com/2408589/?size=Adaptive'
            style={iframeStyle}
            title="Advertisement"
          ></iframe>
        </div>
        
        <div className={styles.footer}>
          <button
            onClick={onClose}
            disabled={!isButtonEnabled}
            className={styles.unlockButton}
          >
            {isButtonEnabled ? t('close', lang) : t('wait_seconds', lang, { seconds: countdown })}
          </button>
        </div>
      </div>
    </div>
  );
}