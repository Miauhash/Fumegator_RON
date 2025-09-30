// components/Game.js (VERSÃO FUNCIONAL com Starter Pack removido e link do Discord atualizado)

import { loadGameState, saveGameState } from "../utils/miningLogic";
import { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaArrowUp, FaWarehouse, FaVideo, FaWallet, FaStore, FaFlask, FaRocket, FaCheckDouble, FaLock, FaArrowLeft } from "react-icons/fa";
import styles from "../styles/Home.module.css";
import baseStyles from '../styles/ModalBase.module.css';
import { t } from '../lib/i18n';
import { useRonin } from '../context/RoninContext';
import { ethers } from 'ethers';
import { fetchUserRoninNFTs, MYSTIC_RARITY_VALUE } from '../utils/fetchNfts';
import { getTokenContract } from '../lib/contracts-frontend'; // <--- IMPORTAÇÃO ATUALIZADA

// IMPORTAR TODOS OS MODAIS E O SPINNER
import AdModal from './AdModal';
import Shop from './Shop';
import HorizontalWheel from './HorizontalWheel';
import Equipment from './Equipment';
import Inventory from './Inventory';
import Crafting from './Crafting';
import MarketModal from './MarketModal';
import ExpeditionsModal from './ExpeditionsModal';
import EventsModal from './EventsModal';
import ReferralsModal from './ReferralsModal';
import AsylumModal from './AsylumModal';
import RewardRevealModal from './RewardRevealModal';
import MysticSaleModal from './MysticSaleModal';
import MysticRevealModal from './MysticRevealModal';
import LoadingSpinner from './LoadingSpinner';
// import StarterPackModal from './StarterPackModal'; // <<< REMOVIDO
import DoorUnlockModal from './DoorUnlockModal';
import PurchaseAnimation from './PurchaseAnimation';
import ParticleEffect from './ParticleEffect';
import EKGAnimation from './EKGAnimation';
import WithdrawModal from './WithdrawModal';
import SellItemModal from './SellItemModal';
import WalletModal from './WalletModal';

// --- LÓGICA DE JOGO E CONSTANTES ---
const REAL_TOKENS = ["INSULINE", "ZOLGENSMA", "LUXUTURNA", "ZYNTEGLO", "VIDA"];
const rowToTokenMap = { 1: "INSULINE", 2: "ZOLGENSMA", 3: "LUXUTURNA", 4: "ZYNTEGLO", 5: "VIDA" };

const meds = [
    "ASA","APAP","IBU","AMOX","CIPRO", "C-006", "C-007", "C-008", "C-009", "C-010", "C-011", "C-012", "C-013", "C-014", "C-015",
    "MET","LEV","AZI","DOX","VANC", "U-006", "U-007", "U-008", "U-009", "U-010", "U-011", "U-012", "U-013", "U-014", "U-015",
    "FUR","HCTZ","LIS","ATOR","SIM", "R-006", "R-007", "R-008", "R-009", "R-010", "R-011", "R-012", "R-013", "R-014", "R-015",
    "OMEP","RAB","ESOM","PANT","DEX", "E-006", "E-007", "E-008", "E-009", "E-010", "E-011", "E-012", "E-013", "E-014", "E-015",
    "INS","GLI","SITA","PIO","EMP", "L-006", "L-007", "L-008", "L-009", "L-010", "L-011", "L-012", "L-013", "L-014", "L-015"
];

const tokenImages = {};
meds.forEach((m) => (tokenImages[m] = "/img/tokens/default.png"));
tokenImages["ASA"] = "/img/tokens/ASA.png";

const rooms = meds.map((med, index) => {
  const row = Math.floor(index / 15) + 1;
  const realToken = rowToTokenMap[row];
  let colorClass = "";
  if (row === 1) colorClass = styles.rowWhite; if (row === 2) colorClass = styles.rowGreen; if (row === 3) colorClass = styles.rowBlue;
  if (row === 4) colorClass = styles.rowRed; if (row === 5) colorClass = styles.rowGold;
  return { id: index + 1, name: med, token: realToken, rowId: row, img: tokenImages[med] || "/img/room-pharmacy.png", colorClass };
});

const getWingsData = (lang) => [
    { id: 1, name: t('wing_common_name', lang), rarity: t('rarity_common', lang), style: styles.doorCommon },
    { id: 2, name: t('wing_uncommon_name', lang), rarity: t('rarity_uncommon', lang), style: styles.doorUncommon },
    { id: 3, name: t('wing_rare_name', lang), rarity: t('rarity_rare', lang), style: styles.doorRare },
    { id: 4, name: t('wing_epic_name', lang), rarity: t('rarity_epic', lang), style: styles.doorEpic },
    { id: 5, name: t('wing_legendary_name', lang), rarity: t('rarity_legendary', lang), style: styles.doorLegendary }
];

const levelUpRewards = [
    { level: 5, reward: 1 }, { level: 18, reward: 1 }, { level: 27, reward: 1 },
    { level: 39, reward: 1 }, { level: 45, reward: 1 }, { level: 60, reward: 10 },
    { level: 85, reward: 10 }, { level: 97, reward: 10 }, { level: 110, reward: 10 },
    { level: 140, reward: 15 }, { level: 183, reward: 15 }, { level: 201, reward: 15 },
    { level: 211, reward: 15 }, { level: 223, reward: 15 }, { level: 237, reward: 15 },
    { level: 246, reward: 15 }, { level: 250, reward: 500 },
];

const rowIdToRarityMap = {
  1: "Common", 2: "Uncommon", 3: "Rare", 4: "Epic", 5: "Legendary"
};
const PRESTIGE_BONUS = 0.03;
const PREMIUM_PRODUCTION_BONUS = 1.15;

export const SLOT_UNLOCK_COSTS = {
    6: { insuline: 1000, ron: 1.0 },  7: { insuline: 1000, ron: 1.0 },  8: { insuline: 1000, ron: 1.0 },
    9: { insuline: 1000, ron: 1.0 }, 10: { insuline: 1000, ron: 1.0 }, 11: { insuline: 1500, ron: 1.5 },
    12: { insuline: 1500, ron: 1.5 }, 13: { insuline: 1500, ron: 1.5 }, 14: { insuline: 1500, ron: 1.5 },
    15: { insuline: 1500, ron: 1.5 },
    21: { insuline: 2000, ron: 2.0 }, 22: { insuline: 2000, ron: 2.0 }, 23: { insuline: 2000, ron: 2.0 },
    24: { insuline: 2000, ron: 2.0 }, 25: { insuline: 2000, ron: 2.0 }, 26: { insuline: 2500, ron: 2.5 },
    27: { insuline: 2500, ron: 2.5 }, 28: { insuline: 2500, ron: 2.5 }, 29: { insuline: 2500, ron: 2.5 },
    30: { insuline: 2500, ron: 2.5 },
    36: { insuline: 3000, ron: 3.0 }, 37: { insuline: 3000, ron: 3.0 }, 38: { insuline: 3000, ron: 3.0 },
    39: { insuline: 3000, ron: 3.0 }, 40: { insuline: 3000, ron: 3.0 }, 41: { insuline: 3500, ron: 3.5 },
    42: { insuline: 3500, ron: 3.5 }, 43: { insuline: 3500, ron: 3.5 }, 44: { insuline: 3500, ron: 3.5 },
    45: { insuline: 3500, ron: 3.5 },
    51: { insuline: 4000, ron: 4.0 }, 52: { insuline: 4000, ron: 4.0 }, 53: { insuline: 4000, ron: 4.0 },
    54: { insuline: 4000, ron: 4.0 }, 55: { insuline: 4000, ron: 4.0 }, 56: { insuline: 4500, ron: 4.5 },
    57: { insuline: 4500, ron: 4.5 }, 58: { insuline: 4500, ron: 4.5 }, 59: { insuline: 4500, ron: 4.5 },
    60: { insuline: 4500, ron: 4.5 },
    66: { insuline: 5000, ron: 5.0 }, 67: { insuline: 5000, ron: 5.0 }, 68: { insuline: 5000, ron: 5.0 },
    69: { insuline: 5000, ron: 5.0 }, 70: { insuline: 5000, ron: 5.0 }, 71: { insuline: 5500, ron: 5.5 },
    72: { insuline: 5500, ron: 5.5 }, 73: { insuline: 5500, ron: 5.5 }, 74: { insuline: 5500, ron: 5.5 },
    75: { insuline: 5500, ron: 5.5 },
};

export const nftKey = (nft) => {
  if (!nft) return "";
  return ( nft.tokenId && nft.address ? `${nft.address}-${nft.tokenId}` : (nft.mint || nft.id || nft.uri || nft.name || JSON.stringify(nft)) );
};

