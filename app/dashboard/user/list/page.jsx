// import styles from "@/app/ui/dashboard/user/user.module.css"
// import Search from "@/app/ui/dashboard/search/search"
// import Link from "next/link"
// import Pagination from "@/app/ui/dashboard/pagination/pagination"

// const ListUser = () => {
//   return (
//     <div className={styles.container}>
//       <div className={styles.top}>
//         <Search placeholder="Search for a user..."/>
//         <Link href="/dashboard/user/create">
//           <button className={styles.addButton}>Add New User</button>
//         </Link>
//       </div>
//       <table className={styles.table}>
//         <thead>
//           <tr>
//             <td>Name</td>
//             <td>Email</td>
//             <td>Action</td>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td>
//               <div className={styles.user}>
//                 Park Jimin
//               </div>
//             </td>
//             <td>jimin@gmail.com</td>
//             <td>
//               <div className={styles.buttons}>
//                 <Link href="/">
//                   <button className={`${styles.button} ${styles.view}`}>View</button>
//                 </Link>
//                   <button className={`${styles.button} ${styles.delete}`}>Delete</button>
//               </div>
//             </td>
//           </tr>
//         </tbody>
//       </table>
//       <Pagination/>
//     </div>
//   )
// }

// export default ListUser
"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from "@/app/ui/dashboard/user/user.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
import Pagination from "@/app/ui/dashboard/pagination/pagination";

const ListUser = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/user');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a user..." />
        <Link href="/dashboard/user/create">
          <button className={styles.addButton}>Add New User</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
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
      <Pagination />
    </div>
  );
};

export default ListUser;