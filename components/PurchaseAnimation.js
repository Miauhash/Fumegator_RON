// components/PurchaseAnimation.js
import { useEffect } from 'react';
import styles from '../styles/PurchaseAnimation.module.css';

export default function PurchaseAnimation({ item, onAnimationEnd }) {
  // Após 3 segundos, informa ao componente pai que a animação terminou.
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 3000); // Duração da animação

    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  if (!item) return null;

  return (
    <div className={styles.overlay}>
      <img
        src={item.image}
        alt={item.name}
        className={styles.animatedItem}
      />
    </div>
  );
}