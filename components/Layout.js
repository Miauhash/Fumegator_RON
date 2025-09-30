import styles from '../styles/Home.module.css';

// Este componente é um "molde" que aplica o fundo escuro do jogo.
export default function Layout({ children }) {
  return (
    <div className={styles.canvas}>
      {children}
    </div>
  );
}