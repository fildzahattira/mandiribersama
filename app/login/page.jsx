import styles from "@/app/ui/login/login.module.css"

const LoginPage = () => {
  return (
    <div className={styles.container}>
      <form action="" className={styles.form}>
        <h1>CV. Mandiri Bersama</h1>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default LoginPage
// "use client";
// import { useState } from 'react';
// import axios from 'axios';
// import styles from "@/app/ui/login/login.module.css";

// const LoginPage = () => {
//   const [formData, setFormData] = useState({
//     admin_email: '',
//     admin_password: ''
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('/api/auth', formData);
//       console.log('Login successful:', response.data);
//       window.alert('Login successful');
//       window.location.href = '/dashboard'; // Redirect to the dashboard page
//     } catch (error) {
//       console.error('Error logging in:', error);
//       window.alert('Invalid email or password');
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <form onSubmit={handleSubmit} className={styles.form}>
//         <h1>CV. Mandiri Bersama</h1>
//         <input
//           type="text"
//           name="admin_email"
//           placeholder="Email"
//           value={formData.admin_email}
//           onChange={handleChange}
//         />
//         <input
//           type="password"
//           name="admin_password"
//           placeholder="Password"
//           value={formData.admin_password}
//           onChange={handleChange}
//         />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// };

// export default LoginPage;