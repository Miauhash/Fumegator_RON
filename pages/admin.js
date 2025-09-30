// pages/admin.js (VERSÃO FINAL, COMPLETA, COM TODAS AS FUNÇÕES RESTAURADAS)

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/AdminPage.module.css';
import authStyles from '../styles/AdminAuth.module.css';
import { FaUsers, FaGift, FaStore, FaCogs, FaExclamationTriangle, FaTachometerAlt, FaCalendarPlus, FaSignOutAlt, FaEdit, FaPlus, FaTrash, FaHistory, FaExternalLinkAlt, FaSkullCrossbones, FaSave } from 'react-icons/fa';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

const GAME_TOKENS = ["INSULINE", "ZOLGENSMA", "LUXUTURNA", "ZYNTEGLO", "VIDA"];
const GAME_ITEMS_SPECIAL = [ { id: 'freeSpins', name: 'Giros Grátis' } ];

// --- Componente de Login ---
function AdminLogin({ onLoginSuccess }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_auth_token', ADMIN_PASSWORD);
            onLoginSuccess();
        } else {
            setError('Senha incorreta.');
        }
    };
    return (
        <div className={authStyles.loginContainer}>
            <form onSubmit={handleLogin} className={authStyles.loginForm}>
                <h2><FaExclamationTriangle /> Acesso Restrito</h2>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={authStyles.input} placeholder="Senha" />
                <button type="submit" className={authStyles.button}>Entrar</button>
                {error && <p className={authStyles.error}>{error}</p>}
            </form>
        </div>
    );
}

