// /pages/ConstellationDoctor.js (VERSÃO FINAL E COMPLETA)

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { FaWallet, FaStore, FaFlask, FaWarehouse } from 'react-icons/fa';
import styles from '../styles/Home.module.css';
import { t } from '../lib/i18n';
import { useRonin } from '../context/RoninContext';
import { ethers } from 'ethers';

// Importa os componentes necessários
import ConstellationMap from '../components/ConstellationMap';
import StarModal from '../components/StarModal';
import LoadingSpinner from '../components/LoadingSpinner';
import Shop from '../components/Shop';
import Inventory from '../components/Inventory';
import Crafting from '../components/Crafting';
import WalletModal from '../components/WalletModal';

export default function ConstellationDoctorPage() {
  const { userAddress, provider, connectWallet, disconnectWallet, isLoading: isRoninLoading } = useRonin();
  const [lang, setLang] = useState('en');
  const [ronBalance, setRonBalance] = useState("0.0");
  const walletRef = useRef(null);

  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isStarModalOpen, setIsStarModalOpen] = useState(false);
  const [selectedStar, setSelectedStar] = useState(null);
  
  const handlePurchase = () => alert("Shop is for display only on this page.");
  const handleEquip = () => alert("Inventory is for display only on this page.");
  const handleCraft = () => alert("Crafting is for display only on this page.");

  const fetchRonBalance = useCallback(async () => {
    if (!provider || !userAddress) return;
    try {
      const balanceInWei = await provider.getBalance(userAddress);
      setRonBalance(ethers.utils.formatEther(balanceInWei));
    } catch (e) { console.warn("Error getting RON balance:", e); }
  }, [provider, userAddress]);
  
  useEffect(() => {
    const savedLang = localStorage.getItem('game_language') || 'en';
    setLang(savedLang);
    if (userAddress && provider) fetchRonBalance();
  }, [userAddress, provider, fetchRonBalance]);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('game_language', newLang);
  };
  
  const handleNodeClick = (star) => {
    setSelectedStar(star);
    setIsStarModalOpen(true);
  };

  const handleDisconnectWalletWrapper = () => {
    disconnectWallet();
    setShowWalletModal(false);
  };

  if (isRoninLoading) return <LoadingSpinner message="Inicializando Conexão..." />;

  if (!userAddress) {
    return (
      <div className={styles.canvas}>
        <header className={styles.header}>
            <div className={styles.brand}>Hospital Fumegator - Constellation</div>
            <button className={styles.walletButton} onClick={connectWallet}><FaWallet /> Connect Wallet</button>
        </header>
        <div className={styles.connectWalletPrompt}>
            <img src="/img/mascot-hero.png" alt="Fumegator Logo" className={styles.promptLogo} />
            <h2 className={styles.promptTitle}>The Constellation Awaits</h2>
            <p className={styles.promptSubtitle}>Connect your wallet to explore the next chapter.</p>
            <button className={styles.promptConnectButton} onClick={connectWallet}><FaWallet /> Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.canvas}>
      {isStarModalOpen && <StarModal star={selectedStar} onClose={() => setIsStarModalOpen(false)} />}
      {showShop && <Shop balances={{}} onPurchase={handlePurchase} onClose={() => setShowShop(false)} lang={lang} />}
      {showInventory && <Inventory inventory={{}} onEquip={handleEquip} onSell={() => {}} onClose={() => setShowInventory(false)} lang={lang} />}
      {showCrafting && <Crafting playerResources={{}} onCraft={handleCraft} onClose={() => setShowCrafting(false)} lang={lang} />}
      {showWalletModal && <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} userAddress={userAddress} ronBalance={ronBalance} gameBalances={{}} chainBalances={{}} onDisconnect={handleDisconnectWalletWrapper} lang={lang} />}
      
      <header className={styles.header} style={{ zIndex: 10 }}>
        <div className={styles.brand}>
          <Link href="/">
            <a style={{color: 'white', textDecoration: 'none'}}>Hospital Fumegator</a>
          </Link> - Constellation
        </div>
        
        <nav className={styles.nav}>
            <div className={styles.navBottomRow}>
                <button onClick={() => setShowInventory(true)} className={`${styles.cta} ${styles.ctaSolid}`}><FaWarehouse /> Warehouse</button>
                <button onClick={() => setShowShop(true)} className={`${styles.cta} ${styles.ctaSolid}`}><FaStore /> Shop</button>
                <button onClick={() => setShowCrafting(true)} className={`${styles.cta} ${styles.ctaSolid}`}><FaFlask /> Laboratory</button>
            </div>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={styles.specialActionsContainer}>
                <a href={`https://discord.com/channels/YOUR_SERVER_ID/1417903324652638279`} target="_blank" rel="noopener noreferrer" className={`${styles.cta} ${styles.ctaSpecial}`}>
                    Starter Pack
                </a>
                <a href="https://marketplace.roninchain.com/" target="_blank" rel="noopener noreferrer" className={`${styles.cta} ${styles.ctaSpecial}`}>
                  Premium
                </a>
            </div>
            <div style={{ position: "relative" }} ref={walletRef}>
                <div className={styles.languageSelector}>
                    <button onClick={() => changeLanguage('en')} className={lang === 'en' ? styles.activeLang : ''}>EN</button>
                    <button onClick={() => changeLanguage('pt')} className={lang === 'pt' ? styles.activeLang : ''}>PT</button>
                    <button onClick={() => changeLanguage('es')} className={lang === 'es' ? styles.activeLang : ''}>ES</button>
                    <button onClick={() => changeLanguage('zh')} className={lang === 'zh' ? styles.activeLang : ''}>ZH</button>
                </div>
                <button className={styles.walletButton} onClick={() => setShowWalletModal(true)}>
                  <FaWallet />{" "}{parseFloat(ronBalance).toFixed(4)} RON | {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </button>
            </div>
        </div>
      </header>
      
      <main className={styles.main}>
        <div className={styles.part2Container}>
          <ConstellationMap onNodeClick={handleNodeClick} />
        </div>
      </main>
    </div>
  );
}