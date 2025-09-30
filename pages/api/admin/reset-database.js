// pages/api/admin/reset-database.js (NOVO ARQUIVO)
import prisma from '../../../lib/prisma';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default async function handler(req, res) {
  // Segurança de Nível Máximo
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido.' });
  if (req.headers.authorization !== `Bearer ${ADMIN_SECRET}`) return res.status(401).json({ message: 'Não autorizado.' });
  if (req.body.confirmation !== 'RESETAR TUDO E ASSUMIR AS CONSEQUÊNCIAS') {
    return res.status(400).json({ message: 'Frase de confirmação incorreta.' });
  }

  try {
    console.warn("INICIANDO RESET COMPLETO DO BANCO DE DADOS POR ORDEM DO ADMINISTRADOR!");

    // A ordem é importante para evitar erros de chave estrangeira
    await prisma.withdrawTransaction.deleteMany({});
    await prisma.depositTransaction.deleteMany({});
    await prisma.marketListing.deleteMany({});
    await prisma.playerEventContribution.deleteMany({});
    await prisma.globalEvent.deleteMany({});
    await prisma.gameState.deleteMany({});
    
    // Opcional: Descomente as linhas abaixo se quiser resetar a loja e as configs também
    // await prisma.shopItem.deleteMany({});
    // await prisma.gameConfig.deleteMany({});

    console.warn("RESET DO BANCO DE DADOS CONCLUÍDO.");
    res.status(200).json({ message: 'O banco de dados foi resetado com sucesso. Todos os dados de jogadores, transações e mercado foram apagados.' });

  } catch (error) {
    console.error("FALHA CRÍTICA DURANTE O RESET DO BANCO DE DADOS:", error);
    res.status(500).json({ message: 'Erro catastrófico durante o reset. Verifique os logs do servidor.' });
  }
}