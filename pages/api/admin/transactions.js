// pages/api/admin/transactions.js

import prisma from '../../../lib/prisma';
import { adminAuthGuard } from '../../../lib/admin-auth'; // Caminho corrigido

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const withdraws = await prisma.withdrawTransaction.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
        });

        const deposits = await prisma.depositTransaction.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({ withdraws, deposits });

    } catch (error) {
        console.error("Error fetching transaction history:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

export default adminAuthGuard(handler);