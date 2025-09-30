// pages/api/crafting/craft.js (COMPLETO - NENHUMA ALTERAÇÃO NECESSÁRIA)
import prisma from "../../../lib/prisma";

// Para consistência, você pode mudar a 'currency' de SOL para RON, mas não é funcionalmente necessário aqui.
const recipes = {
  'accelerator_60m': { ingredients: { INSULINE: 500, ZOLGENSMA: 250 }, result: { type: 'EQUIPMENT', item: { id: 'time_accelerator_60m', name: 'Acelerador de Tempo (60 Min)', description: 'Acelera TODOS os timers em 2x.', price: 0, currency: 'SOL', type: 'EQUIPMENT', buffName: 'timeAccelerator', duration: 3600000 }}},
  'accelerator_2m': { ingredients: { INSULINE: 100, ZOLGENSMA: 250 }, result: { type: 'EQUIPMENT', item: { id: 'time_accelerator_2m', name: 'Acelerador de Tempo (2 Min)', description: 'Acelera TODOS os timers em 2x.', price: 0, currency: 'SOL', type: 'EQUIPMENT', buffName: 'timeAccelerator', duration: 120000 }}},
  'spin_1': { ingredients: { VIDA: 10, LUXUTURNA: 100 }, result: { type: 'INVENTORY', itemName: 'freeSpins', amount: 1 }},
  'spin_100': { ingredients: { VIDA: 1000, LUXUTURNA: 100 }, result: { type: 'INVENTORY', itemName: 'freeSpins', amount: 100 }},
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { wallet, recipeId } = req.body;
  const recipe = recipes[recipeId];

  if (!wallet || !recipe) return res.status(400).json({ error: "Dados inválidos." });

  try {
    // A lógica de transação do Prisma é atômica e perfeita para esta operação.
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.gameState.findUnique({ where: { wallet } });
      if (!user) throw new Error("Usuário não encontrado.");
      
      // NOTA: O seu código original estava fazendo um JSON.parse em `user.state`, mas se o seu
      // schema do Prisma já define `state` como `Json`, isso não é necessário e pode causar erro.
      // Assumindo que o Prisma já devolve um objeto:
      const state = user.state || {};
      state.balances = state.balances || {};
      state.inventory = state.inventory || {};

      for (const [token, amount] of Object.entries(recipe.ingredients)) {
        if ((state.balances[token] || 0) < amount) {
          throw new Error(`Ingredientes insuficientes. Precisa de ${amount} ${token}.`);
        }
      }

      for (const [token, amount] of Object.entries(recipe.ingredients)) {
        state.balances[token] -= amount;
      }

      if (recipe.result.type === 'EQUIPMENT') {
        const item = recipe.result.item;
        state.inventory[item.id] = { ...item, quantity: (state.inventory[item.id]?.quantity || 0) + 1 };
      } else if (recipe.result.type === 'INVENTORY') {
        state.freeSpins = (state.freeSpins || 0) + recipe.result.amount;
      }
      
      // O Prisma espera um objeto JSON para o campo `state`, não uma string.
      await tx.gameState.update({ where: { wallet }, data: { state: state } });
      return recipe.result.item?.name || `${recipe.result.amount} Giros`;
    });
    res.status(200).json({ success: true, message: `Você criou: ${result}!` });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}