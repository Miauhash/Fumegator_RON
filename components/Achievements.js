// components/Achievements.js (COMPLETO - NENHUMA ALTERAÇÃO NECESSÁRIA PARA RONIN)
import styles from '../styles/Achievements.module.css';

const achievementsList = [
    { level: 5, name: "Primeiro Diagnóstico", reward: 10 }, { level: 18, name: "Residente Dedicado", reward: 10 },
    { level: 27, name: "Técnico Especializado", reward: 10 }, { level: 39, name: "Chefe de Ala", reward: 10 },
    { level: 45, name: "Coordenador de Protocolos", reward: 10 }, { level: 60, name: "Diretor de Departamento", reward: 100 },
    { level: 85, name: "Mestre da Logística", reward: 100 }, { level: 97, name: "Pioneiro da Pesquisa", reward: 100 },
    { level: 110, name: "Visionário da Cura", reward: 100 }, { level: 140, name: "Arquiteto da Saúde", reward: 1000 },
    { level: 183, name: "Ícone do Renascimento", reward: 1000 }, { level: 201, name: "Salvador de Lumina", reward: 1000 },
    { level: 211, name: "Lenda Viva", reward: 1000 }, { level: 223, name: "Titã da Medicina", reward: 1000 },
    { level: 237, name: "Esperança Encarnada", reward: 1000 }, { level: 246, name: "Quase um Semideus", reward: 1000 },
    { level: 250, name: "O Pináculo da Cura", reward: 5000, specialReward: 'NFT Lendário' },
];

export default function Achievements({ levels }) {
    const safeLevels = levels || {};
    const maxLevelReached = Math.max(0, ...Object.values(safeLevels));

    const nextAchievement = achievementsList.find(ach => ach.level > maxLevelReached);

    if (!nextAchievement) {
        return (
            <div className={styles.achievementsContainer}>
                <div className={styles.achievementItem}>
                    <img src="/img/icons/trophy_legendary.png" alt="Troféu" />
                    <span>Todas as conquistas concluídas!</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.achievementsContainer}>
            <div className={styles.achievementHeader}>Próxima Conquista</div>
            <div className={styles.achievementItem} title={`Recompensa: ${nextAchievement.reward} VIDA`}>
                <img src="/img/icons/trophy.png" alt="Troféu" />
                <span>Alcançar Nível {nextAchievement.level} ({nextAchievement.name})</span>
            </div>
        </div>
    );
}