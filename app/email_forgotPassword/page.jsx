"use client"; 
import { useState } from "react";
import Link from "next/link";
import styles from "@/app/ui/login/emailForgotPassword.module.css"; 

const EmailForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); 
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      const response = await fetch("/api/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin_email: email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("A reset password link has been sent to your email.");
      } else {
        setError(data.error || "Failed to send reset password link.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>Forgot Password</h1>
        {message && <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>}
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
        <div className={styles.backToLogin}>
          <Link href="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default EmailForgotPassword;
