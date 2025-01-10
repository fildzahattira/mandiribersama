// import styles from '@/app/ui/dashboard/user/createUser.module.css'

// const CreateUser = () => {
//   return (
//     <div className={styles.container}>
//     <table>
//         <tbody>
//             <tr>
//                 <td>
//                     <label>Name</label>
//                 </td>
//                 <td>
//                     <input type="text" id="admin_name" name="admin_name" />
//                 </td>
//             </tr>
//             <tr>
//                 <td>
//                     <label>Email</label>
//                 </td>
//                 <td>
//                     <input type="text" id="admin_email" name="admin_email" />
//                 </td>
//             </tr>
//             <tr>
//                 <td>
//                     <label>Password</label>
//                 </td>
//                 <td>
//                     <input type="password" id="admin_password" name="admin_password" />
//                 </td>
//             </tr>
//         </tbody>
//     </table>
// </div>
//   )
// }

// export default CreateUser
"use client"
import { useState } from 'react';
import axios from 'axios';
import styles from "@/app/ui/dashboard/user/user.module.css";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    admin_name: '',
    admin_email: '',
    admin_password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/user', formData);
      console.log('User created:', response.data);
      window.alert('User created successfully');
      window.location.href = '/dashboard/user/list'; // Redirect to the list user page
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <table>
          <tbody>
            <tr>
              <td>
                <label htmlFor="admin_name">Name</label>
              </td>
              <td>
                <input
                  type="text"
                  id="admin_name"
                  name="admin_name"
                  value={formData.admin_name}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="admin_email">Email</label>
              </td>
              <td>
                <input
                  type="text"
                  id="admin_email"
                  name="admin_email"
                  value={formData.admin_email}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="admin_password">Password</label>
              </td>
              <td>
                <input
                  type="password"
                  id="admin_password"
                  name="admin_password"
                  value={formData.admin_password}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                <button type="submit">Create User</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default CreateUser;