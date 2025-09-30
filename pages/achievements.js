// pages/achievements.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css'; // Para o fundo .canvas
import pageStyles from '../styles/AchievementsPage.module.css'; // Estilos específicos da página

// A lista de conquistas do seu jogo. Mantenha-a consistente.
const achievementsList = [
{ id: 'level_5', name: "Primeiro Diagnóstico", description: "Alcance o Nível 5 em qualquer sala.", reward: 10, icon: '/img/icons/trophy_bronze.png' },
    { id: 'level_18', name: "Residente Dedicado", description: "Alcance o Nível 18.", reward: 10, icon: '/img/icons/trophy_bronze.png' },
    { id: 'level_27', name: "Técnico Especializado", description: "Alcance o Nível 27.", reward: 10, icon: '/img/icons/trophy_bronze.png' },
    { id: 'level_39', name: "Chefe de Ala", description: "Alcance o Nível 39.", reward: 10, icon: '/img/icons/trophy_bronze.png' },
    { id: 'level_45', name: "Coordenador de Protocolos", description: "Alcance o Nível 45.", reward: 10, icon: '/img/icons/trophy_bronze.png' },

    // === Tier 2: A Ascensão do Gestor (Recompensa: 100 VIDA) ===
    { id: 'level_60', name: "Diretor de Departamento", description: "Alcance o Nível 60.", reward: 100, icon: '/img/icons/trophy_silver.png' },
    { id: 'level_85', name: "Mestre da Logística Médica", description: "Alcance o Nível 85.", reward: 100, icon: '/img/icons/trophy_silver.png' },
    { id: 'level_97', name: "Pioneiro da Pesquisa", description: "Alcance o Nível 97.", reward: 100, icon: '/img/icons/trophy_silver.png' },
    { id: 'level_110', name: "Visionário da Cura", description: "Alcance o Nível 110.", reward: 100, icon: '/img/icons/trophy_silver.png' },

    // === Tier 3: O Legado do Administrador (Recompensa: 1000 VIDA) ===
    { id: 'level_140', name: "Arquiteto da Saúde", description: "Alcance o Nível 140.", reward: 1000, icon: '/img/icons/trophy_gold.png' },
    { id: 'level_183', name: "Ícone do Renascimento", description: "Alcance o Nível 183.", reward: 1000, icon: '/img/icons/trophy_gold.png' },
    { id: 'level_201', name: "Salvador de Lumina", description: "Alcance o Nível 201.", reward: 1000, icon: '/img/icons/trophy_gold.png' },
    { id: 'level_211', name: "Lenda Viva", description: "Alcance o Nível 211.", reward: 1000, icon: '/img/icons/trophy_gold.png' },
    { id: 'level_223', name: "Titã da Medicina", description: "Alcance o Nível 223.", reward: 1000, icon: '/img/icons/trophy_gold.png' },
    { id: 'level_237', name: "Esperança Encarnada", description: "Alcance o Nível 237.", reward: 1000, icon: '/img/icons/trophy_gold.png' },
    { id: 'level_246', name: "Quase um Semideus", description: "Alcance o Nível 246.", reward: 1000, icon: '/img/icons/trophy_gold.png' },

    // === Tier Final: A Ascensão (Recompensa: 5000 VIDA + NFT Lendário) ===
    { id: 'level_250', name: "O Pináculo da Cura", description: "Alcance o Nível Máximo (250).", reward: 5000, specialReward: 'NFT Lendário', icon: '/img/icons/trophy_legendary.png' },
];

export default function AchievementsPage() {
    const [achievementsData, setAchievementsData] = useState([]);
    const [rewardsToClaim, setRewardsToClaim] = useState(0);
    const [userWallet, setUserWallet] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClaiming, setIsClaiming] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "" });

    const showNotification = (msg, type = "success", duration = 4000) => {
      setNotification({ message: msg, type });
      setTimeout(() => setNotification({ message: "", type: "" }), duration);
    };

    useEffect(() => {
        const savedWallet = localStorage.getItem("user_wallet");
        if (savedWallet) setUserWallet(savedWallet);
        else setIsLoading(false);
    }, []);

    const fetchAchievementsData = async () => {
        if (!userWallet) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/achievements/status?wallet=${userWallet}`);
            if (!res.ok) throw new Error("Falha ao buscar dados.");
            const data = await res.json();
            
            let claimableCount = 0;
            const combinedData = achievementsList.map(ach => {
                const isCompleted = data.completedAchievements.includes(ach.id);
                const isClaimed = data.claimedAchievements.includes(ach.id);
                if (isCompleted && !isClaimed) {
                    claimableCount++;
                }
                return { ...ach, isCompleted, isClaimed };
            });

            setAchievementsData(combinedData);
            setRewardsToClaim(claimableCount);
        } catch (error) {
            console.error("Falha ao buscar dados de conquistas", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievementsData();
    }, [userWallet]);

    const handleClaimAll = async () => {
        if (!userWallet || isClaiming || rewardsToClaim === 0) return;
        setIsClaiming(true);
        try {
            const res = await fetch('/api/achievements/claim', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wallet: userWallet }) 
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showNotification(data.message, "success");
            fetchAchievementsData(); // Atualiza a lista
        } catch (error) {
            showNotification(error.message, "error");
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <div className={styles.canvas}>
            {notification.message && (<div className={`${styles.notification} ${styles[notification.type]}`}>{notification.message}</div>)}
            
            <div className={pageStyles.pageContainer}>
                <header className={pageStyles.header}>
                    <h1 className={pageStyles.title}>Conquistas</h1>
                    <Link href="/" passHref>
                      <button className={pageStyles.backButton}>Voltar ao Jogo</button>
                    </Link>
                </header>

                <main className={pageStyles.mainBox}>
                    {isLoading ? <p style={{textAlign: 'center', color: 'white'}}>Carregando suas conquistas...</p> : (
                        <>
                            <div className={pageStyles.achievementsGrid}>
                                {achievementsData.map(ach => (
                                    <div key={ach.id} className={`${pageStyles.achievementSlot} ${ach.isClaimed ? pageStyles.claimed : (ach.isCompleted ? pageStyles.completed : '')}`}>
                                        <img src={ach.icon} alt="Conquista" className={pageStyles.icon} />
                                        <h4 className={pageStyles.name}>{ach.name}</h4>
                                        <p className={pageStyles.description}>{ach.description}</p>
                                        <p className={pageStyles.reward}>Recompensa: {ach.reward} VIDA</p>
                                    </div>
                                ))}
                            </div>

                            <footer className={pageStyles.footer}>
                                <button onClick={handleClaimAll} disabled={isClaiming || rewardsToClaim === 0} className={pageStyles.claimButton}>
                                    {isClaiming ? "Coletando..." : `Recolher Tudo (${rewardsToClaim})`}
                                </button>
                            </footer>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}