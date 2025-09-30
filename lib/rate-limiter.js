// lib/rate-limiter.js

const requests = new Map();

/**
 * Um middleware de rate limiting simples baseado em IP.
 * @param {number} limit O número máximo de requisições permitidas.
 * @param {number} windowMs A janela de tempo em milissegundos.
 * @returns {Function} Um middleware que pode ser usado para proteger as rotas da API.
 */
export const rateLimiter = (limit, windowMs) => (handler) => async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!ip) {
        return res.status(400).json({ message: 'Could not identify IP address.' });
    }

    const now = Date.now();
    const userRequests = requests.get(ip) || [];

    // Filtra as requisições que estão dentro da janela de tempo
    const requestsInWindow = userRequests.filter(timestamp => timestamp > now - windowMs);

    if (requestsInWindow.length >= limit) {
        return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    // Adiciona o timestamp da requisição atual
    requestsInWindow.push(now);
    requests.set(ip, requestsInWindow);
    
    // Limpa requisições antigas para não sobrecarregar a memória
    setTimeout(() => {
        const currentRequests = requests.get(ip) || [];
        const updatedRequests = currentRequests.filter(timestamp => timestamp > Date.now() - windowMs);
        if (updatedRequests.length > 0) {
            requests.set(ip, updatedRequests);
        } else {
            requests.delete(ip);
        }
    }, windowMs);

    return handler(req, res);
};