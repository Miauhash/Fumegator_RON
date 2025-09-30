// pages/mint.js (VERSÃO ATUALIZADA E COMPLETA PARA RONIN)
import { useState, useCallback } from 'react';
import { useRonin } from '../context/RoninContext'; // --- MIGRAÇÃO RONIN: Usar nosso hook
import { ethers } from 'ethers'; // --- MIGRAÇÃO RONIN: Importar ethers
import styles from '../styles/MintPage.module.css';
import LoadingSpinner from '../components/LoadingSpinner';

const MINT_PRICE_RON = "0.5"; // --- MIGRAÇÃO RONIN: Preço em RON (como string)
const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS_RONIN; // --- MIGRAÇÃO RONIN: Usar o endereço da Ronin

export default function MintPage() {
    // --- MIGRAÇÃO RONIN: Usar o hook da Ronin ---
    const { userAddress, signer, connectWallet } = useRonin();
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [mintedNFTs, setMintedNFTs] = useState([]);

    const handleMint = useCallback(async () => {
        if (!signer || !userAddress) {
            setFeedback({ message: 'Please connect your Ronin wallet first.', type: 'error' });
            return;
        }

        if (!TREASURY_WALLET) {
            setFeedback({ message: 'Configuration error: Treasury address not found.', type: 'error' });
            return;
        }

        setIsLoading(true);
        setFeedback({ message: 'Preparing transaction... Please approve in your Ronin wallet.', type: 'info' });

        try {
            // --- MIGRAÇÃO RONIN: Lógica de transação com Ethers.js ---
            const transaction = {
                to: TREASURY_WALLET,
                value: ethers.utils.parseEther(MINT_PRICE_RON),
            };

            const txResponse = await signer.sendTransaction(transaction);
            setFeedback({ message: 'Payment sent! Waiting for confirmation...', type: 'info' });

            await txResponse.wait(); // Espera a transação ser confirmada
            
            setFeedback({ message: 'Payment confirmed! Contacting the server to deliver your NFTs...', type: 'info' });

            const response = await fetch('/api/mint/starter-pack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Enviamos o hash da transação como prova
                body: JSON.stringify({ userWallet: userAddress, transactionSignature: txResponse.hash }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'NFT delivery failed.');
            
            setMintedNFTs(data.nfts);
            setFeedback({ message: "Success! Your Starter Pack has been sent. Check your wallet!", type: 'success' });

        } catch (error) {
            const errorMessage = error.reason || error.message;
            setFeedback({ message: `Error: ${errorMessage}`, type: 'error' });
            console.error("Minting failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userAddress, signer]);

    return (
        <div className={styles.container}>
            {/* --- MIGRAÇÃO RONIN: Botão de carteira customizado --- */}
            <div className={styles.walletButtonContainer}>
                {userAddress ? (
                    <button className={styles.walletConnectedButton}>
                        {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                    </button>
                ) : (
                    <button onClick={connectWallet} className={styles.connectButton}>Connect Ronin Wallet</button>
                )}
            </div>
            <div className={styles.mintCard}>
                <img src="/img/logo.png" alt="Fumegator Logo" className={styles.logo} />
                <h1 className={styles.title}>Claim Your Starter Pack</h1>
                <p className={styles.description}>
                    Mint your initial team of 5 random specialists for {MINT_PRICE_RON} RON and start your journey at Fumegator Hospital!
                </p>
                
                {isLoading ? (
                    <LoadingSpinner message={feedback.message} />
                ) : (
                    <button 
                        className={styles.mintButton} 
                        onClick={handleMint} 
                        disabled={!userAddress || isLoading || mintedNFTs.length > 0}
                    >
                        {mintedNFTs.length > 0 ? 'Pack Claimed!' : (userAddress ? `Mint Now for ${MINT_PRICE_RON} RON` : 'Connect Wallet to Mint')}
                    </button>
                )}

                {feedback.message && !isLoading && (
                    <p className={feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}>
                        {feedback.message}
                    </p>
                )}

                {mintedNFTs.length > 0 && (
                    <div className={styles.results}>
                        <h3>Your New Team (NFTs Minted):</h3>
                        <ul>
                            {mintedNFTs.map(nft => (
                                <li key={nft.id || nft.tokenId}>✓ NFT #{nft.id || nft.tokenId} ({nft.rarity || 'Random'})</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}