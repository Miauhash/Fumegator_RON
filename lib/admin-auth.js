// lib/admin-auth.js

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

/**
 * Middleware de autenticação para proteger rotas da API de admin.
 * Ele envolve a função handler original.
 * @param {Function} handler A função handler original da rota da API.
 * @returns {Function} Uma nova função handler que primeiro verifica a autorização.
 */
export function adminAuthGuard(handler) {
  return async (req, res) => {
    // Verifica o cabeçalho de autorização
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }
    
    // Se a autorização for válida, executa o handler original
    return handler(req, res);
  };
}