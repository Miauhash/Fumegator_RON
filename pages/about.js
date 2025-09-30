import React from 'react';
import Head from 'next/head';

const AboutPage = () => {
  return (
    <>
      <Head>
        <title>About - Fumegator Hospital</title>
      </Head>
      <div className="prose prose-invert max-w-4xl mx-auto p-8">
          <h1>About Fumegator Hospital</h1>
          
          <h2>What is Fumegator Hospital?</h2>
          <p>Fumegator Hospital is an innovative simulation and strategy (tycoon) game built on the Ronin blockchain. It combines the addictive gameplay of resource management with the true digital asset ownership enabled by Web3 technology. Players take on the role of administrators of a state-of-the-art hospital complex, with the goal of building a medical empire, producing valuable resources, and dominating the in-game economy.</p>

          <h2>Our Philosophy: Gameplay First</h2>
          <p>We believe that Web3 games must, first and foremost, be fun and engaging. Our philosophy focuses on three core pillars:</p>
          <ul>
              <li><strong>Strategic Depth:</strong> Success in Fumegator Hospital is not about luck, but about smart decisions. Players must balance the production of different resources, decide which rooms to upgrade, when to invest in new specialists, and how to interact with the market to maximize their efficiency.</li>
              <li><strong>True Ownership:</strong> Your Specialists (NFTs) and your tokens are truly yours. Integration with the Ronin blockchain ensures you have full control over your assets, with the ability to trade, sell, or hold them as part of your long-term strategy.</li>
              <li><strong>Sustainable Economy:</strong> We have designed a circular economy where every token and item has a clear purpose (a "sink"). From upgrade costs to crafting and market fees, we ensure the economy remains healthy and rewards active players.</li>
          </ul>
          
          <h2>The Fumegator Ecosystem</h2>
          <p>The game extends far beyond the simple production cycle. We have built a rich ecosystem of interconnected features to keep the gameplay fresh and interesting:</p>
          <ul>
              <li><strong>Core Production:</strong> The heart of the game, where you assign your Specialists to produce vital resources.</li>
              <li><strong>Medical Expeditions:</strong> A form of passive NFT staking, where your idle Specialists can bring back rare rewards.</li>
              <li><strong>Research Lab:</strong> A crafting system where you can turn basic resources into powerful buffs and consumable items.</li>
              <li><strong>Fumegator Asylum:</strong> A deflationary mechanism that allows players to burn lower-value NFTs for a chance to obtain a new, improved one.</li>
              <li><strong>Marketplace:</strong> A P2P hub for the exchange of NFTs and tokens, driven entirely by the community.</li>
          </ul>

          <h2>The Future is Collaborative</h2>
          <p>The launch of Fumegator Hospital is just the beginning. We are committed to an ambitious development roadmap that includes leaderboards, an achievement system, global events, and eventually, a DAO (Decentralized Autonomous Organization) that will give governance token holders a real voice in the future of the game. We believe the future of gaming is built together with the community.</p>
          <p><strong>Welcome to Fumegator Hospital. The operation begins now.</strong></p>
      </div>
    </>
  );
};

export default AboutPage;