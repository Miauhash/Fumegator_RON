// components/ParticleEffect.js (VERSÃO COM MAIS POEIRA)

import { useEffect } from 'react';
import styles from '../styles/ParticleEffect.module.css';

export default function ParticleEffect({ onAnimationEnd }) {
  // Informa ao componente pai que a animação terminou após 1.2 segundos
  useEffect(() => {
    const timer = setTimeout(onAnimationEnd, 1200);
    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  // <<< ALTERAÇÃO AQUI: Aumentamos o número de partículas de 25 para 45 >>>
  const particles = Array.from({ length: 45 });
  const particleColors = ['#ffc107', '#ff7f50', '#ffffff', '#add8e6', '#f0e68c'];

  return (
    <div className={styles.particleContainer}>
      {particles.map((_, i) => {
        // Lógica para dar a cada partícula uma trajetória e cor única
        const angle = Math.random() * 360; // Direção aleatória
        // <<< ALTERAÇÃO AQUI: Aumentamos o raio máximo da explosão para dispersar mais >>>
        const radius = 50 + Math.random() * 120; // Distância aleatória do centro
        const xEnd = `${radius * Math.cos(angle * Math.PI / 180)}px`;
        const yEnd = `${radius * Math.sin(angle * Math.PI / 180)}px`;
        const color = particleColors[Math.floor(Math.random() * particleColors.length)];

        // Variáveis CSS são usadas para passar os valores para a animação no arquivo .css
        const style = {
          '--x-end': xEnd,
          '--y-end': yEnd,
          '--particle-color': color,
        };

        return <div key={i} className={styles.particle} style={style} />;
      })}
    </div>
  );
}