'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '@/app/ui/client/client.module.css';

export default function verifyTOTP() {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const invoiceId = searchParams.get('invoice_id');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        try {
            const response = await fetch('/api/verifyTOTP', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    otp: otp, // Hanya kirim `otp`
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Terjadi kesalahan saat memverifikasi OTP');
                return;
            }
    
            const data = await response.json();
            if (data.isValid) {
                // Jika OTP valid, arahkan ke halaman sukses
                router.push(`/client/validationPage?invoice_id=${invoiceId}`);
            } else {
                setError('Invalid OTP. Please try again.');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Terjadi kesalahan saat memverifikasi OTP');
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk memastikan hanya angka yang bisa dimasukkan
    const handleOtpChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 6) { // Hanya angka dan maksimal 6 digit
            setOtp(value);
        }
    };

    return (
        <div className={styles.container}>
        <img src="/logo_polos.png" alt="CV. Mandiri Bersama" className={styles.logo} />
            <h1 className={styles.title}>Check your email for the OTP code.</h1>
            <br/>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    placeholder="XXXXXX"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={6} // Maksimal 6 digit
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

