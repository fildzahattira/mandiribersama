'use client'; // Pastikan komponen ini adalah Client Component
import { useState } from 'react';
import styles from '@/app/ui/client/client.module.css'; // Impor CSS module

export default function VerifyOtp() {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const invoiceId = new URLSearchParams(window.location.search).get('invoice_id');
        const email = new URLSearchParams(window.location.search).get('email');

        try {
            const response = await fetch('/api/verifyOtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoice_id: invoiceId, email, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                // Navigasi ke halaman detail invoice
                window.location.href = `/invoice/detail/${invoiceId}`;
            } else {
                setError(data.error || 'OTP tidak valid');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Terjadi kesalahan saat memverifikasi OTP');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Masukkan Kode OTP</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    placeholder="654321"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className={styles.input}
                />
                <button type="submit" className={styles.button}>Kirim</button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}