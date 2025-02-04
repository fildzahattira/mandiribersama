"use client";
import { useState } from 'react';
import styles from "@/app/ui/dashboard/user/createUser.module.css";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    admin_name: '',
    admin_email: '',
    admin_password: '',
    admin_role: 'Admin',
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
    console.log("Form Data:", formData); // Debugging
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const data = await response.json();
      console.log('User created:', data);
      window.alert('User created successfully');
      window.location.href = '/dashboard/user/list';
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <table>
          <tbody>
            <tr>
              <td>
                <label>Name</label>
              </td>
              <td>
                <input
                  type="text"
                  name="admin_name"
                  value={formData.admin_name}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>Email</label>
              </td>
              <td>
                <input
                  type="email"
                  name="admin_email"
                  value={formData.admin_email}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>Password</label>
              </td>
              <td>
                <input
                  type="password"
                  name="admin_password"
                  value={formData.admin_password}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>Role</label>
              </td>
              <td>
                <select
                  name="admin_role"
                  value={formData.admin_role}
                  onChange={handleChange}
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
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