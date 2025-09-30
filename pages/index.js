// pages/index.js (VERSÃO FINAL com links do rodapé funcionais)

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link'; // <<< IMPORTAÇÃO ESSENCIAL
import styles from '../styles/LandingPage.module.css';
import { FaTelegram, FaTwitter, FaReddit, FaDiscord, FaPlay, FaPause } from 'react-icons/fa';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

// --- DADOS PARA AS SEÇÕES ---
const teamMembers = [
  { name: 'Sulivan', role: 'Founder & Lead Developer', image: '/team/sulivan.jpg', twitter: 'https://x.com/HawkSulivan', reddit: '#', discord: '#' },
  { name: 'Willy Codoni', role: 'Blockchain Specialist', image: '/team/will.jpg', twitter: 'https://x.com/CodoWill', reddit: '#', discord: '#' },
  { name: 'Mick kwanchai', role: 'Lead Artist', image: '/team/mick.jpg', twitter: 'https://x.com/kwanchai', reddit: '#', discord: '#' },
  { name: 'Derick', role: 'Community Manager', image: '/team/derick.png', twitter: 'https://x.com/kwanchai', reddit: '#', discord: '#' },
];
const tokenomicsData = [
    { title: 'Play-to-Earn Rewards', value: '80%', description: 'The largest portion, dedicated to rewarding players for their in-game activities.' },
    { title: 'Ecosystem Fund', value: '10%', description: 'Funds for development, marketing, and community events to ensure project longevity.' },
    { title: 'Liquidity & Treasury', value: '5%', description: 'To ensure a healthy market and fund strategic opportunities.' },
    { title: 'Airdrop & Community', value: '2.5%', description: 'Initial distribution to reward early supporters and community members.' },
];
const gettingStartedSteps = [
    { number: '01', title: 'Get a Wallet', description: 'Download the Ronin Wallet browser extension. This is where your NFTs and rewards will be stored securely.' },
    { number: '02', title: 'Acquire an NFT', description: 'Purchase your first Fumegator Specialist NFT from the Mavis Market. This is your key to the game.' },
    { number: '03', title: 'Enter the Game', description: 'Connect your Ronin Wallet to the Hospital Fumegator game, assign your Specialist to a lab, and start producing valuable resources.' },
];
const roadmapItems = [
    { title: 'Launch', description: 'Game release and mint of the first generation of NFTs.' },
    { title: 'Marketplace', description: 'Implementation of the peer-to-peer token market.' },
    { title: 'Expeditions', description: 'Mission system to stake NFTs and collect rare resources.' },
    { title: 'Global Events', description: 'Pandemics and outbreaks with community goals and rewards.' },
    { title: 'Guild System', description: 'Creation of alliances, guild chat, and leaderboards.' },
    { title: 'Advanced Crafting', description: 'New recipes and powerful items to be created.' },
    { title: 'Lab Battles (PvP)', description: 'Players compete to see who has the most efficient hospital.' },
    { title: 'Territory Expansion', description: 'New cities and continents to expand your medical empire.' },
];
const nftImagesForCarousel = [
  "3886.webp", "3890.webp", "3907.webp", "3915.webp", "6156.webp", "6326.webp",
  "6345.webp", "6357.webp", "7836.webp", "7868.webp", "7900.webp", "8318.webp",
  "8381.webp", "8446.webp", "8738.webp", "8748.webp", "8959.webp", "8982.webp"
];

