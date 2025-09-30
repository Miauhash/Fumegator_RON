// components/StarterPackModal.js (FINAL VERSION - ENGLISH TRANSLATION)
import { useState, useCallback } from 'react';
import { useRonin } from '../context/RoninContext';
import { ethers } from 'ethers';
import styles from '../styles/FeatureModal.module.css';
import modalStyles from '../styles/MintPage.module.css';
import LoadingSpinner from './LoadingSpinner';

const MINT_PRICE_RON = "0.5";
const TREASURY_WALLET_RONIN = process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS_RONIN;

export default function StarterPackModal({ isOpen, onClose, onPackClaimed }) {
  const { userAddress, signer, provider, connectWallet } = useRonin();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const handlePurchase = useCallback(async () => {
    if (!signer || !userAddress || !provider) {
        setFeedback({ message: 'Please connect your wallet first.', type: 'error' });
        await connectWallet(); 
        return;
    }
    setIsLoading(true);
    setFeedback({ message: 'Approving payment in your wallet...', type: 'info' });

    try {
        const treasuryAddress = TREASURY_WALLET_RONIN.replace('ronin:', '0x');
        const resolvedAddress = await provider.resolveName(treasuryAddress).catch(() => treasuryAddress);

        const transaction = {
            to: resolvedAddress,
            value: ethers.utils.parseEther(MINT_PRICE_RON),
        };
        const txResponse = await signer.sendTransaction(transaction);
        setFeedback({ message: 'Payment sent! Finalizing delivery...', type: 'info' });
        await txResponse.wait();

        const response = await fetch('/api/shop/buy-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userWallet: userAddress, productId: 'starter_pack', transactionHash: txResponse.hash }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Package delivery failed.');
        
        setFeedback({ message: "Success! Your Starter Pack has been sent.", type: 'success' });
        if (onPackClaimed) {
            onPackClaimed(data.nfts);
        }
        setTimeout(onClose, 2000);

    } catch (error) {
        let errorMessage = error.reason || error.message;
        if (error.code === 'ACTION_REJECTED') {
            errorMessage = 'Transaction rejected.';
        }
        if (error.code === 'INSUFFICIENT_FUNDS') {
            errorMessage = 'Insufficient RON for the transaction.';
        }
        setFeedback({ message: `Error: ${errorMessage}`, type: 'error' });
    } finally {
        setIsLoading(false);
    }
  }, [userAddress, signer, provider, onClose, onPackClaimed, connectWallet]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className={styles.header}>
          <h1 className={styles.title}>Starter Pack</h1>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <main className={styles.mainContent} style={{ padding: '2rem' }}>
          <div className={modalStyles.mintCard} style={{ border: 'none', padding: 0 }}>
            <img src="/img/logo.png" alt="Fumegator Logo" className={modalStyles.logo} />
            <p className={modalStyles.description} style={{ fontSize: '1rem' }}>
              Acquire your initial team of 5 specialists (one of each rarity) for {MINT_PRICE_RON} RON and start your journey in Hospital Fumegator!
            </p>
            
            {isLoading ? (
                <LoadingSpinner message={feedback.message} />
            ) : (
                <button 
                    className={modalStyles.mintButton} 
                    onClick={userAddress ? handlePurchase : connectWallet} 
                    disabled={isLoading}
                >
                    {userAddress ? `Buy for ${MINT_PRICE_RON} RON` : 'Connect Wallet'}
                </button>
            )}

            {feedback.message && !isLoading && (
                <p className={feedback.type === 'error' ? modalStyles.feedbackError : modalStyles.feedbackSuccess}>
                    {feedback.message}
                </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}