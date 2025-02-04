"use client";

import { useState } from "react";
import styles from "@/app/ui/dashboard/user/changePassword.module.css";

const ChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const current_password = e.target.current_password.value;
    const new_password = e.target.new_password.value;
    const confirm_password = e.target.confirm_password.value;

    // Validasi password baru
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$/;
    if (!passwordRegex.test(new_password)) {
      alert(
        "The new password must be at least 7 characters long, containing uppercase letters, lowercase letters, numbers, and special characters."
      );
      setIsLoading(false);
      return;
    }

    if (new_password !== confirm_password) {
      alert("The new password and confirmation password do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ current_password, new_password, confirm_password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password changed successfully. You will be logged out.");
        // Logout pengguna dengan memanggil API logout
        await fetch("/api/auth/logout", { method: "POST" });
        // Redirect ke halaman login menggunakan window.location
        window.location.href = "/login";
      } else {
        alert(data.error || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
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
                <input type="password" name="current_password" required />
              </td>
            </tr>
            <tr>
              <td>New Password</td>
              <td>
                <input type="password" name="new_password" required />
              </td>
            </tr>
            <tr>
              <td>Confirm Password</td>
              <td>
                <input type="password" name="confirm_password" required />
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Change"}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default ChangePassword;