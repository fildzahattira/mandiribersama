// import styles from './pagination.module.css'

// const Pagination = () => {
//     return (
//         <div className={styles.container}>
//             <button className={styles.button}>Previous</button>
//             <button className={styles.button}>Next</button>
//         </div>
//     )
// }

// export default Pagination

import styles from './pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1} // Nonaktifkan tombol "Previous" jika di halaman pertama
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        className={styles.button}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages} // Nonaktifkan tombol "Next" jika di halaman terakhir
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;