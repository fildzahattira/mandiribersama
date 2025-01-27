import { useState } from 'react';
import styles from './search.module.css';
import { MdSearch } from 'react-icons/md';

const Search = ({ placeholder, onSearch }) => {
  const [query, setQuery] = useState(''); // State untuk menyimpan nilai input

  // Fungsi untuk menangani perubahan input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value); // Perbarui state query
    onSearch(value); // Panggil fungsi onSearch yang diteruskan dari parent
  };

  // Fungsi untuk menangani event tombol Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(query); // Panggil fungsi onSearch saat tombol Enter ditekan
    }
  };

  return (
    <div className={styles.container}>
      <MdSearch />
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange} // Tambahkan event onChange
        onKeyDown={handleKeyDown} // Tambahkan event onKeyDown
        className={styles.input}
      />
    </div>
  );
};

export default Search;