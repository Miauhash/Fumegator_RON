import React, { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import { connectWallet, disconnectWallet } from "../utils/connectWallet";
import { fetchUserNFTs } from "../utils/miningLogic";
import {
  FaPlay,
  FaArrowUp,
  FaBolt,
  FaVideo,
  FaWallet,
} from "react-icons/fa";

// Importa funções de salvar/carregar
import { saveGameState, loadGameState } from "../utils/save";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletType, setWalletType] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [userNFTs, setUserNFTs] = useState([]);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Estados de jogo
  const [balances, setBalances] = useState({});
  const [levels, setLevels] = useState({});
  const [timers, setTimers] = useState({});
  const [costs, setCosts] = useState({});

  // Carregar progresso salvo
  useEffect(() => {
    if (walletAddress) {
      loadGameState(walletAddress).then((data) => {
        if (data) {
          setBalances(data.balances || {});
          setLevels(data.levels || {});
          setTimers(data.timers || {});
          setCosts(data.costs || {});
        }
      });
    }
  }, [walletAddress]);

  const autoSave = () => {
    if (!walletAddress) return;
    saveGameState(walletAddress, balances, levels, timers, costs).catch((err) =>
      console.error("Erro ao salvar automaticamente:", err)
    );
  };

  const handleConnectWallet = async (type) => {
    try {
      const address = await connectWallet(type);
      if (address) {
        setWalletConnected(true);
        setWalletType(type);
        setWalletAddress(address);
        setShowWalletOptions(false);
        showNotification(`${type} conectada com sucesso!`, "success");

        const nfts = await fetchUserNFTs(address, type);
        setUserNFTs(nfts);

        autoSave();
      }
    } catch (error) {
      console.error("Erro ao conectar carteira:", error);
      showNotification("Erro ao conectar carteira", "error");
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet(walletType);
    setWalletConnected(false);
    setWalletType(null);
    setWalletAddress(null);
    setUserNFTs([]);
    showNotification("Carteira desconectada", "info");
    autoSave();
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Exemplo de ação de jogo → Play
  const handlePlay = (roomId) => {
    console.log("Iniciando mineração na sala:", roomId);
    // ... lógica de mineração
    autoSave();
  };

  // Exemplo de ação de jogo → Upgrade
  const handleUpgrade = (roomId) => {
    console.log("Upgrade na sala:", roomId);
    // ... lógica de upgrade
    autoSave();
  };

  // Exemplo de ação de jogo → Boost
  const handleBoost = (roomId) => {
    console.log("Boost aplicado na sala:", roomId);
    // ... lógica de boost
    autoSave();
  };

  return (
    <div className={styles.container}>
      {/* ===== HEADER ===== */}
      <header className={styles.header}>
        <h1 className={styles.brand}>Fumegator</h1>
        <nav className={styles.nav}>
          <div
            className={styles.walletButton}
            onClick={() => setShowWalletOptions(!showWalletOptions)}
          >
            <FaWallet /> {walletConnected ? walletType : "Conectar"}
            {showWalletOptions && (
              <div className={styles.walletDropdown}>
                <button onClick={() => handleConnectWallet("MetaMask")}>
                  MetaMask
                </button>
                <button onClick={() => handleConnectWallet("Phantom")}>
                  Phantom
                </button>
                <button onClick={() => handleConnectWallet("Ronin")}>
                  Ronin
                </button>
                <button onClick={() => handleConnectWallet("Rabbit")}>
                  Rabbit
                </button>
                {walletConnected && (
                  <button onClick={handleDisconnectWallet}>Desconectar</button>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ===== MAIN ===== */}
      <main className={styles.main}>
        <div className={styles.cardsRow}>
          {/* ===== CARD EXEMPLO ===== */}
          <div className={styles.card}>
            <div className={styles.cardInner}>
              <div className={styles.imageWrap}>
                <img src="/mascot.png" alt="Mascot" />
              </div>
              <div className={styles.cardTitle}>NFT Room</div>
              <div className={styles.cardStats}>
                <span>Level: 1</span>
                <span>Quantidade: 1</span>
                <span>Saldo: 0.00</span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={`${styles.btn} ${styles.btnPlay}`}
                  onClick={() => handlePlay("room1")}
                >
                  <FaPlay />
                </button>
                <button
                  className={`${styles.btn} ${styles.btnUpgrade}`}
                  onClick={() => handleUpgrade("room1")}
                >
                  <FaArrowUp />
                </button>
                <button
                  className={`${styles.btn} ${styles.btnAdBoost}`}
                  onClick={() => handleBoost("room1")}
                >
                  <FaVideo />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== NFT MODAL ===== */}
      {showNFTModal && (
        <div className={styles.nftModal}>
          <div className={styles.nftModalContent}>
            <h3>Seus NFTs</h3>
            <div className={styles.nftGrid}>
              {userNFTs.map((nft, index) => (
                <div key={index} className={styles.nftItem}>
                  <img src={nft.image} alt={nft.name} />
                  <span>{nft.name}</span>
                </div>
              ))}
            </div>
            <button
              className={styles.btn}
              onClick={() => setShowNFTModal(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ===== NOTIFICATION ===== */}
      {notification && (
        <div
          className={`${styles.notification} ${
            notification.type === "success"
              ? styles.ntfSuccess
              : notification.type === "error"
              ? styles.ntfError
              : styles.ntfInfo
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}
