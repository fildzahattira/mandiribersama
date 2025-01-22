'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Ambil useSearchParams untuk ambil query string
import { MdCheckCircle } from 'react-icons/md';
import styles from '@/app/ui/client/client.module.css';

export default function ValidationSuccess() {
    const searchParams = useSearchParams(); // Gunakan useSearchParams untuk mengambil query string
    const invoiceId = searchParams.get('invoice_id'); // Ambil invoice_id dari query string
    const [invoice, setInvoice] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (invoiceId) {
            fetch(`/api/invoice?invoice_id=${invoiceId}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                    } else {
                        setInvoice(data);
                    }
                })
                .catch((err) => {
                    console.error('Error:', err);
                    setError('Terjadi kesalahan saat memuat detail invoice');
                });
        } else {
            setError('Invoice ID tidak ditemukan');
        }
    }, [invoiceId]);

    if (error) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Error</h1>
                <p className={styles.error}>{error}</p>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Memuat...</h1>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <MdCheckCircle className={styles.icon} />
            <h1 className={styles.title}>Validasi Berhasil</h1>
            <div className={styles.details}>
                <p><strong>Nomor Invoice:</strong> {invoice.invoice_number}</p>
                <p><strong>Tanggal:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                <p><strong>Nama Klien:</strong> {invoice.client_name}</p>
                <p><strong>Total:</strong> IDR {invoice.charges.reduce((sum, charge) => sum + Number(charge.amount), 0).toLocaleString()}</p>
            </div>
        </div>
    );
}