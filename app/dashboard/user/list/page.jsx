"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from "@/app/ui/dashboard/user/user.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
// import Pagination from "@/app/ui/dashboard/pagination/pagination";

const ListUser = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // State untuk menyimpan kata kunci pencarian


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        setUsers(data);
        console.log('Fetched Invoices:', data); // Debugging
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

    // Fungsi untuk memfilter user berdasarkan kata kunci
    const filteredUsers = users.filter((user) => {
      const matchesSearch =
        user.admin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.admin_email.toLowerCase().includes(searchQuery.toLowerCase());
      // console.log('Filtering Invoices:', invoice.invoice_number, matchesSearch); // Debugging
      return matchesSearch;
    });

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
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.admin_id}>
              <td>
                <div className={styles.user}>
                  {user.admin_name}
                </div>
              </td>
              <td>{user.admin_email}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/user/${user.admin_id}`}>
                    <button className={`${styles.button} ${styles.view}`}>View</button>
                  </Link>
                  <button className={`${styles.button} ${styles.delete}`}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* <Pagination /> */}
    </div>
  );
};

export default ListUser;