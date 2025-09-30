// pages/ranking.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import pageStyles from '../styles/AchievementsPage.module.css'; // Reutiliza os estilos da página de conquistas

export default function RankingPage() {
    const [rankingData, setRankingData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRankingData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/ranking/get');
                if (!res.ok) throw new Error("Falha ao buscar dados do ranking.");
                const data = await res.json();
                setRankingData(data);
            } catch (error) {
                console.error("Falha ao buscar ranking", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRankingData();
    }, []);

    return (
        <div className={styles.canvas}>
            <div className={pageStyles.pageContainer}>
                <header className={pageStyles.header}>
                    <h1 className={pageStyles.title}>Ranking Semanal</h1>
                    <Link href="/" passHref>
                      <button className={pageStyles.backButton}>Voltar ao Jogo</button>
                    </Link>
                </header>

                <main className={pageStyles.mainBox}>
                    {isLoading ? <p style={{textAlign: 'center', color: 'white'}}>Carregando o ranking...</p> : (
                        <table style={{width: '100%', color: 'white', borderCollapse: 'collapse'}}>
                            <thead>
                                <tr style={{borderBottom: '2px solid #555'}}>
                                    <th style={{padding: '10px', textAlign: 'left'}}>#</th>
                                    <th style={{padding: '10px', textAlign: 'left'}}>Jogador</th>
                                    <th style={{padding: '10px', textAlign: 'right'}}>Tokens Produzidos</th>
                                    <th style={{padding: '10px', textAlign: 'right'}}>Nível Máximo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankingData.map((player, index) => (
                                    <tr key={player.userWallet} style={{borderBottom: '1px solid #444'}}>
                                        <td style={{padding: '10px'}}>{index + 1}</td>
                                        <td style={{padding: '10px'}}>{player.userWallet.slice(0, 6)}...{player.userWallet.slice(-4)}</td>
                                        <td style={{padding: '10px', textAlign: 'right'}}>{Math.round(player.totalTokensProduced).toLocaleString()}</td>
                                        <td style={{padding: '10px', textAlign: 'right'}}>{player.maxLevelReached}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </main>
            </div>
        </div>
    );
}