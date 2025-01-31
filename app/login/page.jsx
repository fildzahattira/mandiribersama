"use client";
import { useState } from "react";
import styles from "@/app/ui/login/login.module.css";

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
        <h1>CV. Mandiri Bersama</h1>
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>} {/* Tampilkan pesan error */}
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
      </form>
    </div>
  );
};

export default LoginPage;
