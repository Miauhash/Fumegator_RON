// pages/api/nft/transfer-to-vault.js

import { Connection, clusterApiUrl, PublicKey, Transaction } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from '@solana/spl-token';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userWallet, nftMint } = req.body;
    if (!userWallet || !nftMint) {
      return res.status(400).json({ error: 'Parâmetros ausentes.' });
    }

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const devWalletPublicKey = new PublicKey(process.env.NEXT_PUBLIC_DEV_WALLET_ADDRESS);
    const userPublicKey = new PublicKey(userWallet);
    const nftMintPublicKey = new PublicKey(nftMint);

    // Esta parte CRIA a transação, mas NÃO a assina.
    // O backend apenas prepara o "contrato".

    // O jogador (userWallet) pagará a taxa se a conta do dev precisar ser criada.
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, userPublicKey, nftMintPublicKey, userPublicKey);
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, userPublicKey, nftMintPublicKey, devWalletPublicKey);

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        userPublicKey,
        1
      )
    );

    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPublicKey;

    // Serializa a transação para enviá-la de volta ao frontend
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });

    res.status(200).json({ transaction: serializedTransaction.toString('base64') });

  } catch (error) {
    console.error("Erro na API de transferência para o cofre:", error);
    res.status(500).json({ error: 'Falha ao preparar a transação.' });
  }
}