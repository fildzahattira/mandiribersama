'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/app/ui/dashboard/invoice/invoice.module.css';
import Search from "@/app/ui/dashboard/search/search";
import { generatePdf } from 'app/utils/generatePdf';

const ListInvoice = () => {
  const [invoices, setInvoices] = useState([]); // State untuk menyimpan daftar invoice
  const [selectedInvoice, setSelectedInvoice] = useState(null); // State untuk menyimpan invoice yang dipilih
  const [isPopupVisible, setIsPopupVisible] = useState(false); // State untuk menampilkan popup
  const [emailAccess, setEmailAccess] = useState(''); // State untuk input email baru
  const [searchQuery, setSearchQuery] = useState(''); // State untuk menyimpan kata kunci pencarian

  // Fungsi untuk memformat mata uang
  const formatCurrency = (value) => {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Fetch data invoice dari API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/invoice'); // Panggil API untuk mendapatkan daftar invoice
        const data = await response.json();
  
        const sortedInvoices = data.sort((a, b) => {
          return a.invoice_number.localeCompare(b.invoice_number);
        });
  
        setInvoices(sortedInvoices); // Simpan data yang sudah diurutkan ke state
        console.log('Fetched and Sorted Invoices:', sortedInvoices); // Debugging
      } catch (error) {
        console.error('Error fetching invoices:', error); // Debugging
      }
    };

    fetchInvoices(); // Jalankan fungsi fetch
  }, []);

  // Fungsi untuk memfilter invoice berdasarkan kata kunci
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    // console.log('Filtering Invoices:', invoice.invoice_number, matchesSearch); // Debugging
    return matchesSearch;
  });

  // Fungsi untuk menangani klik tombol "Detail"
  const handleDetailClick = async (invoice) => {
    try {
      // Panggil API untuk mendapatkan detail invoice berdasarkan invoice_id
      const response = await fetch(`/api/invoice?invoice_id=${invoice.invoice_id}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedInvoice(data); // Simpan detail invoice ke state
        setEmailAccess(''); // Reset input email
        setIsPopupVisible(true); // Tampilkan popup
        // console.log('Detail Invoice:', data); // Debugging
      } else {
        alert('Failed get detail invoice.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengambil detail invoice.');
    }
  };

  // Fungsi untuk menutup popup
  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setSelectedInvoice(null);
    console.log('Popup Closed'); // Debugging
  };

  // Fungsi untuk menangani perubahan input email
  const handleEmailChange = (e) => {
    setEmailAccess(e.target.value);
    console.log('Email Input Changed:', e.target.value); // Debugging
  };

  // Fungsi untuk menambahkan email baru
  const handleAddEmail = async () => {
    if (!emailAccess.trim()) {
      alert('Fill new email field first');
      return;
    }

    try {
      const response = await fetch(`/api/invoice?invoice_id=${selectedInvoice.invoice_id}&action=add_email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailAccess }), // Kirim email baru
      });

      if (response.ok) {
        alert('Email added successfully');
        // Refresh data invoice untuk menampilkan email yang baru
        const fetchResponse = await fetch(`/api/invoice?invoice_id=${selectedInvoice.invoice_id}`);
        const data = await fetchResponse.json();
        setSelectedInvoice(data);
        setEmailAccess(''); // Reset input email
        // console.log('Email Added:', emailAccess); // Debugging
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Gagal menambahkan email.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menambahkan email.');
    }
  };

  // Fungsi untuk menghapus email
  const handleDeleteEmail = async (emailToDelete) => {
    try {
      const response = await fetch(`/api/invoice?invoice_id=${selectedInvoice.invoice_id}&action=delete_email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToDelete }), // Kirim email yang akan dihapus
      });

      if (response.ok) {
        alert('Email deleted successfully');
        // Refresh data invoice untuk menampilkan email yang baru
        const fetchResponse = await fetch(`/api/invoice?invoice_id=${selectedInvoice.invoice_id}`);
        const data = await fetchResponse.json();
        setSelectedInvoice(data);
        // console.log('Email Deleted:', emailToDelete); // Debugging
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Gagal menghapus email.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menghapus email.');
    }
  };

  // Fungsi untuk mengunduh PDF
  const handleDownloadPDF = async () => {
    await generatePdf(selectedInvoice, formatCurrency);
    console.log('PDF Downloaded'); // Debugging
  };

  // Fungsi untuk soft delete invoice
  const handleSoftDelete = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoice?invoice_id=${invoiceId}&action=soft_delete`, {
        method: 'PUT',
      });

      if (response.ok) {
        // Hapus invoice dari state
        setInvoices((prevInvoices) =>
          prevInvoices.filter((invoice) => invoice.invoice_id !== invoiceId)
        );
        alert('Invoice deleted successfully');
        handleClosePopup(); // Tutup popup setelah berhasil menghapus
        // console.log('Invoice Soft Deleted:', invoiceId); // Debugging
      } else {
        alert('Gagal menghapus invoice');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menghapus invoice.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search
          placeholder="Search invoice..."
          onSearch={(query) => setSearchQuery(query)}
        />
        <Link href="/dashboard/invoice/create">
          <button className={styles.addButton}>Create Invoice</button>
        </Link>
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
                <div className={styles.buttons}>
                  <button
                    className={`${styles.button} ${styles.detail}`}
                    onClick={() => handleDetailClick(invoice)}
                  >
                    Detail
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup Detail Invoice */}
      {isPopupVisible && selectedInvoice && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <button className={styles.closeButton} onClick={handleClosePopup}>
              &times;
            </button>
            <h2>Detail Invoice No. {selectedInvoice.invoice_number}</h2>
            <hr />

            {/* Tampilkan daftar email yang sudah ada */}
            <h4>Email Access</h4>
            <ul>
              {selectedInvoice.access_email && selectedInvoice.access_email.map((email, index) => (
                <li key={index}>
                  {email.email} &nbsp;
                  <button
                    onClick={() => handleDeleteEmail(email.email)}
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>

            {/* Input untuk menambahkan email baru */}
            {/* <h3>Add new email access</h3> */}
            <input
              type="email"
              placeholder="Type here new email access..."
              value={emailAccess}
              onChange={handleEmailChange}
              className={styles.input}
            />
            <button onClick={handleAddEmail} className={styles.addButton}>
              Add Email
            </button>

            <br />
            <div className={styles.actions}>
              <button onClick={handleDownloadPDF} className={styles.downloadButton}>
                Download Invoice
              </button>
              <button onClick={() => handleSoftDelete(selectedInvoice.invoice_id)} className={styles.deleteButton}>
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListInvoice;