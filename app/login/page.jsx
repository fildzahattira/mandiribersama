"use client";
import { useState } from "react";
import styles from "@/app/ui/login/login.module.css";
import Link from "next/link"; 

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(""); // Reset error sebelum request baru

    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      window.location.href = "/dashboard"; // Redirect ke dashboard jika login berhasil
    } else {
      setError(result.error || "Login failed"); // Menampilkan pesan error dari API
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <img src="/logo_polos.png" alt="CV. Mandiri Bersama" className={styles.logo} />
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>} 
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <div className={styles.forgotPasswordLink}>
          <Link href="/email_forgotPassword">Forgot Password?</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;