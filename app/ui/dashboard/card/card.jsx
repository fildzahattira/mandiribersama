import styles from './card.module.css';

const Card = ({ title, number, children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.texts}>
        <span className={styles.title}>{title}</span>
        <span className={styles.number}>{number}</span>
      </div>
      {children && <div className={styles.chart}>{children}</div>} {/* Tambahkan grafik di bawah angka */}
    </div>
  );
};

export default Card;
