import React from 'react';
import Head from 'next/head';

const PrivacyPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - Fumegator Hospital</title>
      </Head>
      <div className="prose prose-invert max-w-4xl mx-auto p-8">
          <h1>Fumegator Hospital Privacy Policy</h1>
          <p className="lead">Last Updated: September 20, 2025</p>

          <h2>1. Introduction</h2>
          <p>This Privacy Policy describes how Fumegator Hospital ("we," "our") collects, uses, and shares information about you when you use our game and related services (collectively, the "Service").</p>

          <h2>2. Information We Collect</h2>
          <p>We collect information to operate, maintain, and improve our Service.</p>
          <ul>
              <li><strong>Information Collected Automatically:</strong> When you interact with our Service, we automatically collect certain information. The most important is your <strong>Ronin wallet address</strong>, which is necessary to identify your in-game account and record your digital assets. We may also collect your IP address and gameplay data (progress, levels, in-game token balances) to save your game state and ensure functionality.</li>
              <li><strong>Blockchain Information:</strong> All transactions you conduct through the Service, such as transferring NFTs or tokens, are public and permanently recorded on the Ronin blockchain. We do not control the blockchain or the information that is publicly visible on it.</li>
              <li><strong>Cookies and Similar Technologies:</strong> We may use cookies to store preferences, such as your selected language, and for the general operation of the site.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
              <li>Provide, operate, and maintain our Service.</li>
              <li>Save and restore your game progress associated with your wallet address.</li>
              <li>Analyze the use of the Service to identify trends and improve the user experience.</li>
              <li>Prevent fraud, illegal activities, and ensure the security of our ecosystem.</li>
              <li>Communicate with you, if necessary, for customer support.</li>
          </ul>

          <h2>4. How We Share Your Information</h2>
          <p>We do not sell your personal information. We may share information under the following circumstances:</p>
          <ul>
              <li><strong>With Service Providers:</strong> We may share information with third-party vendors who help us operate our Service, such as hosting providers (e.g., Vercel) and database providers (e.g., Neon.tech).</li>
              <li><strong>For Legal Reasons:</strong> We may disclose information if we believe it is necessary to comply with a legal obligation, protect our rights, or ensure the safety of our users.</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>We take reasonable measures to protect the information we collect. However, no security system is impenetrable, and we cannot guarantee the absolute security of your data. The security of your Ronin wallet's private key is your sole responsibility.</p>

          <h2>6. Children's Privacy</h2>
          <p>Our service is not intended for children under the age of 13 (or the relevant minimum age in your jurisdiction). We do not knowingly collect information from children.</p>
          
          <h2>7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us through our official Discord channel.</p>
      </div>
    </>
  );
};

export default PrivacyPage;