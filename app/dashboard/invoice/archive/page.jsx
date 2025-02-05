'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/app/ui/dashboard/invoice/invoice.module.css';
import Search from "@/app/ui/dashboard/search/search";
import { generatePdf } from 'app/utils/generatePdf';

const ArchiveInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchArchivedInvoices = async () => {
      try {
        const response = await fetch(`/api/invoice?action=is_deleted`);
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching archived invoices:', error);
      }
    };

    fetchArchivedInvoices();
  }, []);

  const formatCurrency = (value) => {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleRestoreInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoice?invoice_id=${invoiceId}&action=restore`, {
        method: 'PUT',
      });

      if (response.ok) {
        setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.invoice_id !== invoiceId));
        alert('Invoice restored successfully');
      } else {
        alert('Failed to restore invoice');
      }
    } catch (error) {
      console.error('Error restoring invoice:', error);
      alert('Error occurred while restoring invoice.');
    }
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search archived invoice..." onSearch={setSearchQuery} />
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Invoice Number</td>
            <td>Client Name</td>
            <td>Total Amount</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((invoice) => (
            <tr key={invoice.invoice_number}>
              <td>{invoice.invoice_number}</td>
              <td>{invoice.client_name}</td>
              <td>Rp {formatCurrency(invoice.total_amount)}</td>
              <td>
                <button
                  className={`${styles.button} ${styles.detail}`}
                  onClick={() => handleRestoreInvoice(invoice.invoice_id)}
                >
                  Restore
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ArchiveInvoice;
