'use client'; // Pastikan komponen ini adalah Client Component
import { useState } from 'react';
import styles from '@/app/ui/client/client.module.css'; // Impor CSS module

export default function VerifyEmail() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const invoiceId = new URLSearchParams(window.location.search).get('invoice_id'); // Ambil invoice_id dari query parameter

        try {
            const response = await fetch('/api/verifyEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoice_id: invoiceId, email }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Jika email valid, arahkan ke halaman validasi
                window.location.href = `/client/validationPage?invoice_id=${invoiceId}`;
            } else {
                setError(data.error || 'Email tidak valid');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Terjadi kesalahan saat mengirim email');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Masukkan Email Anda</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.input}
                />
                <button type="submit" className={styles.button}>Kirim</button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}