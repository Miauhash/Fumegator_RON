import React from 'react';
import Head from 'next/head';

const TermsPage = () => {
  return (
    <>
      <Head>
        <title>Terms of Use - Fumegator Hospital</title>
      </Head>
      <div className="prose prose-invert max-w-4xl mx-auto p-8">
          <h1>Fumegator Hospital Terms of Use</h1>
          <p className="lead">Last Updated: September 20, 2025</p>

          <h2>1. Agreement to Terms</h2>
          <p>These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Fumegator Hospital (“we,” “us,” or “our”), concerning your access to and use of the Fumegator Hospital game, as well as any other website, media form, or application related thereto (collectively, the “Service”). You agree that by accessing the Service, you have read, understood, and agreed to be bound by all of these Terms of Use.</p>
          <p><strong>IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICE AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong></p>

          <h2>2. Eligibility</h2>
          <p>By using the Service, you represent and warrant that: (a) you have the legal capacity to agree to these Terms of Use; (b) you are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Service; (c) you will not access the Service through automated or non-human means, whether through a bot, script, or otherwise, except as expressly permitted; (d) you will not use the Service for any illegal or unauthorized purpose.</p>

          <h2>3. User Accounts and Wallet Security</h2>
          <p>To interact with the Web3 ecosystem of our Service, you must connect a third-party cryptocurrency wallet, such as Ronin Wallet. You are solely responsible for maintaining the security of your wallet, including your private keys and passwords. Any activity that occurs through your wallet will be deemed your activity. We are not responsible for any losses resulting from unauthorized access to your wallet.</p>

          <h2>4. Digital Assets (NFTs and Tokens)</h2>
          <p>The Service involves the use of non-fungible tokens (“NFTs,” referred to in-game as “Specialists”) and fungible tokens (“Tokens,” such as VIDA, INSULINE, ZOLGENSMA, etc.), which are recorded on the Ronin blockchain.</p>
          <ul>
              <li><strong>Ownership:</strong> When you acquire an NFT in our ecosystem, you own it as an asset on the Ronin blockchain. Your ownership is governed by the smart contract terms and the Ronin network.</li>
              <li><strong>License to Use:</strong> We grant you a limited, worldwide, royalty-free license to use and display the art associated with your NFT for personal, non-commercial purposes.</li>
              <li><strong>Risks:</strong> You acknowledge and agree that the value of digital assets is volatile. We do not guarantee the value or liquidity of any assets. All transactions on the blockchain are final and irreversible.</li>
          </ul>

          <h2>5. User Conduct</h2>
          <p>You agree not to use the Service to:</p>
          <ul>
              <li>Engage in any form of cheating, bug exploitation, hacking, or use of unauthorized automation software.</li>
              <li>Perform any illegal activity, including money laundering or terrorist financing.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service or its smart contracts.</li>
              <li>Harass, abuse, or harm another user.</li>
          </ul>
          <p>We reserve the right to suspend or terminate your access to the Service, at our sole discretion, for any violation of these terms.</p>

          <h2>6. Intellectual Property</h2>
          <p>Unless otherwise indicated, the Service and all its content (including but not limited to the design, text, graphics, logos, icons, images, source code) are our property and are protected by copyright and trademark laws. You do not acquire any ownership rights to the Service other than the NFTs you own.</p>

          <h2>7. Disclaimer of Warranties and Limitation of Liability</h2>
          <p>THE SERVICE IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. YOU AGREE THAT YOUR USE OF THE SERVICE WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICE AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
          <p>IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>

          <h2>8. Contact Us</h2>
          <p>If you have any questions about these Terms of Use, please contact us through our official Discord channel.</p>
      </div>
    </>
  );
};

export default TermsPage;