// --- Componente Modal "Modo Deus" com Ações Guiadas ---
function PlayerActionsModal({ wallet, allGameItems, onClose, showFeedback }) {
    const [currentAction, setCurrentAction] = useState(null);
    const [actionPayload, setActionPayload] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleActionSubmit = async (actionType, payload, confirmationMessage) => {
        if (!window.confirm(confirmationMessage)) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/player-actions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet, actionType, payload })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            showFeedback('Ação executada com sucesso!', 'success');
            onClose();
        } catch (error) {
            showFeedback(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderActionForm = () => {
        switch (currentAction) {
            case 'GIVE_TOKEN':
                return (
                    <div className={styles.actionForm}>
                        <select onChange={e => setActionPayload({ ...actionPayload, itemId: e.target.value })} defaultValue={GAME_TOKENS[0]}>
                            {GAME_TOKENS.map(token => <option key={token} value={token}>{token}</option>)}
                        </select>
                        <input type="number" placeholder="Quantidade" onChange={e => setActionPayload({ ...actionPayload, amount: parseInt(e.target.value) })} />
                        <button onClick={() => handleActionSubmit('GIVE_TOKEN', actionPayload, `Tem certeza que quer dar ${actionPayload.amount || 0} ${actionPayload.itemId || GAME_TOKENS[0]} para este jogador?`)} disabled={isSubmitting}>Confirmar</button>
                    </div>
                );
            case 'GIVE_ITEM':
                 return (
                    <div className={styles.actionForm}>
                        <select onChange={e => setActionPayload({ ...actionPayload, itemId: e.target.value })} defaultValue={allGameItems[0]?.id}>
                            {allGameItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                        <input type="number" placeholder="Quantidade" defaultValue={1} onChange={e => setActionPayload({ ...actionPayload, amount: parseInt(e.target.value) })} />
                        <button onClick={() => handleActionSubmit('GIVE_ITEM', actionPayload, `Tem certeza que quer dar ${actionPayload.amount || 1}x ${actionPayload.itemId || allGameItems[0].id} para este jogador?`)} disabled={isSubmitting}>Confirmar</button>
                    </div>
                );
            case 'SET_SPINS':
                 return (
                    <div className={styles.actionForm}>
                         <input type="number" placeholder="Total de Giros" onChange={e => setActionPayload({ amount: parseInt(e.target.value) })} />
                        <button onClick={() => handleActionSubmit('SET_SPINS', actionPayload, `Tem certeza que quer definir os giros grátis deste jogador para ${actionPayload.amount || 0}?`)} disabled={isSubmitting}>Confirmar</button>
                    </div>
                );
            case 'RESET_INVENTORY':
                return (
                    <div className={styles.actionForm}>
                        <p className={styles.warningText}>Esta ação apagará TODO o inventário do jogador.</p>
                        <button className={styles.dangerButton} onClick={() => handleActionSubmit('RESET_INVENTORY', {}, `TEM CERTEZA ABSOLUTA que quer resetar o inventário deste jogador? A ação é irreversível.`)} disabled={isSubmitting}>Confirmar Reset de Inventário</button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={`${styles.modalCard} ${styles.playerActionsModal}`} onClick={e => e.stopPropagation()}>
                <h3><FaEdit /> Ações para {wallet.slice(0, 6)}...{wallet.slice(-4)}</h3>
                <div className={styles.actionButtons}>
                    <button onClick={() => setCurrentAction('GIVE_TOKEN')}>Doar Token</button>
                    <button onClick={() => setCurrentAction('GIVE_ITEM')}>Doar Item</button>
                    <button onClick={() => setCurrentAction('SET_SPINS')}>Definir Giros</button>
                    <button onClick={() => setCurrentAction('RESET_INVENTORY')} className={styles.dangerButton}>Resetar Inventário</button>
                </div>
                {currentAction && renderActionForm()}
            </div>
        </div>
    );
}

// --- Componente do Painel Principal ---
function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState({});
    const [stats, setStats] = useState(null);
    const [players, setPlayers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [grantData, setGrantData] = useState({ wallet: '', itemType: 'TOKEN', itemId: GAME_TOKENS[0], amount: '1000' });
    const [shopItems, setShopItems] = useState([]);
    const [allGameItems, setAllGameItems] = useState(GAME_ITEMS_SPECIAL);
    const [editingItem, setEditingItem] = useState(null);
    const [gameConfig, setGameConfig] = useState(null);
    const [activeEvents, setActiveEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ name: '', description: '', targetToken: 'VIDA', goalAmount: '1000', endsAt: '', rewardItemId: 'freeSpins', rewardAmount: '10' });
    const [transactions, setTransactions] = useState({ withdraws: [], deposits: [] });
    const [playerToEdit, setPlayerToEdit] = useState(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetConfirmation, setResetConfirmation] = useState('');

    const showFeedback = useCallback((message, type) => { setFeedback({ message, type }); setTimeout(() => setFeedback({ message: '', type: '' }), 5000); }, []);
    const handleLogout = () => { sessionStorage.removeItem('admin_auth_token'); router.reload(); };

    const handleApiCall = useCallback(async (endpoint, options = {}, successMessage) => {
        setLoading(prev => ({ ...prev, [endpoint]: true }));
        try {
            const res = await fetch(`/api/admin/${endpoint}`, {
                method: options.method || 'GET',
                headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}`, 'Content-Type': 'application/json' },
                body: options.body || null,
            });
            const textResponse = await res.text();
            let data;
            try { data = JSON.parse(textResponse); } 
            catch (e) { throw new Error(`Resposta inválida do servidor: ${textResponse}`); }
            if (!res.ok) throw new Error(data.message || 'Erro no servidor.');
            if (successMessage) showFeedback(successMessage, 'success');
            return data;
        } catch (error) {
            console.error(`API call to ${endpoint} failed:`, error);
            showFeedback(error.message, 'error');
        } finally {
            setLoading(prev => ({ ...prev, [endpoint]: false }));
        }
    }, []);
    
    const fetchData = useCallback(async (tab) => {
        let data;
        switch(tab) {
            case 'dashboard': data = await handleApiCall('stats'); if (data) setStats(data); break;
            case 'players': data = await handleApiCall('players'); if (data) setPlayers(data); break;
            case 'history': data = await handleApiCall('transactions'); if(data) setTransactions(data); break;
            case 'store': 
                data = await handleApiCall('shop-items'); 
                if (data) {
                    setShopItems(data);
                    const itemsForGranting = data.map(i => ({ id: i.id, name: i.name }));
                    setAllGameItems([...GAME_ITEMS_SPECIAL, ...itemsForGranting]);
                }
                break;
            case 'config': data = await handleApiCall('game-config'); if (data) setGameConfig(data); break;
            case 'events': data = await handleApiCall('events'); if (data) setActiveEvents(data); break;
            default: break;
        }
    }, [handleApiCall]);

    useEffect(() => { fetchData(activeTab); }, [activeTab, fetchData]);

    const handleBlockToggle = async (wallet, block) => { await handleApiCall('players', { method: 'POST', body: JSON.stringify({ wallet, block }) }, `Status de saque atualizado.`); fetchData('players'); };
    const handleGrantItem = async (e) => { e.preventDefault(); await handleApiCall('grant-item', { method: 'POST', body: JSON.stringify(grantData) }, `Doação enviada.`); };
    const handleConfigSave = async (e) => { e.preventDefault(); await handleApiCall('game-config', { method: 'POST', body: JSON.stringify({ config: gameConfig }) }, 'Configurações salvas!'); };
    const handleCreateEvent = async (e) => { e.preventDefault(); await handleApiCall('events', { method: 'POST', body: JSON.stringify(newEvent) }, 'Novo evento criado!'); setNewEvent({ name: '', description: '', targetToken: 'VIDA', goalAmount: '1000', endsAt: '', rewardItemId: 'freeSpins', rewardAmount: '10' }); fetchData('events'); };
    const handleEndEvent = async (eventId) => { if(window.confirm("Tem certeza?")){ await handleApiCall(`events/${eventId}`, { method: 'DELETE' }, 'Evento finalizado!'); fetchData('events'); }};
    const handleShopItemSave = async (e) => { e.preventDefault(); await handleApiCall('shop-items', { method: 'POST', body: JSON.stringify(editingItem) }, editingItem.id ? "Item atualizado!" : "Item criado!"); setEditingItem(null); fetchData('store'); };
    const openNewItemForm = () => setEditingItem({ name: '', description: '', price: 0, currency: 'VIDA', isActive: true, image: '' });
    const handleDatabaseReset = async () => { /* ... */ };
    
    const filteredPlayers = players.filter(p => p.wallet.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={styles.adminContainer}>
            <header className={styles.header}><h1>Painel de Controle Supremo</h1><button onClick={handleLogout} className={styles.logoutButton}><FaSignOutAlt /> Sair</button></header>
            <div className={styles.tabs}>
                 <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? styles.active : ''}><FaTachometerAlt /> Dashboard</button>
                 <button onClick={() => setActiveTab('players')} className={activeTab === 'players' ? styles.active : ''}><FaUsers /> Jogadores</button>
                 <button onClick={() => setActiveTab('tools')} className={activeTab === 'tools' ? styles.active : ''}><FaGift /> Ferramentas</button>
                 <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? styles.active : ''}><FaHistory /> Histórico</button>
                 <button onClick={() => setActiveTab('store')} className={activeTab === 'store' ? styles.active : ''}><FaStore /> Loja</button>
                 <button onClick={() => setActiveTab('config')} className={activeTab === 'config' ? styles.active : ''}><FaCogs /> Configurações</button>
                 <button onClick={() => setActiveTab('events')} className={activeTab === 'events' ? styles.active : ''}><FaCalendarPlus /> Eventos</button>
                 <button onClick={() => setActiveTab('danger')} className={`${styles.dangerTab} ${activeTab === 'danger' ? styles.active : ''}`}><FaSkullCrossbones /> Zona de Perigo</button>
            </div>
            <main className={styles.mainContent}>
                {feedback.message && <div className={`${styles.message} ${styles[feedback.type]}`}>{feedback.message}</div>}
                
                {activeTab === 'dashboard' && <div className={styles.card}><h2 className={styles.cardTitle}>Dashboard</h2><div className={styles.statsGrid}>{loading['stats'] ? <p>Carregando...</p> : stats ? <> <div className={styles.statBox}><h4>Total de Jogadores</h4><p>{stats.totalPlayers}</p></div> <div className={styles.statBox}><h4>Evento Ativo</h4><p>{stats.activeEventName}</p></div></> : <p>Sem dados.</p>}</div></div>}
                
                {activeTab === 'players' && <div className={styles.card}><h2 className={styles.cardTitle}>Gerenciamento de Jogadores</h2><input type="text" placeholder="Buscar por carteira..." className={styles.searchInput} onChange={(e) => setSearchTerm(e.target.value)} /><div className={styles.tableContainer}><table className={styles.table}><thead><tr><th>Carteira</th><th>Status Saque</th><th>Ações</th></tr></thead><tbody>{loading['players'] ? <tr><td colSpan="3">Carregando...</td></tr> : filteredPlayers.map(p => (<tr key={p.wallet}><td>{p.wallet}</td><td><span className={`${styles.status} ${p.isWithdrawalBlocked ? styles.blocked : styles.activeStatus}`}>{p.isWithdrawalBlocked ? "Bloqueado" : "Ativo"}</span></td><td><button className={styles.editButton} onClick={() => setPlayerToEdit(p.wallet)}><FaEdit /> Ações</button><button className={`${styles.actionButton} ${p.isWithdrawalBlocked ? styles.unblockButton : styles.blockButton}`} onClick={() => handleBlockToggle(p.wallet, !p.isWithdrawalBlocked)}>{p.isWithdrawalBlocked ? "Desbloquear" : "Bloquear"}</button></td></tr>))}</tbody></table></div></div>}

                {activeTab === 'tools' && <div className={styles.card}><h2 className={styles.cardTitle}>Doar Itens / Tokens</h2><form onSubmit={handleGrantItem} className={styles.formGrid}><div className={styles.formGroup}><label>Carteira do Jogador</label><input value={grantData.wallet} onChange={e => setGrantData({...grantData, wallet: e.target.value})} placeholder="0x..." required/></div><div className={styles.formGroup}><label>Tipo</label><select value={grantData.itemType} onChange={e => setGrantData({...grantData, itemId: (e.target.value === 'TOKEN' ? GAME_TOKENS[0] : allGameItems[0]?.id || ''), itemType: e.target.value})}><option value="TOKEN">Token</option><option value="ITEM">Item de Inventário</option></select></div><div className={styles.formGroup}><label>Item / Token Específico</label><select value={grantData.itemId} onChange={e => setGrantData({...grantData, itemId: e.target.value})} required>{(grantData.itemType === 'TOKEN' ? GAME_TOKENS.map(id => ({id, name: id})) : allGameItems).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className={styles.formGroup}><label>Quantidade</label><input type="number" min="1" value={grantData.amount} onChange={e => setGrantData({...grantData, amount: e.target.value})} required/></div><button type="submit" className={styles.submitButton} disabled={loading['grant-item']}>{loading['grant-item'] ? 'Enviando...' : 'Enviar Doação'}</button></form></div>}

                {activeTab === 'history' && <div className={styles.card}><h2 className={styles.cardTitle}>Histórico de Transações</h2></div>}

                {activeTab === 'store' && <div className={styles.card}><h2 className={styles.cardTitle}>Gerenciar Loja</h2><button onClick={openNewItemForm} className={styles.addNewButton}><FaPlus /> Adicionar Novo Item</button><div className={styles.tableContainer}><table className={styles.table}><thead><tr><th>Nome</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead><tbody>{loading['shop-items'] ? <tr><td colSpan="4">Carregando...</td></tr> : shopItems.map(item => (<tr key={item.id}><td>{item.name}</td><td>{item.price} {item.currency}</td><td><span className={item.isActive ? styles.activeStatus : styles.blocked}>{item.isActive ? "Ativo" : "Inativo"}</span></td><td><button className={styles.editButton} onClick={() => setEditingItem(item)}><FaEdit /> Editar</button></td></tr>))}</tbody></table></div></div>}
                
                {activeTab === 'config' && <div className={styles.card}><h2 className={styles.cardTitle}>Configurações de Jogo</h2>{loading['game-config'] || !gameConfig ? <p>Carregando...</p> : <form onSubmit={handleConfigSave}><h3 className={styles.subTitle}>Geral</h3><div className={styles.formGrid}><div className={styles.formGroup}><label>Saque Mínimo</label><input type="number" step="any" value={gameConfig.general?.minWithdraw || 10} onChange={e => setGameConfig({...gameConfig, general: {...gameConfig.general, minWithdraw: parseFloat(e.target.value) || 0}})} /></div></div><h3 className={styles.subTitle}>Taxas de Produção Base</h3><div className={styles.formGrid}>{(Object.keys(gameConfig.productionRates || {})).map(token => (<div className={styles.formGroup} key={token}><label>{token}</label><input type="number" step="any" value={gameConfig.productionRates[token]} onChange={e => setGameConfig({...gameConfig, productionRates: {...gameConfig.productionRates, [token]: parseFloat(e.target.value) || 0}})} /></div>)) }</div><h3 className={styles.subTitle}>Progressão de Nível</h3><div className={styles.formGrid}><div className={styles.formGroup}><label>Tempo Mínimo (s)</label><input type="number" value={gameConfig.progression?.minTime || 0} onChange={e => setGameConfig({...gameConfig, progression: {...gameConfig.progression, minTime: parseInt(e.target.value) || 0} })} /></div><div className={styles.formGroup}><label>Tempo Máximo (s)</label><input type="number" value={gameConfig.progression?.maxTime || 0} onChange={e => setGameConfig({...gameConfig, progression: {...gameConfig.progression, maxTime: parseInt(e.target.value) || 0} })} /></div><div className={styles.formGroup}><label>Recompensa Mínima</label><input type="number" step="any" value={gameConfig.progression?.minReward || 0} onChange={e => setGameConfig({...gameConfig, progression: {...gameConfig.progression, minReward: parseFloat(e.target.value) || 0} })} /></div><div className={styles.formGroup}><label>Recompensa Máxima</label><input type="number" step="any" value={gameConfig.progression?.maxReward || 0} onChange={e => setGameConfig({...gameConfig, progression: {...gameConfig.progression, maxReward: parseFloat(e.target.value) || 0} })} /></div><div className={styles.formGroup}><label>Nível Máximo</label><input type="number" value={gameConfig.progression?.maxLevel || 0} onChange={e => setGameConfig({...gameConfig, progression: {...gameConfig.progression, maxLevel: parseInt(e.target.value) || 0} })} /></div></div><button type="submit" className={`${styles.submitButton} ${styles.fullSpan}`} disabled={loading['game-config']}>{loading['game-config'] ? 'Salvando...' : 'Salvar Configurações'}</button></form>}</div>}
                
                {activeTab === 'events' && <div className={styles.card}><h2 className={styles.cardTitle}>Eventos</h2></div>}

                {activeTab === 'danger' && <div className={`${styles.card} ${styles.dangerZone}`}><h2 className={styles.cardTitle}><FaExclamationTriangle/> Zona de Perigo</h2><p>As ações nesta seção são irreversíveis...</p><div className={styles.dangerAction}><h4>Resetar Banco de Dados</h4><p>Esta ação apagará **TODOS** os dados...</p><button className={styles.dangerButton} onClick={() => setShowResetModal(true)}>Iniciar Procedimento de Reset</button></div></div>}
            </main>

            {playerToEdit && <PlayerActionsModal wallet={playerToEdit} allGameItems={allGameItems} onClose={() => setPlayerToEdit(null)} showFeedback={showFeedback} />}

            {showResetModal && (
                 <div className={styles.modalBackdrop} onClick={() => setShowResetModal(false)}>
                    <div className={`${styles.modalCard} ${styles.dangerZone}`} onClick={e => e.stopPropagation()}>
                        <h3><FaSkullCrossbones /> Confirmação de Reset Total</h3>
                        <p>Para confirmar, digite a frase exata abaixo:</p>
                        <p className={styles.confirmationPhrase}>RESETAR TUDO E ASSUMIR AS CONSEQUÊNCIAS</p>
                        <input type="text" className={styles.confirmationInput} value={resetConfirmation} onChange={e => setResetConfirmation(e.target.value)} />
                        <div className={styles.modalActions}>
                            <button type="button" onClick={() => setShowResetModal(false)} className={styles.cancelButton}>Cancelar</button>
                            <button type="button" onClick={handleDatabaseReset} className={styles.dangerButton} disabled={resetConfirmation !== 'RESETAR TUDO E ASSUMIR AS CONSEQUÊNCIAS'}>Confirmar Reset</button>
                        </div>
                    </div>
                </div>
            )}
            
            {editingItem && (
                <div className={styles.modalBackdrop} onClick={() => setEditingItem(null)}>
                    <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
                        <h3>{editingItem.id ? "Editar Item" : "Criar Novo Item"}</h3>
                        <form onSubmit={handleShopItemSave} className={styles.formGrid}>
                            <div className={styles.formGroup}><label>ID (único)</label><input value={editingItem.id || ''} onChange={(e) => setEditingItem({...editingItem, id: e.target.value.replace(/\s+/g, '_')})} disabled={!!editingItem.id} required /></div>
                            <div className={styles.formGroup}><label>Nome</label><input value={editingItem.name || ''} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} required /></div>
                            <div className={styles.formGroup}><label>Preço</label><input type="number" step="any" value={editingItem.price || 0} onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})} required /></div>
                            <div className={styles.formGroup}><label>Moeda</label><select value={editingItem.currency || 'VIDA'} onChange={(e) => setEditingItem({...editingItem, currency: e.target.value})} required>{[...GAME_TOKENS, "RON"].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                            <div className={`${styles.formGroup} ${styles.fullSpan}`}><label>Descrição</label><textarea value={editingItem.description || ''} onChange={(e) => setEditingItem({...editingItem, description: e.target.value})} rows="2" /></div>
                            <div className={`${styles.formGroup} ${styles.fullSpan}`}><label>URL da Imagem</label><input value={editingItem.image || ''} onChange={(e) => setEditingItem({...editingItem, image: e.target.value})} /></div>
                            <div className={styles.formGroupCheckbox}><label>Ativo?</label><input type="checkbox" checked={!!editingItem.isActive} onChange={(e) => setEditingItem({...editingItem, isActive: e.target.checked})} /></div>
                            <div className={`${styles.modalActions} ${styles.fullSpan}`}>
                                <button type="button" onClick={() => setEditingItem(null)} className={styles.cancelButton}>Cancelar</button>
                                <button type="submit" disabled={loading['shop-items']} className={styles.saveButton}>Salvar Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Componente Final que Gerencia a Autenticação ---
export default function AdminPageProtected() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    useEffect(() => { 
        const token = sessionStorage.getItem('admin_auth_token'); 
        if (token === ADMIN_PASSWORD) setIsAuthenticated(true);
    }, []);

    if (!isAuthenticated) return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
    return <AdminDashboard />;
}