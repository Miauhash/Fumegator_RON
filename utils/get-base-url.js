// utils/get-base-url.js (CRIE SE NÃO EXISTIR)
const getBaseUrl = () => {
  // Se a variável VERCEL_URL estiver disponível (ambiente Vercel/produção), use-a.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Para ambiente local (desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Fallback para seu domínio de produção se VERCEL_URL não estiver definida
  return 'https://www.fumegator.xyz';
};

export default getBaseUrl;