// components/BackgroundPipes.js
import styles from '../styles/BackgroundPipes.module.css';

// Define as cores dos líquidos para cada fileira
const rowColors = {
  1: styles.liquidWhite,
  2: styles.liquidGreen,
  3: styles.liquidBlue,
  4: styles.liquidRed,
  5: styles.liquidGold,
};

const PipeRow = ({ top, rowId }) => {
  const liquidColorClass = rowColors[rowId] || styles.liquidGray;
  return (
    <>
      {/* Conector Esquerdo */}
      <div className={styles.pipeConnector} style={{ top: `calc(${top} - 10px)`, left: '10%' }}></div>
      {/* Tubo Horizontal Esquerdo */}
      <div className={`${styles.pipe} ${styles.pipeHorizontal}`} style={{ top: `calc(${top} - 15px)`, left: '10%', width: '15%' }}>
        <div className={`${styles.liquid} ${liquidColorClass}`}></div>
      </div>

      {/* Conector Direito */}
      <div className={styles.pipeConnector} style={{ top: `calc(${top} - 10px)`, right: '15%' }}></div>
      {/* Tubo Horizontal Direito */}
      <div className={`${styles.pipe} ${styles.pipeHorizontal}`} style={{ top: `calc(${top} - 15px)`, right: '15%', width: '15%' }}>
        <div className={`${styles.liquid} ${liquidColorClass}`}></div>
      </div>
    </>
  );
};

export default function BackgroundPipes({ isPremium }) {
  const containerClasses = `${styles.pipesContainer} ${isPremium ? styles.mysticGlow : ''}`;

  return (
    <div className={containerClasses}>
      {/* Tubo Principal Esquerdo */}
      <div className={`${styles.pipe} ${styles.pipeVertical}`} style={{ top: '15%', left: '10%', height: '80%' }}>
        <div className={`${styles.liquid} ${styles.liquidGray}`}></div>
      </div>
      
      {/* Tubo Principal Direito */}
      <div className={`${styles.pipe} ${styles.pipeVertical}`} style={{ top: '15%', right: '15%', height: '80%' }}>
        <div className={`${styles.liquid} ${styles.liquidGray}`}></div>
      </div>

      {/* Fileiras de Tubos Horizontais */}
      <PipeRow top="25%" rowId={1} />
      <PipeRow top="45%" rowId={2} />
      <PipeRow top="65%" rowId={3} />
      <PipeRow top="85%" rowId={4} />
      
      {/* Adicione a 5ª fileira se/quando ela existir no layout */}
      {/* <PipeRow top="95%" rowId={5} /> */}
    </div>
  );
}