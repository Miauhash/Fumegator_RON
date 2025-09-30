// lib/prisma.js (VERSÃO CORRIGIDA E OTIMIZADA COM PADRÃO SINGLETON)

import { PrismaClient } from '@prisma/client';

// Declara a variável global para o cliente Prisma
let prisma;

// --- LOG DE DEPURAÇÃO ---
// Esta linha ajuda a confirmar qual URL do banco de dados está sendo usada na inicialização.
// É útil para verificar se o arquivo .env foi carregado corretamente.
console.log("INICIALIZANDO PRISMA CLIENT. CONECTANDO AO BANCO DE DADOS:", process.env.DATABASE_URL);

if (process.env.NODE_ENV === 'production') {
  // Em produção, é seguro criar uma nova instância, pois o código só roda uma vez.
  prisma = new PrismaClient();
} else {
  // Em desenvolvimento, o Next.js recarrega os módulos, o que pode criar múltiplas instâncias.
  // Para evitar isso, armazenamos a instância em um objeto 'global' que não é afetado pelo recarregamento.
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Exporta a instância única e segura do PrismaClient para ser usada em toda a aplicação.
export default prisma;