function getRarityColor(rarity) {
  switch (rarity?.toLowerCase()) {
    case 'common': return '#a4a4a4'; case 'uncommon': return '#3c8f47'; case 'rare': return '#3978c7';
    case 'epic': return '#8d47be'; case 'legendary': return '#f5b040'; case 'mystic': return '#8d47be';
    default: return '#555';
  }
}

const getBonusFromAttributes = (attributes) => {
    if (!attributes || !Array.isArray(attributes)) return null;
    const bonusTypeAttr = attributes.find(attr => attr.trait_type === "Specialist Bonus");
    const bonusValueAttr = attributes.find(attr => attr.trait_type === "Bonus Value");
    const bonusAreaAttr = attributes.find(attr => attr.trait_type === "Specialist Area");

    if (bonusTypeAttr && bonusValueAttr) {
        const value = parseFloat(bonusValueAttr.value);
        if (!isNaN(value)) {
            return { type: bonusTypeAttr.value, value: value, area: bonusAreaAttr ? bonusAreaAttr.value : null };
        }
    }
    return null;
};

export default function Game({ initialConfig }) {
  const { userAddress, provider, signer, connectWallet, disconnectWallet, isLoading: isRoninLoading } = useRonin();
  
  const [activeWing, setActiveWing] = useState(null);
  const [lang, setLang] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  
  const MIN_WITHDRAW = initialConfig?.general?.minWithdraw ?? 10;
  const productionRates = initialConfig?.productionRates ?? {};
  const { 
    minTime: MIN_TIME, maxTime: MAX_TIME, minReward: MIN_REWARD, maxReward: MAX_REWARD, maxLevel: MAX_LEVEL 
  } = initialConfig?.progression ?? { minTime: 60, maxTime: 432000, minReward: 0.001, maxReward: 24, maxLevel: 250 };
  const TIME_ACCELERATOR_MULTIPLIER = 2;
  const NFT_LIFETIME_MS = 244 * 24 * 60 * 60 * 1000;
  
  const [ronBalance, setRonBalance] = useState("0.0");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);
  const [canWithdrawAny, setCanWithdrawAny] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [selectedNFTs, setSelectedNFTs] = useState({});
  const [selectedMeta, setSelectedMeta] = useState({});
  const [usedNFTKeys, setUsedNFTKeys] = useState(new Set());
  const [burnedNFTKeys, setBurnedNFTKeys] = useState(new Set());
  const [currentSlot, setCurrentSlot] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [timers, setTimers] = useState({});
  const [levels, setLevels] = useState({});
  const [balances, setBalances] = useState({});
  const [blockchainBalances, setBlockchainBalances] = useState({});
  const [costs, setCosts] = useState({});
  const [maxTimes, setMaxTimes] = useState({});
  const [rewards, setRewards] = useState({});
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [spinCostRon, setSpinCostRon] = useState(null);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [showShop, setShowShop] = useState(false);
  const [activeBuffs, setActiveBuffs] = useState({});
  const [permanentBuffs, setPermanentBuffs] = useState({});
  const [freeSpins, setFreeSpins] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [inventory, setInventory] = useState({});
  const [showInventory, setShowInventory] = useState(false);
  const [upgradedRoomId, setUpgradedRoomId] = useState(null);
  const [explodingSlots, setExplodingSlots] = useState(new Set());
  const [showCrafting, setShowCrafting] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [playerStats, setPlayerStats] = useState({ totalTokensProduced: 0, maxLevelReached: 1 });
  const [isCollectingAll, setIsCollectingAll] = useState(false);
  const [readyToCollectCount, setReadyToCollectCount] = useState(0);
  const [isWindowVisible, setIsWindowVisible] = useState(true);
  const [bonusFeedback, setBonusFeedback] = useState({ key: 0, text: '', roomId: null });
  const [itemToApply, setItemToApply] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adRewardPayload, setAdRewardPayload] = useState(null);
  const walletRef = useRef(null);
  const autosaveTimerRef = useRef(null);
  // const [showStarterPack, setShowStarterPack] = useState(false); // <<< REMOVIDO
  const SPIN_COST_USD = 5.00;

  const [showMarket, setShowMarket] = useState(false);
  const [showExpeditions, setShowExpeditions] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  const [showAsylum, setShowAsylum] = useState(false);
  const [revealedNft, setRevealedNft] = useState(null);

  const [showMysticSale, setShowMysticSale] = useState(false);
  const [revealedMysticNft, setRevealedMysticNft] = useState(null);
  
  const getInitialUnlockedSlots = () => {
      const unlocked = {};
      [1, 16, 31, 46, 61].forEach(startId => {
          for(let i = 0; i < 5; i++) {
              unlocked[startId + i] = true;
          }
      });
      return unlocked;
  };
  const [unlockedSlots, setUnlockedSlots] = useState(getInitialUnlockedSlots());
  const [showDoorModal, setShowDoorModal] = useState(false);
  const [slotToUnlock, setSlotToUnlock] = useState(null);
  const [animatingItem, setAnimatingItem] = useState(null);
  
  const [showWheel, setShowWheel] = useState(true);
  const [showWheelParticles, setShowWheelParticles] = useState(false);

  const [showSellModal, setShowSellModal] = useState(false);
  const [itemToSell, setItemToSell] = useState(null);

  const [isPurchasingProduct, setIsPurchasingProduct] = useState(false);
  const [purchaseFeedback, setPurchaseFeedback] = useState({ message: '', type: '' });

  const hasMysticNFT = userNFTs.some(nft => nft.rarity === MYSTIC_RARITY_VALUE);
  const hasPremiumPass = activeBuffs.premiumPass > Date.now();
  const isFinalPremium = hasMysticNFT || hasPremiumPass;

  const wingsData = getWingsData(lang);

  const groupedNftsByRarity = userNFTs.reduce((acc, nft) => {
    const rarity = nft.rarity || 'Common';
    if (!acc[rarity]) {
        acc[rarity] = [];
    }
    acc[rarity].push(nft);
    return acc;
  }, {});

  const rarityOrder = ["Mystic", "Legendary", "Epic", "Rare", "Uncommon", "Common"];

  // --- FUNÇÕES DE LÓGICA DE JOGO ATUALIZADAS ---
  
  const calculateUpgradeCost = useCallback((level) => {
    const costs = {};
    if (level >= 1 && level <= 60) {
        costs.INSULINE = 15 * Math.pow(1.14, level - 1);
    } else if (level >= 61 && level <= 120) {
        costs.INSULINE = 15 * Math.pow(1.14, level - 1);
        costs.ZOLGENSMA = 2 * Math.pow(1.11, level - 61);
    } else if (level >= 121 && level <= 180) {
        costs.ZOLGENSMA = 2 * Math.pow(1.11, level - 61);
        costs.LUXUTURNA = 1 * Math.pow(1.10, level - 121);
    } else if (level >= 181 && level <= 250) {
        costs.LUXUTURNA = 1 * Math.pow(1.10, level - 121);
        costs.ZYNTEGLO = 0.2 * Math.pow(1.12, level - 181);
    }
    
    for (const token in costs) {
        costs[token] = parseFloat(costs[token].toFixed(4));
    }
    return costs;
  }, []);

  const calcProgression = useCallback((level) => {
    const tFactor = Math.pow(MAX_TIME / MIN_TIME, (level - 1) / (MAX_LEVEL - 1));
    const rFactor = Math.pow(MAX_REWARD / MIN_REWARD, (level - 1) / (MAX_LEVEL - 1));
    return { time: Math.round(MIN_TIME * tFactor), reward: MIN_REWARD * rFactor };
  }, [MAX_LEVEL, MAX_REWARD, MAX_TIME, MIN_REWARD, MIN_TIME]);


  useEffect(() => {
    const savedLang = localStorage.getItem('game_language') || 'en';
    setLang(savedLang);
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('game_language', newLang);
  };

  const showNotification = useCallback((msg, type = "success", duration = 3000) => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification({ message: "", type: "" }), duration);
  }, []);

  const fetchRonBalance = useCallback(async () => {
    if (!provider || !userAddress) return;
    try {
      const balanceInWei = await provider.getBalance(userAddress);
      setRonBalance(ethers.utils.formatEther(balanceInWei));
    } catch (e) { console.warn("Error getting RON balance:", e); }
  }, [provider, userAddress]);

  const fetchBlockchainBalances = useCallback(async () => {
    if (!provider || !userAddress) return;
    
    const tokenSymbols = ["INSULINE", "ZOLGENSMA", "LUXUTURNA", "ZYNTEGLO", "VIDA"];
    const newBalances = {};

    try {
        for (const symbol of tokenSymbols) {
            const contract = getTokenContract(symbol, provider);
            const balanceWei = await contract.balanceOf(userAddress);
            newBalances[symbol] = parseFloat(ethers.utils.formatEther(balanceWei));
        }
        setBlockchainBalances(newBalances);
    } catch (error) {
        console.error("Falha ao buscar saldos da blockchain:", error);
        showNotification("Could not fetch token balances from the blockchain.", "error");
    }
  }, [provider, userAddress, showNotification]);

  const handleModalTransaction = useCallback(async () => {
    if (!userAddress) return;
    const data = await loadGameState(userAddress);
    if (data && data.balances) {
      setBalances(data.balances);
    }
    await fetchBlockchainBalances();
  }, [userAddress, fetchBlockchainBalances]);

  const updateUserNFTs = useCallback(async (address) => {
    if (address) {
      const nfts = await fetchUserRoninNFTs(address);
      setUserNFTs(nfts);
    } else {
      setUserNFTs([]);
    }
  }, []); 
  
  const handleRerollComplete = useCallback((apiResponse) => {
    if (apiResponse && apiResponse.newlyMintedNft) {
      setRevealedNft(apiResponse.newlyMintedNft);
    }
    if(userAddress) {
        updateUserNFTs(userAddress);
    }
    handleModalTransaction();
  }, [userAddress, updateUserNFTs, handleModalTransaction]);
  
  const handleClaimMysticReward = useCallback(() => {
    setFreeSpins(prev => prev + 5);
  }, []);

  const loadAndSetGameState = useCallback(async (address) => {
    let data = await loadGameState(address);

    const needsInitialization = !data;
    if (needsInitialization) {
      data = {
        balances: {}, levels: {}, timers: {}, costs: {}, maxTimes: {}, rewards: {},
        selectedNFTs: {}, selectedMeta: {}, usedNFTKeys: [], burnedNFTKeys: [],
        activeBuffs: {}, permanentBuffs: {}, freeSpins: 0, inventory: {},
        playerStats: { totalTokensProduced: 0, maxLevelReached: 1 },
        unlockedSlots: getInitialUnlockedSlots()
      };
    }

    const initialCosts = data.costs || {};
    const initialRewards = data.rewards || {};
    const initialMaxTimes = data.maxTimes || {};
    
    rooms.forEach(room => {
        const currentLevel = data.levels?.[room.id] || 1;
        if (!initialCosts[room.id]) {
            initialCosts[room.id] = calculateUpgradeCost(currentLevel);
        }
        if (!initialRewards[room.id]) {
            const progression = calcProgression(currentLevel);
            initialRewards[room.id] = progression.reward;
            initialMaxTimes[room.id] = progression.time;
        }
    });

    setBalances(data.balances || {});
    setLevels(data.levels || {});
    setTimers(data.timers || {});
    setCosts(initialCosts);
    setMaxTimes(initialMaxTimes);
    setRewards(initialRewards);
    setSelectedNFTs(data.selectedNFTs || {});
    setSelectedMeta(data.selectedMeta || {});
    setUsedNFTKeys(new Set(data.usedNFTKeys || []));
    setBurnedNFTKeys(new Set(data.burnedNFTKeys || []));
    setActiveBuffs(data.activeBuffs || {});
    setPermanentBuffs(data.permanentBuffs || {});
    setFreeSpins(data.freeSpins || 0);
    setInventory(data.inventory || {});
    setPlayerStats(data.playerStats || { totalTokensProduced: 0, maxLevelReached: 1 });
    setUnlockedSlots(data.unlockedSlots || getInitialUnlockedSlots());

    if (needsInitialization) {
        await saveGameState(address, {
            ...data,
            costs: initialCosts, 
            maxTimes: initialMaxTimes, 
            rewards: initialRewards,
        });
    }
  }, [calculateUpgradeCost, calcProgression]);

  useEffect(() => {
    if (userAddress) {
      const setupGameForWallet = async () => {
        setIsLoading(true);
        await Promise.all([
            loadAndSetGameState(userAddress),
            updateUserNFTs(userAddress),
            fetchRonBalance(),
            fetchBlockchainBalances()
        ]);
        setIsLoading(false);
      };
      setupGameForWallet();
    } else {
      setIsLoading(false);
    }
  }, [userAddress, loadAndSetGameState, updateUserNFTs, fetchRonBalance, fetchBlockchainBalances]);

  useEffect(() => {
    if (userAddress) {
        const fetchCurrentEvent = async () => {
            try {
                const response = await fetch('/api/events/current'); 
                const data = await response.json();
                if (data.success && data.event) setActiveEvent(data.event);
                else setActiveEvent(null);
            } catch (error) {
                console.error("Falha ao buscar evento atual:", error);
                setActiveEvent(null);
            }
        };
        fetchCurrentEvent();
    }
  }, [userAddress]);
  
  const handleDisconnectWalletWrapper = () => {
    disconnectWallet();
    setShowWalletModal(false);
  };
  
  useEffect(() => {
    const handleVisibilityChange = () => setIsWindowVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const readyCount = rooms.reduce((count, room) => {
      if ((timers[room.id] || 0) === 0 && selectedNFTs[room.id]) return count + 1;
      return count;
    }, 0);
    setReadyToCollectCount(readyCount);
  }, [timers, selectedNFTs]);

  useEffect(() => {
    if (!isWindowVisible && readyToCollectCount > 0) document.title = `(${readyToCollectCount}) Hospital Fumegator`;
    else document.title = 'Hospital Fumegator';
  }, [readyToCollectCount, isWindowVisible]);

  useEffect(() => {
    if (userAddress) {
      const lastClaim = localStorage.getItem(`lastDailyClaim_${userAddress}`);
      const now = new Date();
      const lastClaimDate = lastClaim ? new Date(Number(lastClaim)) : null;
      if (!lastClaimDate || now.toDateString() !== lastClaimDate.toDateString()) {
        setShowDailyBonus(true);
      }
    }
  }, [userAddress]);

  const handleClaimDailyBonus = () => {
    setFreeSpins(prev => prev + 1);
    localStorage.setItem(`lastDailyClaim_${userAddress}`, Date.now().toString());
    setShowDailyBonus(false);
    showNotification(t('daily_bonus_claim', lang), "success");
  };

  const handleCraft = async (recipeId) => {
    try {
      const res = await fetch('/api/crafting/craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: userAddress, recipeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      showNotification(data.message, "success");
      
      if (activeEvent?.id === 2 && recipeId === 'EVENT_STABILIZER') {
          fetch('/api/events/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  wallet: userAddress,
                  eventId: activeEvent.id,
                  progressAmount: 1
              }),
          });
      }

      if (data.craftedItem) {
        if (data.craftedItem.type === 'CONSUMABLE' && data.craftedItem.itemId === 'freeSpins') {
            setFreeSpins(prev => prev + data.craftedItem.quantity);
        } else if (data.craftedItem.type === 'APPLICABLE') {
            setItemToApply({ itemId: data.craftedItem.itemId, days: data.craftedItem.itemId.includes('5d') ? 5 : 15 });
            setShowNFTModal(true);
        } else if (data.craftedItem.type === 'EQUIPMENT') {
            setInventory(prev => ({ ...prev, [data.craftedItem.itemId]: { ...data.craftedItem, quantity: (prev[data.craftedItem.itemId]?.quantity || 0) + 1 } }));
        }
      }
      
      setBalances(data.newBalances);
      setShowCrafting(false);

    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  const handlePrestige = async (roomId) => {
    if (!window.confirm(t('prestige_confirm', lang))) return;
    if ((levels[roomId] || 1) < MAX_LEVEL) {
        showNotification(t('specialization_max_level_error', lang), "error");
        return;
    }
    setLevels(prev => ({ ...prev, [roomId]: 1 }));
    setPermanentBuffs(prev => {
        const newPrestiges = { ...(prev.prestiges || {}) };
        newPrestiges[roomId] = (newPrestiges[roomId] || 0) + 1;
        return { ...prev, prestiges: newPrestiges };
    });
    const newPrestigeLevel = (permanentBuffs.prestiges?.[roomId] || 0) + 1;
    showNotification(t('specialization_success', lang, { level: newPrestigeLevel }), "success");
  };

  const handlePremiumClick = (e) => {
    e.preventDefault();
    if (isFinalPremium) {
        showNotification(t('premium_already_active', lang), 'info');
    } else {
        setShowMysticSale(true);
    }
  };

  const handleProductPurchase = useCallback(async (productId) => {
    if (!signer || !userAddress || !provider) {
        setPurchaseFeedback({ message: 'Please connect your Ronin wallet first.', type: 'error' });
        return;
    }
    
    setIsPurchasingProduct(true);
    setPurchaseFeedback({ message: 'Aprovando pagamento na sua carteira...', type: 'info' });

    const productPrices = { 'mystic_pack': '15.0', 'starter_pack': '0.5' };
    const price = productPrices[productId];
    
    if (!price) {
        setPurchaseFeedback({ message: 'Produto inválido.', type: 'error' });
        setIsPurchasingProduct(false);
        return;
    }

    try {
        const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS_RONIN.replace('ronin:', '0x');
        const resolvedAddress = await provider.resolveName(treasuryAddress).catch(() => treasuryAddress);

        const tx = await signer.sendTransaction({
            to: resolvedAddress,
            value: ethers.utils.parseEther(price),
        });
        setPurchaseFeedback({ message: 'Pagamento enviado! Finalizando a entrega...', type: 'info' });
        await tx.wait();

        const response = await fetch('/api/shop/buy-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userWallet: userAddress, productId, transactionHash: tx.hash }),
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Falha na entrega do produto.');
        
        setPurchaseFeedback({ message: "Sucesso! Seu produto foi entregue na sua carteira.", type: 'success' });
        
        if (data.newlyMintedNft) {
            setRevealedMysticNft(data.newlyMintedNft);
        }
        
        if (userAddress) {
            updateUserNFTs(userAddress);
        }
        
        setTimeout(() => {
            setShowMysticSale(false);
            // setShowStarterPack(false); // <<< REMOVIDO
            setPurchaseFeedback({ message: '', type: '' });
        }, 3000);

    } catch (error) {
        const errorMessage = error.reason || error.message;
        setPurchaseFeedback({ message: `Erro: ${errorMessage}`, type: 'error' });
    } finally {
        setIsPurchasingProduct(false);
    }
  }, [userAddress, signer, provider, updateUserNFTs]);
  
  const handleCloseReveal = () => {
    setRevealedMysticNft(null);
    if (userAddress) {
        updateUserNFTs(userAddress);
    }
  };

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setIsPriceLoading(true);
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ronin&vs_currencies=usd');
        if (!response.ok) throw new Error("CoinGecko API is unavailable.");
        const data = await response.json();
        if (data.ronin.usd) {
          setSpinCostRon(SPIN_COST_USD / data.ronin.usd);
        } else {
          throw new Error("Invalid response from CoinGecko API.");
        }
      } catch (error) {
        console.error("Failed to fetch RON price:", error);
        setSpinCostRon(0.1);
        showNotification("Could not fetch live price. Using default spin cost.", "info");
      } finally {
        setIsPriceLoading(false);
      }
    };
    fetchPrice();
  }, [showNotification]);

  const handleAdReward = useCallback(() => {
    if (!adRewardPayload || !adRewardPayload.rowId) return;
    const { rowId } = adRewardPayload;
    const roomIdsInRow = rooms.filter(r => r.rowId === rowId).map(r => r.id);
    setTimers((prev) => {
      const newTimers = { ...prev };
      roomIdsInRow.forEach(roomId => {
        if (newTimers[roomId] > 0) newTimers[roomId] = Math.floor(newTimers[roomId] / 2);
      });
      return newTimers;
    });
    showNotification(t('row_accelerated', lang, { rowId }), "success");
    setAdRewardPayload(null);
  }, [adRewardPayload, showNotification, lang]);
  
  const handleCloseAdModal = useCallback(() => {
    setShowAdModal(false);
  }, []);

  const boostRow = (rowId) => {
    if (!rooms.some(r => r.rowId === rowId && timers[r.id] > 0)) {
      showNotification(t('no_active_mining_in_row', lang, { rowId }), "error");
      return;
    }
    setAdRewardPayload({ rowId });
    setShowAdModal(true);
  };
    
  const handlePrizeWon = useCallback((prize) => {
    if (!prize) return;

    setShowWheel(false);
    setShowWheelParticles(true);

    setTimeout(() => {
      showNotification(t('prize_won', lang, { prizeName: prize.name }), 'success', 5000);
      
      if (prize.type === 'TOKEN') {
        setBalances(prev => ({ 
          ...prev, 
          [prize.token]: (prev[prize.token] || 0) + prize.value 
        }));
      } else if (prize.type === 'NFT') {
        if(userAddress) {
          updateUserNFTs(userAddress);
        }
      }
    }, 1200);
  }, [lang, userAddress, showNotification, t, updateUserNFTs]);

  const handleWheelParticleEnd = () => {
    setShowWheelParticles(false);
    setShowWheel(true);
  };
  
  const handleUseFreeSpin = () => {
    setFreeSpins(prev => Math.max(0, prev - 1));
  };

  const handlePurchase = useCallback(async (item) => {
    if (!userAddress) {
      return showNotification("Please connect your wallet.", "error");
    }

    if (item.currency === 'RON') {
        if (!signer) {
          return showNotification("Wallet signer is not available.", "error");
        }
        
        const currentRonBalance = parseFloat(ronBalance);
        if (currentRonBalance < item.price) {
            return showNotification(`Insufficient RON balance.`, "error");
        }

        try {
            const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS_RONIN;
            if (!TREASURY_ADDRESS) throw new Error("Treasury address is not configured.");

            const tx = {
              to: TREASURY_ADDRESS.replace('ronin:', '0x'),
              value: ethers.utils.parseEther(item.price.toString())
            };
            const txResponse = await signer.sendTransaction(tx);
            const receipt = await txResponse.wait();
            const transactionHash = receipt.transactionHash;

            const res = await fetch('/api/shop/buy-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userWallet: userAddress, itemId: item.id, transactionHash }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to finalize purchase on the server.");

            showNotification('Purchase successful!', 'success');
            if (data.newInventory) setInventory(data.newInventory);
            if (data.newPermanentBuffs) setPermanentBuffs(data.newPermanentBuffs);
            
            fetchRonBalance();
            
            setShowShop(false);
            setAnimatingItem(item);

        } catch (error) {
            console.error("RON Purchase failed:", error);
            showNotification(error.message || "RON transaction failed.", "error");
        }

    } else {
        const currentBalance = balances[item.currency] || 0;
        if (currentBalance < item.price) {
            return showNotification(`Insufficient ${item.currency} balance.`, "error");
        }

        try {
            setBalances(prevBalances => ({
                ...prevBalances,
                [item.currency]: prevBalances[item.currency] - item.price
            }));

            if (item.type === 'PERMANENT_BUFF') {
                setPermanentBuffs(prev => ({ ...prev, [item.buffName]: true }));
            } else if (item.type === 'EQUIPMENT' || item.type === 'TIMED_BUFF') {
                setInventory(prev => ({
                    ...prev,
                    [item.id]: { ...item, quantity: (prev[item.id]?.quantity || 0) + 1 }
                }));
            } else if (item.type === 'INVENTORY') {
                if (item.itemName === 'freeSpins') {
                    setFreeSpins(prev => prev + item.amount);
                }
            }
            
            showNotification('Purchase successful!', 'success');
            setShowShop(false);
            setAnimatingItem(item);

        } catch (error) {
            console.error("Off-chain purchase failed:", error);
            showNotification(error.message || "Purchase failed.", "error");
        }
    }
  }, [userAddress, signer, ronBalance, balances, showNotification, fetchRonBalance]);
  
  const handleEquip = (item) => {
    if (!window.confirm(t('equip_confirm', lang))) return;
    
    setInventory(prev => {
        const currentItem = prev[item.id];
        if (!currentItem || currentItem.quantity <= 0) return prev;
        const newInventory = { ...prev };
        if (currentItem.quantity === 1) delete newInventory[item.id];
        else newInventory[item.id] = { ...currentItem, quantity: currentItem.quantity - 1 };
        return newInventory;
    });

    const now = Date.now();
    setActiveBuffs(prev => ({ ...prev, [item.buffName]: Math.max(prev[item.buffName] || now, now) + (item.duration || 0) }));
    showNotification(t('item_equipped', lang, { itemName: item.name }), "success");
    setShowInventory(false);
  };
  
  const handleOpenSellModal = (item) => {
    setItemToSell(item);
    setShowSellModal(true);
    setShowInventory(false);
  };

  const handleConfirmSell = async (itemId, amount, pricePerUnitInVIDA) => {
    try {
        const res = await fetch('/api/market/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sellerWallet: userAddress,
                tokenType: itemId,
                amount: amount,
                pricePerUnitInVIDA: pricePerUnitInVIDA,
            }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Failed to list item.');
        }

        showNotification('Item listed on the market successfully!', 'success');
        
        setInventory(prev => {
            const newInventory = { ...prev };
            const currentItem = newInventory[itemId];
            if (currentItem) {
                currentItem.quantity -= amount;
                if (currentItem.quantity <= 0) {
                    delete newInventory[itemId];
                }
            }
            return newInventory;
        });

        setShowSellModal(false);

    } catch (error) {
        showNotification(error.message, 'error');
        console.error('Failed to list item:', error);
    }
  };

  const handleCollectAll = () => {
    setIsCollectingAll(true);
    let collectedCount = 0;
    const newTimers = { ...timers};
    const rewardsToCollect = {};
    let totalTokensProducedThisAction = 0;
    const premiumBonus = isFinalPremium ? PREMIUM_PRODUCTION_BONUS : 1;

    rooms.forEach(room => {
        const roomId = room.id;
        if (timers[roomId] === 0 && selectedNFTs[roomId]) {
            collectedCount++;
            const nftBonus = selectedMeta[roomId]?.bonus;
            const prestigeLevel = permanentBuffs.prestiges?.[roomId] || 0;
            const prestigeBonus = 1 + (prestigeLevel * PRESTIGE_BONUS);
            let eventBonus = 1;
            if (activeEvent?.id === 1 && room.token === 'ZOLGENSMA') {
                eventBonus = activeEvent.bonus_details?.multiplier || 1;
            }
            const baseReward = (productionRates[room.name] ?? 1) * (rewards[roomId] || 1);
            let specialistProductionBonus = 1;
            if (nftBonus && nftBonus.type === 'PRODUCTION_BOOST' && (!nftBonus.area || nftBonus.area === room.token)) {
                specialistProductionBonus = 1 + (nftBonus.value / 100);
            }
            const finalReward = baseReward * prestigeBonus * eventBonus * specialistProductionBonus * premiumBonus;
            totalTokensProducedThisAction += finalReward;
            rewardsToCollect[room.token] = (rewardsToCollect[room.token] || 0) + finalReward;
            if (permanentBuffs.autoClick) {
                let specialistTimeMultiplier = 1;
                if (nftBonus && nftBonus.type === 'TIME_REDUCTION' && (!nftBonus.area || nftBonus.area === room.token)) {
                    specialistTimeMultiplier = 1 - (nftBonus.value / 100);
                }
                newTimers[roomId] = (maxTimes[roomId] || MIN_TIME) * specialistTimeMultiplier;
            }
        }
    });

    if (collectedCount === 0) {
        showNotification(t('nothing_to_collect', lang), "info");
        setIsCollectingAll(false);
        return;
    }

    const zolgensmaCollected = rewardsToCollect['ZOLGENSMA'] || 0;
    if (activeEvent?.id === 1 && zolgensmaCollected > 0) {
        fetch('/api/events/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: userAddress, eventId: activeEvent.id, progressAmount: zolgensmaCollected }),
        });
    }

    setBalances(prev => {
        const updatedBalances = { ...prev };
        for (const token in rewardsToCollect) {
            updatedBalances[token] = (updatedBalances[token] || 0) + rewardsToCollect[token];
        }
        return updatedBalances;
    });

    setTimers(newTimers);
    setPlayerStats(prev => ({ ...prev, totalTokensProduced: prev.totalTokensProduced + totalTokensProducedThisAction }));
    showNotification(t('all_collected', lang, { count: collectedCount }), "success");
    setIsCollectingAll(false);
  };
  
  const handleHoneypotTrigger = async (trapId) => {
    if (!userAddress) return;
    try {
      await fetch('/api/security/honeypot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: userAddress, trapId }),
      });
    } catch (error) {
      console.error("Honeypot trigger failed to report.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (walletRef.current && !walletRef.current.contains(event.target)) setWalletMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    setCanWithdrawAny(REAL_TOKENS.some(k => (balances[k] || 0) >= MIN_WITHDRAW));
  }, [balances, MIN_WITHDRAW]);

  const gameStateRef = useRef({});
  useEffect(() => {
    gameStateRef.current = {
      balances, levels, timers, costs, maxTimes, rewards,
      selectedNFTs, selectedMeta,
      usedNFTKeys: Array.from(usedNFTKeys), burnedNFTKeys: Array.from(burnedNFTKeys),
      activeBuffs, permanentBuffs,
      freeSpins, inventory, playerStats,
      unlockedSlots
    };
  });
  
  const saveSnapshot = async () => {
    if (!userAddress) return;
    try { 
        await saveGameState(userAddress, gameStateRef.current);
    } catch (error) { 
        console.error('Failed to save snapshot:', error); 
    }
  };

  useEffect(() => {
    if (!userAddress) return;
    clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(saveSnapshot, 5000);
    return () => clearTimeout(autosaveTimerRef.current);
  }, [userAddress, balances, levels, costs, maxTimes, rewards, selectedNFTs, selectedMeta, usedNFTKeys, burnedNFTKeys, activeBuffs, permanentBuffs, freeSpins, inventory, playerStats, unlockedSlots]);

  useEffect(() => {
    const handleBeforeUnload = () => saveSnapshot();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userAddress]);

  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        let buffsChanged = false;
        const newActiveBuffs = { ...activeBuffs };

        Object.keys(newActiveBuffs).forEach(key => {
            if (newActiveBuffs[key] < now) {
                delete newActiveBuffs[key];
                buffsChanged = true;
                setExplodingSlots(prev => new Set(prev).add(key));
                setTimeout(() => setExplodingSlots(prev => {
                    const next = new Set(prev);
                    next.delete(key);
                    return next;
                }), 1000);
            }
        });
        if (buffsChanged) setActiveBuffs(newActiveBuffs);
        
        const tick = newActiveBuffs.timeAccelerator ? TIME_ACCELERATOR_MULTIPLIER : 1;
        const premiumBonus = isFinalPremium ? PREMIUM_PRODUCTION_BONUS : 1;
        
        setTimers((prev) => {
            let hasChanged = false;
            const newTimers = { ...prev };
            let tokensProducedThisTick = 0;
            for (const id in newTimers) {
                if (newTimers[id] > 0) {
                    newTimers[id] = Math.max(0, newTimers[id] - tick);
                    hasChanged = true;
                    if (newTimers[id] <= 0) {
                        const room = rooms.find(r => r.id === Number(id));
                        if (room) {
                            const nftBonus = selectedMeta[id]?.bonus;
                            const prestigeLevel = permanentBuffs.prestiges?.[id] || 0;
                            const prestigeBonus = 1 + (prestigeLevel * PRESTIGE_BONUS);
                            let eventBonus = 1;
                            if (activeEvent?.id === 1 && room.token === 'ZOLGENSMA') {
                                eventBonus = activeEvent.bonus_details?.multiplier || 1;
                            }
                            const baseReward = (productionRates[room.name] ?? 1) * (rewards[id] || 1);
                            let specialistProductionBonus = 1;
                            if (nftBonus && nftBonus.type === 'PRODUCTION_BOOST' && (!nftBonus.area || nftBonus.area === room.token)) {
                                specialistProductionBonus = 1 + (nftBonus.value / 100);
                                setBonusFeedback({ key: Date.now(), text: `+${nftBonus.value}% Bonus!`, roomId: Number(id) });
                            }
                            const finalReward = baseReward * prestigeBonus * eventBonus * specialistProductionBonus * premiumBonus;
                            tokensProducedThisTick += finalReward;
                            setBalances((b) => ({ ...b, [room.token]: (b[room.token] || 0) + finalReward }));
                            
                            if (permanentBuffs.autoClick && selectedNFTs[id]) {
                                let specialistTimeMultiplier = 1;
                                if (nftBonus && nftBonus.type === 'TIME_REDUCTION' && (!nftBonus.area || nftBonus.area === room.token)) {
                                    specialistTimeMultiplier = 1 - (nftBonus.value / 100);
                                }
                                newTimers[id] = (maxTimes[id] || MIN_TIME) * specialistTimeMultiplier;
                            }
                        }
                    }
                }
            }
            if(tokensProducedThisTick > 0){
                setPlayerStats(prev => ({ ...prev, totalTokensProduced: prev.totalTokensProduced + tokensProducedThisTick }));
            }
            return hasChanged ? newTimers : prev;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeBuffs, permanentBuffs, rewards, selectedNFTs, maxTimes, productionRates, MIN_TIME, TIME_ACCELERATOR_MULTIPLIER, activeEvent, selectedMeta, isFinalPremium, balances]);
  
  const startShift = (roomId) => {
    if (!selectedNFTs[roomId]) { 
      showNotification(t('add_nft_to_start', lang), "error"); 
      return; 
    }
    if ((timers[roomId] || 0) <= 0) {
        const room = rooms.find(r => r.id === roomId);
        const nftBonus = selectedMeta[roomId]?.bonus;
        let specialistTimeMultiplier = 1;
        if (nftBonus && nftBonus.type === 'TIME_REDUCTION' && (!nftBonus.area || nftBonus.area === room.token)) {
            specialistTimeMultiplier = 1 - (nftBonus.value / 100);
            setBonusFeedback({ key: Date.now(), text: `-${nftBonus.value}% Time!`, roomId: roomId });
        }
        const finalTime = (maxTimes[roomId] || MIN_TIME) * specialistTimeMultiplier;
        setTimers((p) => ({ ...p, [roomId]: finalTime }));
    }
  };
  
  const upgradeLevel = async (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    if (!selectedNFTs[roomId]) {
        showNotification(t('add_nft_button', lang), "error");
        return;
    }

    const currentLevel = levels[roomId] || 1;
    if (currentLevel >= MAX_LEVEL) {
        showNotification(t('max_level_reached', lang), "warning");
        return;
    }

    const requiredCosts = calculateUpgradeCost(currentLevel);
    let canAfford = true;
    let missingResources = [];

    for (const token in requiredCosts) {
        const cost = requiredCosts[token];
        const balance = balances[token] || 0;
        if (balance < cost) {
            canAfford = false;
            missingResources.push(`${cost.toFixed(2)} ${token}`);
        }
    }

    if (!canAfford) {
        showNotification(`Insufficient funds! Required: ${missingResources.join(', ')}`, "error", 4000);
        return;
    }

    const newBalances = { ...balances };
    for (const token in requiredCosts) {
        newBalances[token] -= requiredCosts[token];
    }
    setBalances(newBalances);

    const newLevel = currentLevel + 1;
    setLevels(prev => ({ ...prev, [roomId]: newLevel }));

    const newCostsForRoom = calculateUpgradeCost(newLevel);
    setCosts(prev => ({ ...prev, [roomId]: newCostsForRoom }));

    const progression = calcProgression(newLevel);
    setMaxTimes(prev => ({ ...prev, [roomId]: progression.time }));
    setRewards(prev => ({ ...prev, [roomId]: progression.reward }));

    setPlayerStats(prev => ({...prev, maxLevelReached: Math.max(prev.maxLevelReached, newLevel)}));
    setUpgradedRoomId(roomId);
    setTimeout(() => setUpgradedRoomId(null), 600);
    showNotification(t('room_upgraded', lang, { roomName: room.name, level: newLevel }), "success");

    const rewardInfo = levelUpRewards.find(r => r.level === newLevel);
    if (rewardInfo) {
        const claimedRewards = permanentBuffs.claimedLevelRewards || {};
        const rewardKey = `room_${roomId}_level_${newLevel}`;
        if (!claimedRewards[rewardKey]) {
            setBalances(prev => ({ ...prev, VIDA: (prev.VIDA || 0) + rewardInfo.reward }));
            setPermanentBuffs(prev => ({
                ...prev,
                claimedLevelRewards: { ...prev.claimedLevelRewards, [rewardKey]: true }
            }));
            showNotification(t('milestone_reward', lang, { roomName: room.name, reward: rewardInfo.reward, level: newLevel }), "success", 8000);
        }
    }
  };

  const openNFTModal = (slotId) => { 
    if (itemToApply) {
        showNotification(t('select_nft_for_extension', lang), "info");
    }
    setCurrentSlot(slotId); 
    setShowNFTModal(true); 
  };
  
  const burnNFT = (key) => {
    const nftData = userNFTs.find(nft => nftKey(nft) === key);
    if (nftData && nftData.rarity === 'Mystic') {
        return;
    }

    setBurnedNFTKeys((prev) => new Set(prev).add(key));
    setUsedNFTKeys((prev) => { const next = new Set(prev); next.delete(key); return next; });
    const newSelectedMeta = { ...selectedMeta };
    
    const slotId = Object.keys(newSelectedMeta).find(slot => newSelectedMeta[slot]?.key === key);
    if (slotId) {
        delete newSelectedMeta[slotId];
    }
    
    setSelectedMeta(newSelectedMeta);
    showNotification(t('nft_expired', lang), "info", 6000);
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      const toBurn = Object.values(selectedMeta).filter(meta => meta?.assignedAt && (Date.now() - meta.assignedAt >= NFT_LIFETIME_MS)).map(meta => meta.key);
      if (toBurn.length) toBurn.forEach(k => burnNFT(k));
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedMeta]);
  
  useEffect(() => {
    Object.keys(timers).forEach((slotId) => {
      if (!selectedNFTs[slotId] && timers[slotId] > 0) {
        setTimers((p) => ({ ...p, [slotId]: 0 }));
        showNotification(t('mining_stopped_nft_removed', lang, { slotId }), "warning");
      }
    });
  }, [selectedMeta]);
  
  const selectNFT = async (nft) => {
    if (itemToApply) {
        fetch('/api/items/extend-nft-life', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: userAddress, nftKey: nftKey(nft), days: itemToApply.days }),
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success) throw new Error(data.error);
            showNotification(t('nft_life_extended', lang, { nftName: nft.name, days: itemToApply.days }), 'success');
            loadGameState(userAddress).then(loadedData => {
                if (loadedData) setSelectedMeta(loadedData.selectedMeta || {});
            });
        })
        .catch(err => showNotification(err.message, 'error'));

        setItemToApply(null);
        setShowNFTModal(false);
        return;
    }
    
    if (!currentSlot) return;
    const room = rooms.find(r => r.id === currentSlot);
    const requiredRarity = rowIdToRarityMap[room.rowId];
    
    if (nft.rarity !== requiredRarity) {
        showNotification(t('rarity_requirement', lang, { rarity: requiredRarity }), "error");
        return;
    }
    const key = nftKey(nft);
    if (usedNFTKeys.has(key)) {
        showNotification(t('nft_already_in_use', lang), "error");
        return;
    }

    showNotification(t('nft_assigned_success', lang, { nftName: nft.name }), "success");
    const bonus = getBonusFromAttributes(nft.attributes);
    if (bonus) {
        showNotification(t('specialist_bonus_activated', lang, { type: bonus.type, value: bonus.value }), "success", 4000);
    }

    setSelectedNFTs((prev) => ({ ...prev, [currentSlot]: nft.image }));
    setSelectedMeta((prev) => ({ ...prev, [currentSlot]: { key, assignedAt: Date.now(), bonus } }));
    setUsedNFTKeys((prev) => new Set(prev).add(key));
    setShowNFTModal(false);
    setCurrentSlot(null);
  };

  const handleWithdrawFunc = async (tokenKey) => {
    try {
      setWithdrawError(null);
      setIsWithdrawing(true);
      if (!userAddress) throw new Error(t('connect_wallet_to_withdraw', lang));

      const resp = await fetch("/api/withdraw", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: userAddress, tokenKey }),
      });
      const data = await resp.json();
      
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.error || "Unknown backend withdraw error");
      }
      
      setBalances((prev) => ({ ...prev, [tokenKey]: 0 }));
      showNotification(t('withdraw_request_sent', lang, { tokenKey }), "success");
      setShowWithdrawModal(false);

    } catch (e) {
      setWithdrawError(e.message || "Error withdrawing");
      showNotification(`Withdraw error: ${e.message || "Unknown"}`, "error");
    } finally {
        setIsWithdrawing(false);
    }
  };

  // const handlePackClaimed = (newNfts) => { // <<< REMOVIDO
  //   if (userAddress) {
  //       updateUserNFTs(userAddress);
  //   }
  // };
  
  const handleUnlockSlot = (slotId) => {
    setSlotToUnlock(slotId);
    setShowDoorModal(true);
  };

  const handleConfirmUnlock = useCallback(async (slotId, currency) => {
    const costs = SLOT_UNLOCK_COSTS[slotId];
    if (!costs) {
        showNotification("Cost not defined for this slot.", "error");
        return false;
    }

    const costAmount = costs[currency.toLowerCase()];
    if (typeof costAmount !== 'number') {
        showNotification("Invalid currency.", "error");
        return false;
    }

    if (currency === 'RON') {
        if (!signer) {
            showNotification("Please connect your wallet.", "error");
            return false;
        }
        try {
            const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS_RONIN;
            const tx = {
                to: TREASURY_ADDRESS.replace('ronin:', '0x'),
                value: ethers.utils.parseEther(costAmount.toString())
            };
            const txResponse = await signer.sendTransaction(tx);
            await txResponse.wait();
        } catch (error) {
            console.error("RON Unlock Transaction Error:", error);
            showNotification("RON transaction failed.", "error");
            return false;
        }
    }

    try {
        const res = await fetch('/api/shop/unlock-slot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userWallet: userAddress, slotId, currency }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        
        showNotification(data.message, 'success');
        setUnlockedSlots(data.newUnlockedSlots);
        if (data.newBalances) setBalances(data.newBalances);
        setShowDoorModal(false);
        return true;
    } catch (error) {
        showNotification(error.message, "error");
        if (currency === 'RON') {
            showNotification("RON payment was successful, but failed to update game state. Please contact support.", "error");
        }
        return false;
    }
  }, [userAddress, signer, showNotification]);
  
  const renderWingContent = () => {
    const currentWingData = wingsData.find(w => w.id === activeWing);
    if (!currentWingData) return null;

    const wingRooms = rooms.filter(room => room.rowId === activeWing);
    const roomRows = [];
    for (let i = 0; i < wingRooms.length; i += 5) {
        roomRows.push(wingRooms.slice(i, i + 5));
    }

    return (
      <div className={styles.containmentWing}>
        <div className={styles.wingHeader}>
          <button onClick={() => setActiveWing(null)} className={styles.backButton}>
            <FaArrowLeft /> {t('back_to_corridor', lang)}
          </button>
          <h1 className={`${styles.wingTitle} ${currentWingData.style}`}>{currentWingData.name}</h1>
        </div>
        
        <div className={styles.wingLayout}>
          <div className={styles.mainWingContent}>
            {roomRows.map((rowOfRooms, rowIndex) => (
              <div key={rowIndex} className={styles.fullRowWrapper}>
                <div className={styles.rowBoostButtonContainer}>
                  <button className={`${styles.btn} ${styles.btnAdBoost}`} onClick={() => boostRow(rowOfRooms[0].rowId)}><FaVideo /></button>
                </div>
                <div className={styles.cardsRow}>
                  {rowOfRooms.map(room => {
                    const isUnlocked = unlockedSlots[room.id] || false;
                    const time = timers[room.id] || 0;
                    const total = maxTimes[room.id] || MIN_TIME;
                    const pct = total > 0 ? Math.max(0, Math.min(100, (time / total) * 100)) : 0;
                    const isUpgrading = upgradedRoomId === room.id;
                    
                    return (
                      <div key={room.id} className={`${styles.card} ${isUpgrading ? styles.upgradeFlash : ''}`}>
                        {!isUnlocked && (
                          <div className={styles.slotOverlay} onClick={() => handleUnlockSlot(room.id)}>
                            <button className={styles.unlockButtonVisual}>
                              <FaLock />
                              <span>{t('unlock_slot', lang)}</span>
                            </button>
                          </div>
                        )}
                        <div className={styles.cardInner} style={{ filter: isUnlocked ? 'none' : 'blur(4px)' }}>
                          <div className={styles.imageWrap}>
                            {selectedNFTs[room.id] ? ( <img src={selectedNFTs[room.id]} alt="NFT Placed" className={styles.nftImagePlaced} /> ) : ( <button className={styles.addNFTButton} onClick={() => openNFTModal(room.id)}>{t('add_nft_button', lang)}</button> )}
                          </div>
                          <div className={styles.cardTitle}>{room.name}</div>
                          <div className={styles.infoColumn}>
                            <div className={styles.badge}><span className={styles.badgeLabel}>{t('level', lang)}</span><span className={styles.badgeValue}>{levels[room.id] || 1}</span></div>
                            <div className={styles.badge}><span className={styles.badgeLabel}>{t('balance', lang)}</span><span className={styles.badgeValue}>{(balances[room.token] || 0).toFixed(4)}</span></div>
                            <div className={styles.badge}>
                                <span className={styles.badgeLabel}>{t('cost', lang)}</span>
                                <div className={styles.costValues}>
                                    {costs[room.id] && Object.entries(costs[room.id]).map(([token, amount]) => (
                                        <span key={token} className={styles.badgeValue}>{amount.toFixed(2)} {token.substring(0,4)}</span>
                                    ))}
                                </div>
                            </div>
                          </div>
                          {selectedNFTs[room.id] && <EKGAnimation />}
                          <div className={styles.controls}>
                            <button className={`${styles.btn} ${styles.btnPlay}`} onClick={() => startShift(room.id)} disabled={!selectedNFTs[room.id]}><FaPlay /></button>
                            { (levels[room.id] || 1) >= MAX_LEVEL ? ( <button className={`${styles.btn} ${styles.btnPrestige}`} onClick={() => handlePrestige(room.id)} disabled={!selectedNFTs[room.id]}>★</button> ) : ( <button className={`${styles.btn} ${styles.btnUpgrade}`} onClick={() => upgradeLevel(room.id)} disabled={!selectedNFTs[room.id]}><FaArrowUp /></button> )}
                          </div>
                          <div className={styles.timerBar}><div className={styles.timerFill} style={{ width: `${100 - pct}%` }} /></div>
                          <div className={styles.timerText}>⏳ {Math.ceil(timers[room.id] || 0)}s</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.rightSidebar}>
            <Equipment activeBuffs={activeBuffs} permanentBuffs={permanentBuffs} explodingSlots={explodingSlots} lang={lang} />
          </div>
        </div>
      </div>
    );
  };
  
  if (isRoninLoading) {
    return <LoadingSpinner message="Inicializando Conexão com a Carteira..." />;
  }

  if (!userAddress) {
    return (
      <div className={styles.canvas}>
        <header className={styles.header}>
            <div className={styles.brand}>Hospital Fumegator</div>
            <div style={{ position: "relative" }} ref={walletRef}>
                <div className={styles.languageSelector}>
                    <button onClick={() => changeLanguage('en')} className={lang === 'en' ? styles.activeLang : ''}>EN</button>
                    <button onClick={() => changeLanguage('pt')} className={lang === 'pt' ? styles.activeLang : ''}>PT</button>
                    <button onClick={() => changeLanguage('es')} className={lang === 'es' ? styles.activeLang : ''}>ES</button>
                    <button onClick={() => changeLanguage('zh')} className={lang === 'zh' ? styles.activeLang : ''}>ZH</button>
                </div>
                <button className={styles.walletButton} onClick={connectWallet}>
                    <FaWallet /> Connect Wallet
                </button>
            </div>
        </header>
        <div className={styles.connectWalletPrompt}>
            <img src="/img/mascot-hero.png" alt="Fumegator Logo" className={styles.promptLogo} />
            <h2 className={styles.promptTitle}>Welcome to Hospital Fumegator</h2>
            <p className={styles.promptSubtitle}>Your medical empire awaits. Connect your wallet to begin your journey.</p>
            <button className={styles.promptConnectButton} onClick={connectWallet}>
                <FaWallet /> Connect Wallet
            </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message={t('loading_game_data', lang)} />;
  }
  
  return (
    <div className={styles.canvas}>
      {animatingItem && <PurchaseAnimation item={animatingItem} onAnimationEnd={() => setAnimatingItem(null)} />}
      {showAdModal && <AdModal onClose={handleCloseAdModal} onReward={handleAdReward} lang={lang} />}
      
      {showShop && <Shop balances={balances} onPurchase={handlePurchase} onClose={() => setShowShop(false)} lang={lang} />}
      
      {showInventory && <Inventory inventory={inventory} onEquip={handleEquip} onSell={handleOpenSellModal} onClose={() => setShowInventory(false)} lang={lang} />}

      {showCrafting && <Crafting playerResources={{...balances, ...inventory}} onCraft={handleCraft} onClose={() => setShowCrafting(false)} lang={lang} />}
      
      {showMarket && <MarketModal userWallet={userAddress} initialBalances={blockchainBalances} onClose={() => setShowMarket(false)} onTransactionComplete={handleModalTransaction} lang={lang} />}
      {showExpeditions && <ExpeditionsModal userWallet={userAddress} onClose={() => setShowExpeditions(false)} onTransactionComplete={handleModalTransaction} lang={lang} />}
      {showEvents && <EventsModal userWallet={userAddress} onClose={() => setShowEvents(false)} onTransactionComplete={handleModalTransaction} isFinalPremium={isFinalPremium} onClaimMysticReward={handleClaimMysticReward} lang={lang} />}
      {showReferrals && <ReferralsModal userWallet={userAddress} onClose={() => setShowReferrals(false)} lang={lang} />}
      {showAsylum && <AsylumModal userWallet={userAddress} allUserNfts={userNFTs} burnedKeys={burnedNFTKeys} onClose={() => setShowAsylum(false)} onRerollComplete={handleRerollComplete} lang={lang} />}
      
      <RewardRevealModal isOpen={!!revealedNft} nft={revealedNft} onClose={() => setRevealedNft(null)} lang={lang} />
      
      <MysticSaleModal 
        isOpen={showMysticSale} 
        onClose={() => setShowMysticSale(false)} 
        onPurchase={handleProductPurchase} 
        isPurchasing={isPurchasingProduct}
        feedback={purchaseFeedback}
        lang={lang} 
      />
      
      <MysticRevealModal isOpen={!!revealedMysticNft} newNft={revealedMysticNft} onClose={handleCloseReveal} />
      
      {/* <StarterPackModal // <<< REMOVIDO
        isOpen={showStarterPack}
        onClose={() => setShowStarterPack(false)}
        onPurchase={handleProductPurchase}
        isPurchasing={isPurchasingProduct}
        feedback={purchaseFeedback}
        onPackClaimed={handlePackClaimed}
      /> */}
      
      {showDoorModal && <DoorUnlockModal slotId={slotToUnlock} unlockCost={SLOT_UNLOCK_COSTS[slotToUnlock]} lang={lang} onConfirmUnlock={handleConfirmUnlock} onClose={() => setShowDoorModal(false)} />}
      
      <SellItemModal 
        isOpen={showSellModal}
        onClose={() => setShowSellModal(false)}
        item={itemToSell}
        onConfirm={handleConfirmSell}
        lang={lang}
      />

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        userAddress={userAddress}
        ronBalance={ronBalance}
        gameBalances={balances}
        chainBalances={blockchainBalances}
        onDisconnect={handleDisconnectWalletWrapper}
        lang={lang}
      />

      {showDailyBonus && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <h3>{t('daily_check_in', lang)}</h3>
            <p style={{textAlign: 'center', margin: '2rem 0'}}>{t('daily_bonus_description', lang)}</p>
            <div className={styles.modalActions}>
              <button className={`${baseStyles.button} ${baseStyles.buttonSecondary}`} onClick={handleClaimDailyBonus}>{t('claim_free_spin', lang)}</button>
            </div>
          </div>
        </div>
      )}
      
      <header className={styles.header} style={{ zIndex: 1 }}>
        <div className={styles.brand}>Hospital Fumegator</div>
        <nav className={styles.nav}>
            <div className={styles.navTopRow}>
                <button onClick={() => setShowEvents(true)} className={`${styles.cta} ${styles.ctaGhost}`}>{t('events', lang)}</button>
                <button onClick={() => setShowMarket(true)} className={`${styles.cta} ${styles.ctaGhost}`}>{t('market', lang)}</button>
                <button onClick={() => setShowExpeditions(true)} className={`${styles.cta} ${styles.ctaGhost}`}>{t('expeditions', lang)}</button>
                <button onClick={() => setShowAsylum(true)} className={`${styles.cta} ${styles.ctaAsylum}`}>{t('asylum_the_fumegator', lang)}</button>
                <button onClick={() => setShowReferrals(true)} className={`${styles.cta} ${styles.ctaGhost}`}>{t('referrals', lang)}</button>
            </div>
            <div className={styles.navBottomRow}>
                <button onClick={() => setShowInventory(true)} className={`${styles.cta} ${styles.ctaSolid}`}><FaWarehouse /> {t('warehouse', lang)}</button>
                <button onClick={() => setShowShop(true)} className={`${styles.cta} ${styles.ctaSolid}`}><FaStore /> {t('shop', lang)}</button>
                <button onClick={() => setShowCrafting(true)} className={`${styles.cta} ${styles.ctaSolid}`}><FaFlask /> {t('lab', lang)}</button>
                <button className={`${styles.cta} ${canWithdrawAny ? styles.ctaSolid : styles.ctaDisabled}`} onClick={() => setShowWithdrawModal(true)} disabled={!canWithdrawAny}>{t('withdraw', lang)}</button>
            </div>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={styles.specialActionsContainer}>
                {/* <<< ALTERADO: Botão agora é um link direto para o Discord >>> */}
                <a href="https://discord.gg/9kfJTarXU8" target="_blank" rel="noopener noreferrer" className={`${styles.cta} ${styles.ctaSpecial}`}>
                    Starter Pack
                </a>
                <a href="#" onClick={handlePremiumClick} className={`${styles.cta} ${styles.ctaSpecial}`}>
                    {isFinalPremium ? t('premium_active', lang) : t('premium', lang)}
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
        {activeWing === null ? (
            <>
            <div className={styles.topSection}>
                <HorizontalWheel onPrizeWon={handlePrizeWon} spinCostRon={spinCostRon} isPriceLoading={isPriceLoading} signer={signer} userAddress={userAddress} onTransactionSuccess={fetchRonBalance} showNotification={showNotification} freeSpins={freeSpins} onUseFreeSpin={handleUseFreeSpin} lang={lang} />
            </div>
            <div className={styles.labCorridor}>
                {wingsData.map(wing => (
                    <div key={wing.id} className={`${styles.containmentDoor} ${wing.style}`} onClick={() => setActiveWing(wing.id)}>
                    <div className={styles.doorStripe}></div>
                    <h2 className={styles.doorTitle}>{wing.name}</h2>
                    <p className={styles.doorSubtitle}>{wing.rarity}</p>
                    </div>
                ))}
            </div>
            <div className={styles.warehousePanelWrapper}>
              <section className={styles.warehousePanel}>
                <div className={styles.wHeader}><FaWarehouse /><span>{t('warehouse_announcements', lang)}</span></div>
                <div className={styles.messageBox}>
                  {activeEvent ? (
                    <div className={styles.eventMessage}><strong>{t('active_event', lang).toUpperCase()}:</strong> {activeEvent.name}! {activeEvent.description}</div>
                  ) : (
                    <div className={styles.messageItemEmpty}>{t('no_active_events', lang)}</div>
                  )}
                </div>
                <button className={styles.ctaCollectAll} onClick={handleCollectAll} disabled={isCollectingAll}>
                  <FaCheckDouble /> {isCollectingAll ? t('collecting', lang) : t('collect_all', lang)}
                </button>
              </section>
            </div>
            </>
        ) : (
            renderWingContent()
        )}
      </main>
      
      {showWithdrawModal && (
        <WithdrawModal
          balances={blockchainBalances}
          minWithdraw={MIN_WITHDRAW}
          isWithdrawing={isWithdrawing}
          withdrawError={withdrawError}
          onWithdraw={handleWithdrawFunc}
          onClose={() => setShowWithdrawModal(false)}
          lang={lang}
        />
      )}
      
      {showNFTModal && (
        <div className={styles.nftModal}>
          <div className={styles.nftModalContent}>
            <h3>{itemToApply ? t('apply_item_to', lang, { itemName: itemToApply.itemId }) : t('select_an_nft', lang)}</h3>
            <div className={styles.nftGridContainer}>
              {userNFTs && userNFTs.length > 0 ? (
                userNFTs
                  .filter(nft => !itemToApply || usedNFTKeys.has(nftKey(nft)))
                  .map((nft) => {
                    const key = nftKey(nft);
                    const disabled = !itemToApply && (usedNFTKeys.has(key) || burnedNFTKeys.has(key));
                    return (
                      <div key={key} className={`${styles.nftGridItem} ${disabled ? styles.disabled : ''}`} onClick={() => !disabled && selectNFT(nft)}>
                        <img 
                          src={nft.image} 
                          alt={nft.name} 
                          className={styles.nftGridImage}
                          onError={(e) => { e.currentTarget.src = '/img/NFT_FREE.png'; }} 
                        />
                        <span className={styles.nftGridName}>{nft.name}</span>
                        <span className={styles.nftGridRarity} style={{ backgroundColor: getRarityColor(nft.rarity) }}>
                          {nft.rarity}
                        </span>
                      </div>
                    );
                  })
              ) : (
                <p style={{ textAlign: 'center' }}>{t('no_nfts_found', lang)}</p>
              )}
            </div>
            <button className={styles.closeModal} onClick={() => { setShowNFTModal(false); setItemToApply(null); }}>{t('close', lang)}</button>
          </div>
        </div>
      )}
	  
      {notification.message && (<div className={`${styles.notification} ${styles[notification.type]}`}>{notification.message}</div>)}
    </div>
  );
}