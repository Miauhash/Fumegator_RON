// pages/api/admin/stats.js (VERSÃO DE DEPURAÇÃO COMBINADA)
import prisma from '../../../lib/prisma';

// Pega a variável de ambiente do lado do servidor
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default async function handler(req, res) {
  // --- INÍCIO DO CÓDIGO DE DEPURAÇÃO ---
  console.log("\n--- DEBUG ROTA /api/admin/stats ---");
  console.log("Variável de ambiente lida (ADMIN_PASSWORD):", ADMIN_PASSWORD);
  console.log("Cabeçalho de Autorização recebido do frontend:", req.headers.authorization);
  console.log("A comparação de segurança será:", `'${req.headers.authorization}' === 'Bearer ${ADMIN_PASSWORD}'`);
  // --- FIM DO CÓDIGO DE DEPURAÇÃO ---

  // Verificação de segurança
  if (req.headers.authorization !== `Bearer ${ADMIN_PASSWORD}`) {
    console.error("=> RESULTADO: FALHA NA AUTORIZAÇÃO!");
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  console.log("=> RESULTADO: AUTORIZAÇÃO BEM-SUCEDIDA!");

  try {
    console.log("Tentando consultar o banco de dados...");
    
    // --- SUA LÓGICA ORIGINAL (MANTIDA 100%) ---
    const totalPlayers = await prisma.gameState.count();
    const activeEvent = await prisma.globalEvent.findFirst({ where: { isActive: true } });
    const totalListings = await prisma.marketListing.count({ where: { isActive: true } });

    const allGameStates = await prisma.gameState.findMany({
        select: {
            state: true
        }
    });
    
    const tokenTotals = {
        INSULINE: 0,
        ZOLGENSMA: 0,
        LUXUTURNA: 0,
        ZYNTEGLO: 0,
        VIDA: 0
    };

    allGameStates.forEach(playerState => {
        const balances = playerState.state?.balances;
        if (balances) {
            for (const token in tokenTotals) {
                if (balances[token]) {
                    tokenTotals[token] += Number(balances[token]);
                }
            }
        }
    });
    // --- FIM DA SUA LÓGICA ORIGINAL ---

    console.log("Consulta ao banco de dados realizada com sucesso!");

    res.status(200).json({
      totalPlayers,
      activeEventName: activeEvent?.name || 'Nenhum',
      totalListings,
      tokenTotals
    });

  } catch (error) {
    console.error("!!! ERRO CRÍTICO AO ACESSAR O PRISMA !!!", error);
    res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
  }
}