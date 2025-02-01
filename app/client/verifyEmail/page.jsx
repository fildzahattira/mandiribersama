'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/ui/client/client.module.css';

export default function VerifyEmail() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const invoiceId = new URLSearchParams(window.location.search).get('invoice_id');
        if (!invoiceId) {
            setError('Invoice ID tidak ditemukan');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/verifyEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoice_id: invoiceId, email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Terjadi kesalahan saat memverifikasi email');
                return;
            }

            const data = await response.json();
            if (data.success) {
                // Jika email valid, arahkan ke halaman masukkan OTP
                router.push(`/client/verifyTOTP?invoice_id=${invoiceId}`);
            } else {
                setError(data.error || 'Email tidak valid');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Terjadi kesalahan saat mengirim email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Insert Your Email</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.input}
                />
                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}