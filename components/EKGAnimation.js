// components/EKGAnimation.js (VERSÃO CORRIGIDA)
import styles from '../styles/EKGAnimation.module.css';

const EKGAnimation = () => (
  <div className={styles.ekgWrapper}>
    <svg viewBox="0 0 150 30" className={styles.ekgSvg} preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* <<< CORREÇÃO APLICADA AQUI: Cores reais no gradiente >>> */}
        <linearGradient id="ekgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#00e5ff', stopOpacity: 0 }} />
          <stop offset="50%" style={{ stopColor: '#00e5ff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#00e5ff', stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path
        d="M 0 15 H 40 L 45 23 L 55 7 L 60 15 L 65 12 L 70 18 H 150"
        className={styles.ekgPath}
      />
    </svg>
  </div>
);

export default EKGAnimation;