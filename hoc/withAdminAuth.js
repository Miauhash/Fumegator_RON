import { useState, useEffect } from 'react';
import styles from '../styles/AdminAuth.module.css'; // Criaremos este estilo

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD; // A senha virá do seu .env.local

export default function withAdminAuth(Component) {
  return function AuthenticatedComponent(props) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
      const savedAuth = localStorage.getItem('admin_auth');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }
    }, []);

    const handleLogin = (e) => {
      e.preventDefault();
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('admin_auth', 'true');
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Senha incorreta.');
      }
    };

    if (!isAuthenticated) {
      return (
        <div className={styles.loginContainer}>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <h2>Acesso Restrito</h2>
            <p>Por favor, insira a senha de administrador.</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Senha"
            />
            <button type="submit" className={styles.button}>Entrar</button>
            {error && <p className={styles.error}>{error}</p>}
          </form>
        </div>
      );
    }

    return <Component {...props} />;
  };
}