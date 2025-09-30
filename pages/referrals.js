// pages/referrals.js
import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function ReferralsPage() {
    const [referralData, setReferralData] = useState({ count: 0, rewardsToClaim: 0 });
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

    const fetchReferralData = async () => {
        if (!userWallet) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/referrals/data?wallet=${userWallet}`);
            if (!res.ok) throw new Error("Falha ao buscar dados.");
            const data = await res.json();
            setReferralData(data);
        } catch (error) {
            console.error("Falha ao buscar dados de referência", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralData();
    }, [userWallet]);

    const handleClaim = async () => {
        if (!userWallet || isClaiming) return;
        setIsClaiming(true);
        try {
            const res = await fetch('/api/referrals/claim', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wallet: userWallet }) 
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showNotification(data.message, "success");
            fetchReferralData(); // Atualiza os dados na tela
        } catch (error) {
            showNotification(error.message, "error");
        } finally {
            setIsClaiming(false);
        }
    };
    
    const referralLink = userWallet ? `${window.location.origin}/?ref=${userWallet}` : 'Conecte sua carteira para ver seu link';

    return (
        <div className={styles.canvas}>
            {notification.message && (<div className={`${styles.notification} ${styles[notification.type]}`}>{notification.message}</div>)}
            <div style={{color: 'black', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '2rem', margin: 'auto', maxWidth: '800px', borderRadius: '8px', fontFamily: "'Poppins', sans-serif" }}>
                <a href="/" style={{ textDecoration: 'none', color: '#0070f3' }}>&larr; Voltar ao Jogo</a>
                <h1 style={{ textAlign: 'center', marginTop: '1rem' }}>Sistema de Referências</h1>
                <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>Convide seus amigos e ganhe 1 hora de aceleração de tempo para cada indicado que começar a jogar!</p>
                
                <h3 style={{ marginTop: '2rem' }}>Seu Link de Convite Único</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" value={referralLink} readOnly style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#eee' }}/>
                    <button onClick={() => navigator.clipboard.writeText(referralLink)} style={{padding: '10px 20px', cursor: 'pointer'}}>Copiar</button>
                </div>

                <hr style={{margin: '2rem 0'}}/>

                <h2 style={{ textAlign: 'center' }}>Suas Recompensas</h2>
                {isLoading ? <p style={{textAlign: 'center'}}>Carregando seus dados...</p> : (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1.2rem' }}><strong>Amigos Indicados:</strong> {referralData.count}</p>
                        <p style={{ fontSize: '1.2rem' }}><strong>Acelerações para Coletar:</strong> {referralData.rewardsToClaim} hora(s)</p>
                        <button onClick={handleClaim} disabled={referralData.rewardsToClaim === 0 || isClaiming} style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', marginTop: '1rem' }}>
                            {isClaiming ? "Coletando..." : `Coletar ${referralData.rewardsToClaim} Recompensa(s)`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}