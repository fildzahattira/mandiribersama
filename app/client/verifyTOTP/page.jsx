'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '@/app/ui/client/client.module.css';

export default function EnterOtp() {
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
                setError('OTP tidak valid. Silakan coba lagi.');
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
            <h1 className={styles.title}>Masukkan Kode OTP</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    placeholder="Masukkan OTP"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={6} // Maksimal 6 digit
                    required
                    className={styles.input}
                />
                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'Memverifikasi...' : 'Verifikasi'}
                </button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}