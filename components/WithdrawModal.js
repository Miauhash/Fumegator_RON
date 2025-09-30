// components/WithdrawModal.js (ARQUIVO NOVO E COMPLETO)
import baseStyles from '../styles/ModalBase.module.css';
import withdrawStyles from '../styles/Withdraw.module.css';
import { FaPaperPlane } from 'react-icons/fa';
import { t } from '../lib/i18n';

const REAL_TOKENS = ["INSULINE", "ZOLGENSMA", "LUXUTURNA", "ZYNTEGLO", "VIDA"];

export default function WithdrawModal({
  balances,
  minWithdraw,
  isWithdrawing,
  withdrawError,
  onWithdraw,
  onClose,
  lang
}) {
  return (
    <div className={baseStyles.modalOverlay} onClick={onClose}>
      <div className={baseStyles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={baseStyles.header}>
          <h2 className={baseStyles.title}><FaPaperPlane /> Withdraw Tokens</h2>
          <button onClick={onClose} className={baseStyles.closeButton}>&times;</button>
        </div>
        <div className={baseStyles.mainContent}>
          <div className={withdrawStyles.tokenList}>
            {REAL_TOKENS.map((tk) => {
              const bal = balances[tk] || 0;
              const canWithdraw = bal >= minWithdraw;
              return (
                <div key={tk} className={`${withdrawStyles.tokenRow} ${!canWithdraw ? withdrawStyles.disabled : ""}`}>
                  <div className={withdrawStyles.tokenInfo}>
                    <span className={withdrawStyles.tokenName}>{tk}</span>
                    <span className={withdrawStyles.tokenBalance}>
                      Balance: {bal.toFixed(4)} (Min: {minWithdraw})
                    </span>
                  </div>
                  <button
                    className={baseStyles.button}
                    disabled={!canWithdraw || isWithdrawing}
                    onClick={() => onWithdraw(tk)}
                  >
                    {isWithdrawing ? t('sending', lang) : t('withdraw', lang)}
                  </button>
                </div>
              );
            })}
          </div>
          {withdrawError && <p style={{ color: 'var(--accent-red)', textAlign: 'center' }}>{withdrawError}</p>}
        </div>
        <div className={withdrawStyles.modalActions}>
          <button className={`${baseStyles.button} ${baseStyles.buttonSecondary}`} onClick={onClose}>
            {t('close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}