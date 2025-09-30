// pages/api/admin/users.js
import prisma from "../../../lib/prisma";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  // Verificação de segurança um pouco mais robusta
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  // --- LÓGICA GET ---
  if (req.method === "GET") {
    try {
      // Lógica para buscar um único usuário (para o modal de inventário)
      if (req.query.wallet) {
        // CORREÇÃO: Usando o nome de modelo correto 'gameState'
        const userDetail = await prisma.gameState.findUnique({ where: { wallet: req.query.wallet } });
        
        if (!userDetail) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        // Converte o estado de string para JSON antes de enviar
        userDetail.state = JSON.parse(userDetail.state || '{}');
        return res.status(200).json(userDetail);
      }
      
      // Lógica principal para buscar a lista de todos os usuários
      // CORREÇÃO: Usando o nome de modelo correto 'gameState'
      const users = await prisma.gameState.findMany({
        select: { wallet: true, updatedAt: true, isWithdrawalBlocked: true },
        orderBy: { updatedAt: 'desc' },
      });

      // Retorna a lista (pode ser vazia, o que é um resultado válido)
      return res.status(200).json(users);

    } catch (e) {
      console.error("Erro na API GET /api/admin/users:", e);
      return res.status(500).json({ error: "Erro ao buscar usuários", details: e.message });
    }
  }

  // --- LÓGICA POST ---
  if (req.method === "POST") {
    try {
      const { wallet, isBlocked } = req.body;
      if (!wallet || typeof isBlocked !== 'boolean') {
        return res.status(400).json({ error: "Parâmetros inválidos" });
      }
      // CORREÇÃO: Usando o nome de modelo correto 'gameState'
      const updatedUser = await prisma.gameState.update({
        where: { wallet },
        data: { isWithdrawalBlocked: isBlocked },
      });
      return res.status(200).json({ success: true, user: updatedUser });
    } catch (e) {
      console.error("Erro na API POST /api/admin/users:", e);
      return res.status(500).json({ error: "Erro ao atualizar usuário", details: e.message });
    }
  }

  // Se o método não for GET ou POST
  return res.status(405).json({ error: "Método não permitido" });
}