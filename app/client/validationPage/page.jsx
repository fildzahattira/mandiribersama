'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MdCheckCircle } from 'react-icons/md';
import styles from '@/app/ui/client/client.module.css';

export default function ValidationPage() {
    const searchParams = useSearchParams();
    const invoiceId = searchParams.get('invoice_id');
    const [invoice, setInvoice] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (invoiceId) {
            fetch(`/api/validationPage?invoice_id=${invoiceId}`)
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
                    setError('An error occurred while loading the invoice details.');
                });
        } else {
            setError('Invoice ID not found.');
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
                <h1 className={styles.title}>Loading...</h1>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <MdCheckCircle className={styles.icon} />
            <h1 className={styles.title}>Invoice Valid</h1>
            <p>This invoice created by CV. Mandiri Bersama</p>
            <div className={styles.details}>
                <p><strong>Invoice Number:</strong> {invoice.invoice_number}</p>
                <p><strong>Invoice Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                <p><strong>Client Name:</strong> {invoice.client_name}</p>
                <p><strong>Total:</strong> IDR {invoice.charges.reduce((sum, charge) => sum + Number(charge.amount), 0).toLocaleString()}</p>
            </div>
        </div>
    );
}