export default function LandingPage() {
  const [formData, setFormData] = useState({ name: '', email: '', roninAddress: '', twitter: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
  const [isShattering, setIsShattering] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleCarouselChange = (index) => {
    setIsShattering(true);
    setTimeout(() => {
        setCurrentSlide(index);
        setIsShattering(false);
    }, 500);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.isVisible);
        }
      });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll(`.${styles.section}`);
    sections.forEach(section => observer.observe(section));

    return () => sections.forEach(section => observer.unobserve(section));
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
  };

  const handleAirdropSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/airdrop/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'An error occurred.');
      showFeedback('Success! Your entry has been submitted.', 'success');
      setFormData({ name: '', email: '', roninAddress: '', twitter: '' });
    } catch (error) {
      showFeedback(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>Hospital Fumegator - Welcome to the Lab</title>
        <meta name="description" content="Enter a world of high-stakes biotech and dominate a living P2E economy." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <audio ref={audioRef} src="/music/background-music.mp3" loop />
      <button className={styles.musicToggle} onClick={toggleMusic} aria-label="Toggle Music">
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>

      <div className={styles.backgroundEffects}></div>

      <header className={styles.header}>
        <div className={styles.logo}>HOSPITAL <span>FUMEGATOR</span></div>
        <nav className={styles.nav}>
          <a href="#start">Get Started</a>
          <a href="#tokenomics">Tokenomics</a>
          <a href="#team">Team</a>
          <a href="#roadmap">Roadmap</a>
          <a href="https://www.fumegator.xyz/litepaper" target="_blank" rel="noopener noreferrer">Litepaper</a>
        </nav>
        <Link href="/game" className={styles.playButton}>Enter the Lab</Link>
      </header>

      <main>
        <section className={styles.hero}>
            <div className={`${styles.heroImageContainer} ${styles.heroImageBox}`}>
                <Image src="/img/mascot-hero.png" alt="Fumegator Mascot" width={500} height={500} priority className={styles.heroImageFit} />
            </div>
            <div className={styles.heroContent}>
                <div className={styles.heroTitleContainer}>
                    <h1>THE CURE IS IN <span>YOUR HANDS</span></h1>
                    <a href="https://faucet.roninchain.com/" target="_blank" rel="noopener noreferrer" className={`${styles.limitedBadge} ${styles.headerBadge}`}>
                        TESTNET
                    </a>
                </div>
                <p>Manage a state-of-the-art hospital, command NFT specialists, and dominate a living economic ecosystem on the Ronin blockchain.</p>
                <div className={styles.heroButtons}>
                    <Link href="/game" className={styles.ctaButton}>Play Now</Link>
                    <a href="https://discord.gg/9kfJTarXU8" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>Join the Community</a>
                </div>
            </div>
        </section>

        <section id="airdrop" className={styles.section}>
            <div className={styles.sectionContent}>
                <div className={styles.airdropTitleContainer}>
                    <h2>JOIN THE AIRDROP</h2>
                    <span className={styles.limitedBadge}>LIMITED</span>
                </div>
                <p className={styles.sectionSubtitle}>Register now to be eligible for future exclusive rewards and NFT drops.</p>
                <form className={styles.airdropForm} onSubmit={handleAirdropSubmit}>
                    <div className={styles.formGroup}>
                        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required className={styles.input} />
                        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required className={styles.input} />
                    </div>
                    <div className={styles.formGroup}>
                        <input type="text" name="roninAddress" placeholder="Ronin Wallet Address (ronin:...)" value={formData.roninAddress} onChange={handleInputChange} required className={styles.input} />
                        <input type="text" name="twitter" placeholder="Twitter Handle (@username)" value={formData.twitter} onChange={handleInputChange} className={styles.input} />
                    </div>
                    <button type="submit" className={`${styles.ctaButton} ${styles.airdropButton}`} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Register for Airdrop'}
                    </button>
                    {feedback.message && (
                      <p className={feedback.type === 'success' ? styles.successMessage : styles.errorMessage}>
                        {feedback.message}
                      </p>
                    )}
                </form>
            </div>
        </section>
		
        <section id="start" className={styles.section}>
            <div className={styles.sectionContent}>
                <h2>GET STARTED IN 3 STEPS</h2>
                <div className={styles.gettingStartedContainer}>
                    {gettingStartedSteps.map((step, index) => (
                        <div key={index} className={styles.stepItem}>
                            <div className={styles.stepNumber}>{step.number}</div>
                            <div className={styles.stepContent}>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="tokenomics" className={styles.section}>
            <div className={styles.sectionContent}>
                <h2>TOKENOMICS</h2>
                <p className={styles.sectionSubtitle}>A sustainable economy designed for longevity and player rewards.</p>
                <div className={styles.tokenomicsGrid}>
                    {tokenomicsData.map((item, index) => (
                        <div key={index} className={styles.tokenomicsCard}>
                            <h3>{item.title}</h3>
                            <div className={styles.tokenomicsValue}>{item.value}</div>
                            <p>{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="team" className={styles.section}>
            <div className={styles.sectionContent}>
                <h2>THE TEAM</h2>
                <p className={styles.sectionSubtitle}>The architects behind the Fumegator universe.</p>
                <p className={styles.teamTokenNote}>
                  To ensure full commitment to the project's long-term success, the team holds no allocated tokens directly. All team and advisory funds are part of the Ecosystem Fund, managed transparently for the growth of the game.
                </p>
                <div className={styles.teamGrid}>
                    {teamMembers.map((member, index) => (
                        <div key={index} className={styles.teamCard}>
                            <div className={styles.teamImageWrapper}>
                                <Image src={member.image} alt={member.name} width={200} height={200} />
                            </div>
                            <h3>{member.name}</h3>
                            <p>{member.role}</p>
                            <div className={styles.teamSocials}>
                                <a href={member.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
                                <a href={member.reddit} target="_blank" rel="noopener noreferrer" aria-label="Reddit"><FaReddit /></a>
                                <a href={member.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord"><FaDiscord /></a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="roadmap" className={styles.section}>
            <div className={styles.sectionContent}>
                <h2>OUR PATH FORWARD</h2>
                <p className={styles.sectionSubtitle}>We are building the future, one step at a time.</p>
                <div className={styles.roadmapContainer}>
                    <div className={styles.roadmapLine}></div>
                    {roadmapItems.map((item, index) => (
                        <div key={index} className={styles.roadmapItem}>
                            <div className={styles.roadmapMilestone}><span>{index + 1}</span></div>
                            <div className={styles.roadmapContent}>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="nft-gallery" className={styles.section}>
            <div className={styles.sectionContent}>
                <h2>MEET THE SPECIALISTS</h2>
                <p className={styles.sectionSubtitle}>A glimpse into the diverse collection of NFT specialists you can command.</p>
                <div className={styles.carouselWrapper}>
                    <div className={`${styles.glassPane} ${isShattering ? styles.shatter : ''}`}></div>
                    <Carousel
                        showThumbs={false}
                        showStatus={false}
                        showIndicators={false}
                        infiniteLoop={true}
                        autoPlay={true}
                        interval={5000}
                        onChange={handleCarouselChange}
                        selectedItem={currentSlide}
                        renderArrowPrev={(onClickHandler, hasPrev, label) =>
                            hasPrev && (
                                <button type="button" onClick={onClickHandler} title={label} className={`${styles.carouselArrow} ${styles.prevArrow}`}>
                                    &#10094;
                                </button>
                            )
                        }
                        renderArrowNext={(onClickHandler, hasNext, label) =>
                            hasNext && (
                                <button type="button" onClick={onClickHandler} title={label} className={`${styles.carouselArrow} ${styles.nextArrow}`}>
                                    &#10095;
                                </button>
                            )
                        }
                    >
                        {nftImagesForCarousel.map((fileName, index) => (
                            <div key={index} className={styles.carouselSlide}>
                                <Image 
                                    src={`/img/nfts/${fileName}`}
                                    alt={`Fumegator Specialist NFT ${fileName}`}
                                    width={400}
                                    height={400}
                                    className={styles.carouselImage}
                                />
                            </div>
                        ))}
                    </Carousel>
                </div>
            </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.socialLinks}>
            <a href="https://t.me/Fumegator" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><FaTelegram /></a>
            <a href="https://x.com/FumegatorP2E" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://discord.gg/9kfJTarXU8" target="_blank" rel="noopener noreferrer" aria-label="Discord"><FaDiscord /></a>
        </div>
        
        <div className={styles.footerLinks}>
          <Link href="/terms">Terms of Use</Link>
          <span>|</span>
          <Link href="/privacy">Privacy Policy</Link>
          <span>|</span>
          <Link href="/about">Project Description</Link>
        </div>
        
        <p>&copy; {new Date().getFullYear()} Hospital Fumegator. All rights reserved.</p>
      </footer>
    </div>
  );
}