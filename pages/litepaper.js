import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

const LitepaperPage = () => {
    // Usando o estado do React para controlar a interatividade. É mais robusto.
    const [activeDiagramStep, setActiveDiagramStep] = useState('deploy');
    const [activeTab, setActiveTab] = useState('nfts');

    useEffect(() => {
        // --- Lógica do Gráfico de Tokens ---
        let chartInstance = null;
        function renderTokenChart() {
            if (typeof Chart === 'undefined') return;
            if (chartInstance) chartInstance.destroy();
            
            const ctx = document.getElementById('tokenChart')?.getContext('2d');
            if (!ctx) return;

            chartInstance = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['INSU', 'ZOLG', 'LUXU', 'ZYNT', 'VIDA'],
                    datasets: [{
                        label: 'Max Supply',
                        data: [1000000000, 100000000, 10000000, 1500000, 500000],
                        backgroundColor: ['#6b7280', '#22c55e', '#3b82f6', '#a855f7', '#14b8a6'],
                        borderColor: '#111827',
                        borderWidth: 3,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#d1d5db', font: { family: "'Poppins', sans-serif" }}},
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return ` ${context.label}: ${context.raw.toLocaleString('en-US')} (Max Supply)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        if (activeTab === 'tokens') {
            renderTokenChart();
        }

        // --- Animações e Navegação ---
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    animationObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('[data-animate]').forEach(el => animationObserver.observe(el));

        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.querySelectorAll('nav a').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href').substring(1) === entry.target.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.4 });
        document.querySelectorAll('main section').forEach(section => navObserver.observe(section));

        return () => {
            document.querySelectorAll('[data-animate]').forEach(el => animationObserver.unobserve(el));
            document.querySelectorAll('main section').forEach(section => navObserver.unobserve(section));
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, [activeTab]);

    return (
        <>
            <Head>
                <title>Litepaper V1.0: Fumegator Hospital</title>
                <meta name="description" content="A Guide to the Future of Healthcare Management in Web3. Build, Produce, Dominate your medical empire on the Ronin blockchain." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
            </Head>

            <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="lazyOnload" />

            <div className="font-poppins bg-slate-900 text-gray-300">
                <div className="flex flex-col md:flex-row">
                    
                    <nav className="w-full md:w-64 bg-slate-900/70 backdrop-blur-md border-r border-slate-700/50 md:h-screen md:fixed p-4 md:p-6 top-0 z-50">
                        <div className="flex items-center space-x-3 mb-10">
                            <div className="w-10 h-10 bg-cyan-500 flex items-center justify-center rounded-full text-white font-bold text-xl shadow-lg shadow-cyan-500/30">FH</div>
                            <h1 className="text-xl font-bold text-white">Fumegator Hospital</h1>
                        </div>
                        <ul className="space-y-4">
                            <li><a href="#introduction" className="nav-link">Introduction</a></li>
                            <li><a href="#gameplay" className="nav-link">Gameplay</a></li>
                            <li><a href="#economy" className="nav-link">Web3 Economy</a></li>
                            <li><a href="#ecosystem" className="nav-link">Ecosystem</a></li>
                            <li><a href="#strategies" className="nav-link">Player Strategies</a></li>
                            <li><a href="#roadmap" className="nav-link">Roadmap</a></li>
                            <li><a href="#community" className="nav-link">Community</a></li>
                        </ul>
                    </nav>

                    <main className="md:ml-64 flex-1 p-6 sm:p-8 md:p-12 space-y-24 text-center">
                        
                        <section id="introduction" className="min-h-screen flex flex-col justify-center items-center -mt-16">
                            <div className="max-w-4xl mx-auto">
                                <h1 data-animate="fade-in-up" className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">Litepaper V1.0: <span className="animated-gradient-text">Fumegator Hospital</span></h1>
                                <p data-animate="fade-in-up" data-animate-delay="100" className="text-xl text-gray-400 mb-8">A Guide to the Future of Healthcare Management in Web3</p>
                                <p data-animate="fade-in-up" data-animate-delay="200" className="text-3xl font-semibold text-gray-200 mb-12">Build. Produce. Dominate.</p>
                                <div data-animate="fade-in-up" data-animate-delay="300" className="dark-glass-card rounded-xl p-8 shadow-xl">
                                    <h2 className="text-2xl font-semibold mb-4 text-white">The Vision</h2>
                                    <p className="text-gray-400">The Web3 gaming landscape is constantly evolving. Players seek ownership, strategy, and an economy that rewards their dedication. Fumegator Hospital delivers this by merging engaging tycoon gameplay with true asset ownership on the Ronin blockchain. This isn't just a game; it's your business, your strategy, your empire.</p>
                                </div>
                            </div>
                        </section>

                        <section id="gameplay" className="py-20">
                            <div className="max-w-5xl mx-auto">
                                <h2 data-animate="fade-in-up" className="section-header">Build Your Medical Empire</h2>
                                <p data-animate="fade-in-up" className="section-subheader">The core of Fumegator Hospital is an addictive and rewarding gameplay loop focused on production, optimization, and growth.</p>
                                <div data-animate="fade-in-up" className="dark-glass-card animated-gradient-border rounded-xl shadow-lg p-8">
                                    <h3 className="text-2xl font-bold mb-8 text-cyan-400">The Production Cycle</h3>
                                    <div id="gameplay-diagram" className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
                                        <div className={`game-step ${activeDiagramStep === 'deploy' ? 'active-step' : ''}`} onClick={() => setActiveDiagramStep('deploy')}><span className="text-4xl">👨‍⚕️</span><p className="font-bold mt-2">1. Deploy</p></div>
                                        <div className="text-2xl text-slate-600 hidden md:block">→</div>
                                        <div className={`game-step ${activeDiagramStep === 'produce' ? 'active-step' : ''}`} onClick={() => setActiveDiagramStep('produce')}><span className="text-4xl">⚙️</span><p className="font-bold mt-2">2. Produce</p></div>
                                        <div className="text-2xl text-slate-600 hidden md:block">→</div>
                                        <div className={`game-step ${activeDiagramStep === 'collect' ? 'active-step' : ''}`} onClick={() => setActiveDiagramStep('collect')}><span className="text-4xl">💰</span><p className="font-bold mt-2">3. Collect</p></div>
                                        <div className="text-2xl text-slate-600 hidden md:block">→</div>
                                        <div className={`game-step ${activeDiagramStep === 'evolve' ? 'active-step' : ''}`} onClick={() => setActiveDiagramStep('evolve')}><span className="text-4xl">📈</span><p className="font-bold mt-2">4. Evolve</p></div>
                                    </div>
                                    <div id="gameplay-details" className="mt-4 p-6 bg-slate-800/50 rounded-lg min-h-[120px] flex items-center justify-center transition-all duration-300">
                                        {activeDiagramStep === 'deploy' && <div className="game-info"><h4 className="font-bold text-lg text-cyan-300">Deploy Specialist</h4><p className="text-gray-400 mt-2">Assign an NFT Specialist to a compatible Room to activate production.</p></div>}
                                        {activeDiagramStep === 'produce' && <div className="game-info"><h4 className="font-bold text-lg text-cyan-300">Start Production</h4><p className="text-gray-400 mt-2">Initiate a timed production cycle to generate valuable in-game tokens.</p></div>}
                                        {activeDiagramStep === 'collect' && <div className="game-info"><h4 className="font-bold text-lg text-cyan-300">Collect Tokens</h4><p className="text-gray-400 mt-2">Claim your produced tokens, the essential resources for growth.</p></div>}
                                        {activeDiagramStep === 'evolve' && <div className="game-info"><h4 className="font-bold text-lg text-cyan-300">Evolve & Prestige</h4><p className="text-gray-400 mt-2">Use tokens to upgrade Rooms for higher yields. Max-level Rooms can Prestige for permanent bonuses.</p></div>}
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <section id="economy" className="py-20">
                            <div className="max-w-5xl mx-auto">
                                <h2 data-animate="fade-in-up" className="section-header">The Web3 Economy</h2>
                                <p data-animate="fade-in-up" className="section-subheader">Our economy is designed to be circular and sustainable, where every asset has a clear purpose on the Ronin blockchain.</p>
                                <div data-animate="fade-in-up" className="w-full">
                                    <div className="mb-8 flex justify-center border-b border-slate-700">
                                        <button className={`tab-btn ${activeTab === 'nfts' ? 'active' : ''}`} onClick={() => setActiveTab('nfts')}>Specialists (NFTs)</button>
                                        <button className={`tab-btn ${activeTab === 'tokens' ? 'active' : ''}`} onClick={() => setActiveTab('tokens')}>Tokens</button>
                                    </div>
                                    <div className={`${activeTab === 'nfts' ? '' : 'hidden'}`} id="nfts">
                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            <div className="dark-glass-card p-6 rounded-lg animated-gradient-border"><h4 className="font-bold text-xl text-gray-300 mb-2">Common</h4><p className="text-gray-400">The backbone of your workforce, essential for producing basic resources.</p></div>
                                            <div className="dark-glass-card p-6 rounded-lg animated-gradient-border"><h4 className="font-bold text-xl text-green-400 mb-2">Uncommon</h4><p className="text-gray-400">Unlocks access to more valuable resources and better opportunities.</p></div>
                                            <div className="dark-glass-card p-6 rounded-lg animated-gradient-border"><h4 className="font-bold text-xl text-blue-400 mb-2">Rare</h4><p className="text-gray-400">Highly capable specialists, often with passive bonuses that boost efficiency.</p></div>
                                            <div className="dark-glass-card p-6 rounded-lg animated-gradient-border"><h4 className="font-bold text-xl text-purple-400 mb-2">Epic</h4><p className="text-gray-400">An elite force in your hospital, capable of generating the most advanced resources.</p></div>
                                            <div className="dark-glass-card p-6 rounded-lg animated-gradient-border lg:col-start-2"><h4 className="font-bold text-xl text-yellow-400 mb-2">Legendary</h4><p className="text-gray-400">The tycoons of the medical industry. Extremely rare and powerful.</p></div>
                                        </div>
                                    </div>
                                    <div className={`${activeTab === 'tokens' ? '' : 'hidden'}`} id="tokens">
                                        <div className="flex flex-col md:flex-row items-center gap-8">
                                            <div className="w-full md:w-1/2"><div className="chart-container"><canvas id="tokenChart"></canvas></div></div>
                                            <div className="w-full md:w-1/2 space-y-6">
                                                <div><h4 className="font-bold text-xl text-teal-400">VIDA</h4><p className="text-gray-400">The premium utility token, used for unlocking Rooms, crafting, and other critical functions. <br/><span className="font-bold text-gray-300">Max Supply: 500,000</span></p></div>
                                                <div className="border-t border-slate-700 pt-6"><h4 className="font-bold text-xl text-gray-300">Production Tokens</h4><p className="text-gray-400">The backbone of progression:</p>
                                                    <div className="text-gray-400 mt-2 space-y-1">
                                                        <p><span className="font-semibold text-gray-300">INSULINE:</span> 1,000,000,000</p>
                                                        <p><span className="font-semibold text-green-400">ZOLGENSMA:</span> 100,000,000</p>
                                                        <p><span className="font-semibold text-blue-400">LUXUTURNA:</span> 10,000,000</p>
                                                        <p><span className="font-semibold text-purple-400">ZYNTEGLO:</span> 1,500,000</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <section id="ecosystem" className="py-20">
                            <div className="max-w-5xl mx-auto">
                                <h2 data-animate="fade-in-up" className="section-header">Expanding the Ecosystem</h2>
                                <p data-animate="fade-in-up" className="section-subheader">Beyond the core loop, a rich ecosystem deepens strategy and rewards.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div data-animate="fade-in-up" className="dark-glass-card p-6 rounded-lg"><h3 className="card-title">Medical Expeditions</h3><p className="text-gray-400">Send idle Specialists on missions to find rare rewards.</p></div>
                                    <div data-animate="fade-in-up" data-animate-delay="100" className="dark-glass-card p-6 rounded-lg"><h3 className="card-title">Crafting Lab</h3><p className="text-gray-400">Combine resources to create powerful consumable items and buffs.</p></div>
                                    <div data-animate="fade-in-up" className="dark-glass-card p-6 rounded-lg"><h3 className="card-title">Fumegator Asylum</h3><p className="text-gray-400">A deflationary burn-and-reroll system to upgrade your Specialists.</p></div>
                                    <div data-animate="fade-in-up" data-animate-delay="100" className="dark-glass-card p-6 rounded-lg"><h3 className="card-title">Dynamic Events</h3><p className="text-gray-400">Participate in community events for exclusive rewards.</p></div>
                                </div>
                            </div>
                        </section>

                        <section id="strategies" className="py-20">
                             <div className="max-w-5xl mx-auto">
                                <h2 data-animate="fade-in-up" className="section-header">Pathways to Success</h2>
                                <p data-animate="fade-in-up" className="section-subheader">While many strategies are viable, here are three proven pathways for new administrators.</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div data-animate="fade-in-up" className="dark-glass-card p-6 rounded-lg animated-gradient-border"><h3 className="card-title">1. The Specialist</h3><p className="text-gray-400">Focus on maxing out a single Room to use the Prestige system early, gaining compounding permanent bonuses.</p></div>
                                    <div data-animate="fade-in-up" data-animate-delay="100" className="dark-glass-card p-6 rounded-lg animated-gradient-border"><h3 className="card-title">2. The Industrialist</h3><p className="text-gray-400">Upgrade all Rooms in parallel for a diversified income, making you adaptable to market shifts and crafting needs.</p></div>
                                    <div data-animate="fade-in-up" data-animate-delay="200" className="dark-glass-card p-6 rounded-lg animated-gradient-border"><h3 className="card-title">3. The Market Trader</h3><p className="text-gray-400">Produce and sell high-demand resources on the Marketplace to acquire top-tier Specialists faster than you can produce.</p></div>
                                </div>
                            </div>
                        </section>

                        <section id="roadmap" className="py-20">
                            <div className="max-w-5xl mx-auto">
                                <h2 data-animate="fade-in-up" className="section-header">Development Roadmap</h2>
                                <p data-animate="fade-in-up" className="section-subheader">We are committed to the continued growth of Fumegator Hospital.</p>
                                <div data-animate="fade-in-up" className="relative mt-12">
                                    <div className="timeline-item completed"><div className="timeline-dot"></div><h3 className="text-xl font-bold text-green-400">PHASE 1 & 2: Foundation (Completed)</h3><div className="mt-2 text-gray-400">Core Game, NFT Collection, Token Economy, Expeditions & Crafting</div></div>
                                    <div className="timeline-item in-progress"><div className="timeline-dot"></div><h3 className="text-xl font-bold text-cyan-400">PHASE 3: Community Engagement (In Focus)</h3><div className="mt-2 text-gray-400">Leaderboards & Seasonal Rewards, Player Achievement System, and the first Global Community Event are all confirmed for development.</div></div>
                                    <div className="timeline-item"><div className="timeline-dot"></div><h3 className="text-xl font-bold text-gray-500">PHASE 4: Governance (Future)</h3><div className="mt-2 text-gray-400">Introduction of token staking for governance rights & creation of a DAO.</div></div>
                                </div>
                            </div>
                        </section>
                        
                        <section id="community" className="py-20">
                            <div className="max-w-3xl mx-auto">
                                <h2 data-animate="fade-in-up" className="section-header">Join the Community</h2>
                                <p data-animate="fade-in-up" className="text-gray-400 mb-8 text-lg">The future of healthcare management is in your hands. Join us on this journey and start building your empire today.</p>
                                <a href="https://www.fumegator.xyz/" target="_blank" rel="noopener noreferrer" className="btn-primary">
                                    Enter the Hospital
                                </a>
                            </div>
                        </section>
                    </main>
                </div>
            </div>

            <style jsx global>{`
                /* --- Base & Animations --- */
                @keyframes gradient-animation { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse-glow { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); } 50% { transform: scale(1.05); box-shadow: 0 0 25px 10px rgba(56, 189, 248, 0); } }
                
                body { font-family: 'Poppins', sans-serif; background-color: #0f172a; }
                .font-poppins { font-family: 'Poppins', sans-serif; }
                .animated-gradient-text { background-image: linear-gradient(to right, #22d3ee, #a855f7, #22d3ee); background-size: 200% auto; color: #fff; background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradient-animation 5s linear infinite; }
                
                /* --- Animation Trigger --- */
                [data-animate] { opacity: 0; transition: opacity 0.6s ease-out, transform 0.6s ease-out; transform: translateY(20px); }
                [data-animate].visible { opacity: 1; transform: translateY(0); }
                [data-animate-delay="100"] { transition-delay: 100ms; }
                [data-animate-delay="200"] { transition-delay: 200ms; }
                [data-animate-delay="300"] { transition-delay: 300ms; }

                /* --- Navigation --- */
                .nav-link { font-weight: 600; color: #9ca3af; transition: all 0.3s ease; position: relative; padding: 8px; border-radius: 6px; }
                .nav-link:hover { color: #e5e7eb; background-color: rgba(255, 255, 255, 0.05); }
                .nav-link.active { color: #22d3ee; background-color: rgba(34, 211, 238, 0.1); }

                /* --- Cards & General Layout --- */
                .dark-glass-card { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid #334155; transition: all 0.3s ease; }
                .animated-gradient-border { position: relative; background: #1e293b; background-clip: padding-box; border: solid 2px transparent; }
                .animated-gradient-border::before { content: ''; position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: -1; margin: -2px; border-radius: inherit; background: linear-gradient(to right, #3b82f6, #a855f7, #22d3ee); transition: all 0.3s ease; opacity: 0; }
                .animated-gradient-border:hover::before { opacity: 1; }
                .section-header { font-size: 2.5rem; line-height: 2.5rem; font-weight: 700; margin-bottom: 1.5rem; color: #f9fafb; }
                .section-subheader { color: #9ca3af; max-width: 42rem; margin-left: auto; margin-right: auto; margin-bottom: 3rem; }
                .card-title { font-weight: 700; font-size: 1.25rem; line-height: 1.75rem; margin-bottom: 0.75rem; color: #bae6fd; }

                /* --- Interactive Elements --- */
                .btn-primary { background-image: linear-gradient(to right, #22d3ee, #0ea5e9); color: white; font-weight: 600; padding: 0.75rem 2rem; border-radius: 9999px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(22, 163, 224, 0.1); }
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(22, 163, 224, 0.3); }
                .game-step { cursor: pointer; padding: 1rem; text-align: center; border-radius: 0.75rem; border: 2px solid transparent; transition: all 0.3s ease; flex: 1; }
                .game-step.active-step, .game-step:hover { border-color: #22d3ee; background: rgba(34, 211, 238, 0.05); transform: scale(1.05); box-shadow: 0 0 15px rgba(34, 211, 238, 0.2); }
                .tab-btn { padding: 0.75rem 1.5rem; font-weight: 600; color: #9ca3af; border-bottom: 2px solid transparent; transition: all 0.3s ease; }
                .tab-btn.active, .tab-btn:hover { color: #22d3ee; border-bottom-color: #22d3ee; }

                /* --- Timeline/Roadmap --- */
                .timeline-item { position: relative; padding-bottom: 2.5rem; padding-left: 2.5rem; border-left: 2px solid #374151; }
                .timeline-item:last-child { border-left-color: transparent; }
                .timeline-dot { position: absolute; left: -0.7rem; top: 0.25rem; height: 1.25rem; width: 1.25rem; border-radius: 9999px; background-color: #1e293b; border: 2px solid #475569; transition: all 0.3s ease; }
                .timeline-item.completed .timeline-dot { background-color: #10b981; border-color: #10b981; }
                .timeline-item.in-progress .timeline-dot { background-color: #22d3ee; border-color: #22d3ee; animation: pulse-glow 2s infinite; }

                /* --- Chart --- */
                .chart-container { position: relative; width: 100%; max-width: 400px; margin: auto; height: 350px; }
            `}</style>
        </>
    );
};

export default LitepaperPage;