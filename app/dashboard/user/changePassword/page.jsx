"use client";

import { useState } from "react";
import styles from "@/app/ui/dashboard/user/user.module.css";

const ChangePassword = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Tambahkan state untuk loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true); // Set loading menjadi true

    const current_password = e.target.current_password.value;
    const new_password = e.target.new_password.value;
    const confirm_password = e.target.confirm_password.value;

    try {
      const response = await fetch("/api/auth", {
        method: "PUT", // Method PUT
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ current_password, new_password, confirm_password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        e.target.reset();
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false); // Set loading menjadi false setelah selesai (baik sukses maupun error)
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <table>
          <tbody>
            <tr>
              <td>Current Password</td>
              <td>
                <input type="password" name="current_password" required /> {/* Tambahkan required */}
              </td>
            </tr>
            <tr>
              <td>New Password</td>
              <td>
                <input type="password" name="new_password" required /> {/* Tambahkan required */}
              </td>
            </tr>
            <tr>
              <td>Confirm Password</td>
              <td>
                <input type="password" name="confirm_password" required /> {/* Tambahkan required */}
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                <button type="submit" disabled={isLoading}> {/* Disable button saat loading */}
                  {isLoading ? "Loading..." : "Change"} {/* Tampilkan teks loading */}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default ChangePassword;