import React from 'react';
import { FaTimes, FaWallet } from 'react-icons/fa';
import { t } from '../lib/i18n';
// A MUDANÇA MAIS IMPORTANTE: Importar do Home.module.css
import styles from '../styles/Home.module.css'; 

const REAL_TOKENS = ["INSULINE", "ZOLGENSMA", "LUXUTURNA", "ZYNTEGLO", "VIDA"];

const tokenImages = {
    INSULINE: '/img/tokens/INSULINE.png',
    ZOLGENSMA: '/img/tokens/ZOLGENSMA.png',
    LUXUTURNA: '/img/tokens/LUXUTURNA.png',
    ZYNTEGLO: '/img/tokens/ZYNTEGLO.png',
    VIDA: '/img/tokens/VIDA.png',
    RON: '/img/tokens/RONIN.png'
};

export default function WalletModal({ isOpen, onClose, userAddress, ronBalance, gameBalances, chainBalances, onDisconnect, lang }) {
    if (!isOpen) {
        return null;
    }

    // Usamos os novos nomes de classes definidos em Home.module.css
    return (
        <div className={styles.walletModalBackdrop} onClick={onClose}>
            <div className={styles.walletModalCard} onClick={(e) => e.stopPropagation()}>
                <div className={styles.walletModalHeader}>
                    <h3><FaWallet /> {t('game_wallet', lang)}</h3>
                    <button onClick={onClose} className={styles.walletCloseButton}><FaTimes /></button>
                </div>
                
                <div className={styles.walletInfo}>
                    <p className={styles.addressLabel}>{t('wallet_address', lang)}:</p>
                    <p className={styles.addressValue}>{userAddress}</p>
                    <div className={styles.ronBalance}>
                        <img src={tokenImages.RON} alt="RON" className={styles.tokenIcon} />
                        <span>{parseFloat(ronBalance).toFixed(4)} RON</span>
                    </div>
                </div>

                <div className={styles.balancesContainer}>
                    <div className={styles.balanceSection}>
                        <h4>{t('in_game_balances', lang)}</h4>
                        <p className={styles.sectionDescription}>{t('in_game_balances_desc', lang)}</p>
                        <div className={styles.tokenList}>
                            {REAL_TOKENS.map(token => (
                                <div key={token} className={styles.tokenRow}>
                                    <img src={tokenImages[token]} alt={token} className={styles.tokenIcon} onError={(e) => { e.currentTarget.src = '/img/tokens/default.png'; }} />
                                    <span className={styles.tokenName}>{token}</span>
                                    <span className={styles.tokenAmount}>{(gameBalances[token] || 0).toFixed(4)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.balanceSection}>
                        <h4>{t('on_chain_balances', lang)}</h4>
                        <p className={styles.sectionDescription}>{t('on_chain_balances_desc', lang)}</p>
                         <div className={styles.tokenList}>
                            {REAL_TOKENS.map(token => (
                                <div key={token} className={styles.tokenRow}>
                                    <img src={tokenImages[token]} alt={token} className={styles.tokenIcon} onError={(e) => { e.currentTarget.src = '/img/tokens/default.png'; }} />
                                    <span className={styles.tokenName}>{token}</span>
                                    <span className={styles.tokenAmount}>{(chainBalances[token] || 0).toFixed(4)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.walletModalActions}>
                    <button onClick={onDisconnect} className={styles.disconnectButton}>{t('disconnect_wallet', lang)}</button>
                </div>
            </div>
        </div>
    );
}