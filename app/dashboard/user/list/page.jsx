"use client"
import { useEffect, useState } from 'react';
import styles from "@/app/ui/dashboard/user/user.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
import Pagination from "@/app/ui/dashboard/pagination/pagination";


const ListUser = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // State untuk halaman saat ini
  const [itemsPerPage] = useState(10); // Jumlah item per halaman


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.admin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.admin_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

     // Hitung total halaman
     const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

     // Ambil data untuk halaman saat ini
     const indexOfLastItem = currentPage * itemsPerPage;
     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
     const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
     const handlePageChange = (page) => {
       setCurrentPage(page);
     };

  const toggleUserStatus = async (admin_id, is_active) => {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_id, is_active: !is_active }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengubah status user');
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.admin_id === admin_id ? { ...user, is_active: !is_active } : user
        )
      );
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search
          placeholder="Search user..."
          onSearch={(query) => setSearchQuery(query)}
        />
        <Link href="/dashboard/user/create">
          <button className={styles.addButton}>Add New User</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Name</td>
            <td>Email</td>
            <td>Role</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.admin_id}>
              <td>{user.admin_name}</td>
              <td>{user.admin_email}</td>
              <td>{user.admin_role}</td>
              <td>
                <button
                  className={`${styles.statusButton} ${user.is_active ? styles.active : styles.inactive}`}
                  onClick={() => toggleUserStatus(user.admin_id, user.is_active)}
                >
                  {user.is_active ? 'Active' : 'Non-Active'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
    </div>
  );
};

export default ListUser;
