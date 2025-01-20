'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/app/ui/dashboard/invoice/invoice.module.css';
import Search from "@/app/ui/dashboard/search/search";
import Pagination from "@/app/ui/dashboard/pagination/pagination";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from 'qrcode';

const ListInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null); // Menyimpan invoice yang dipilih
  const [isPopupVisible, setIsPopupVisible] = useState(false); // Menyimpan status popup
  const [emailAccess, setEmailAccess] = useState(''); // Menyimpan email yang akan diupdate

  const formatCurrency = (value) => {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Fetch data dari API
  useEffect(() => {
    const fetchInvoices = async () => {
      const response = await fetch('/api/invoice'); // Memanggil API yang telah dibuat
      const data = await response.json();
      setInvoices(data); // Menyimpan data invoice ke dalam state
    };

    fetchInvoices(); // Memanggil function untuk fetch data
  }, []);

  const handleDetailClick = async (invoice) => {
    try {
      // Panggil API untuk mengambil detail invoice berdasarkan invoice_id
      const response = await fetch(`/api/invoice?invoice_id=${invoice.invoice_id}`);
      const data = await response.json();
  
      if (response.ok) {
        console.log('Detail Invoice:', data); // Periksa data dari API
        setSelectedInvoice(data); // Simpan data invoice yang dipilih
        setEmailAccess(''); // Reset input email baru
        setIsPopupVisible(true); // Tampilkan popup
      } else {
        alert('Gagal mengambil detail invoice.');
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
  };

  // Fungsi untuk menangani perubahan input email
  const handleEmailChange = (e) => {
    setEmailAccess(e.target.value);
  };

  // Fungsi untuk submit pembaruan email
  const handleUpdateEmail = async () => {
  if (!emailAccess.trim()) {
    alert('Email tidak boleh kosong!');
    return;
  }

  try {
    const response = await fetch(`/api/invoice/access/${selectedInvoice.invoice_number}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: emailAccess }),
    });

    if (response.ok) {
      alert('Email berhasil ditambahkan.');
      // Refresh data invoice untuk menampilkan email yang baru ditambahkan
      const fetchResponse = await fetch(`/api/invoice?invoice_id=${selectedInvoice.invoice_id}`);
      const data = await fetchResponse.json();
      setSelectedInvoice(data);
      setEmailAccess(''); // Reset input email
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Gagal menambahkan email.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Terjadi kesalahan saat menambahkan email.');
  }
};

const handleDownloadPDF = async () => {
  if (!selectedInvoice) {
    alert("Tidak ada invoice yang dipilih!");
    return;
  }

  console.log('Selected Invoice:', selectedInvoice); // Periksa data selectedInvoice

  // Inisialisasi jsPDF dengan ukuran A4
  const doc = new jsPDF({
    orientation: 'portrait', // Orientasi portrait (default)
    unit: 'mm', // Satuan milimeter
    format: 'a4', // Ukuran kertas A4
  });

  const margin = 20; // Margin kiri dan kanan
  let startY = 10; // Posisi awal untuk menulis data

  // Tambahkan logo di sebelah kiri
  const logoUrl = './public/logo.jpeg'; // Ganti dengan path atau URL logo
  doc.addImage(logoUrl, 'jpeg', margin, 20, 30, 30); // (x, y, width, height)

  // Fungsi untuk menambahkan teks dengan pengecekan batas halaman
  const addText = (text, x, y, fontSize = 10, fontStyle = 'normal', lineHeight = 7) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.text(text, x, y);
    return y + lineHeight; // Kembalikan posisi Y baru dengan jarak antar baris yang lebih rapat
  };

  // Header (Alamat dan Kontak di sebelah kanan)
  const addressX = 110; // Posisi X untuk alamat dan kontak (sebelah kanan)
  startY = addText("JL. Sanggar No 31-33", addressX, startY, 10);
  startY = addText("Surabaya (60175)", addressX, startY, 10);
  startY = addText("Telp. : +6231-73690229", addressX, startY, 10);
  startY = addText("Fax. : +6231-3576864", addressX, startY, 10);
  startY = addText("INDONESIA", addressX, startY, 10);
  startY += 7; // Beri jarak tambahan

  // Judul Invoice
  startY = addText("# Invoice", margin, startY, 14, 'bold', 8); // Judul lebih besar, jarak sedikit lebih longgar
  startY += 7; // Beri jarak tambahan

  // Bill To dan Invoice Details
  const billToX = margin; // Posisi X untuk Bill To
  const invoiceDetailsX = 110; // Posisi X untuk Invoice Details

  startY = addText("Bill To:", billToX, startY, 10, 'bold');
  startY = addText(selectedInvoice.client_name, billToX, startY, 10);
  startY = addText(selectedInvoice.client_address, billToX, startY, 10);

  startY = addText("Invoice No.: " + selectedInvoice.invoice_number, invoiceDetailsX, startY - 14, 10);
  startY = addText("Date: " + selectedInvoice.invoice_date, invoiceDetailsX, startY, 10);
  startY = addText("Terms: CASH ONLY", invoiceDetailsX, startY, 10);
  startY += 7; // Beri jarak tambahan

  // Forwarding Vessel hingga ETA
  startY = addText("Frd Vsl. Mother Vsl: " + selectedInvoice.forwarding_vessel, margin, startY, 10);
  startY = addText("POD / FDES: " + selectedInvoice.port_of_discharge, margin, startY, 10);
  startY = addText("POL: " + selectedInvoice.port_of_loading, margin, startY, 10);
  startY = addText("B/L No: " + selectedInvoice.bill_lading, margin, startY, 10);
  startY = addText("Shipper: " + selectedInvoice.shipper, margin, startY, 10);
  startY = addText("Consignee: " + selectedInvoice.consignee, margin, startY, 10);
  startY = addText("No.of Pkgs/Measurement: " + selectedInvoice.measurement, margin, startY, 10);
  startY = addText("Cargo Description: " + selectedInvoice.cargo_description, margin, startY, 10);
  startY = addText("Cntr Details: " + selectedInvoice.container_details, margin, startY, 10);
  startY = addText("ETD/ETA: " + selectedInvoice.etd + " / " + selectedInvoice.eta, margin, startY, 10);
  startY += 7; // Beri jarak tambahan

  // Tabel Charges
  if (selectedInvoice.charges && selectedInvoice.charges.length > 0) {
    autoTable(doc, {
      startY: startY,
      head: [["Charge Description", "Amount"]],
      body: selectedInvoice.charges.map((charge) => [
        charge.description,
        `IDR ${formatCurrency(charge.amount)}`,
      ]),
      theme: "grid",
      styles: { 
        fontSize: 9, // Ukuran font lebih kecil
        halign: "center",
        cellPadding: 2, // Padding cell lebih kecil
      },
      headStyles: {
        fontSize: 9, // Ukuran font lebih kecil
        fillColor: [200, 200, 200] // Warna abu-abu untuk header tabel
      },
      margin: { top: 7 } // Margin atas tabel lebih kecil
    });
    startY = doc.lastAutoTable.finalY + 7; // Update startY jika tabel dibuat
  } else {
    startY = addText("No charges available.", margin, startY);
  }

  // Total Amount
  if (selectedInvoice.charges && selectedInvoice.charges.length > 0) {
    const totalAmount = selectedInvoice.charges.reduce(
      (sum, charge) => sum + Number(charge.amount),
      0
    );
    startY = addText(`Total Amount: IDR ${formatCurrency(totalAmount)}`, margin, startY, 10, 'bold');
  }

  // Footer
  startY += 7; // Beri jarak tambahan
  startY = addText("PAYMENT SHOULD BE RECEIVED IN FULL AMOUNT", margin, startY, 10, 'bold');
  startY = addText("CV. MANDIRI BERSAMA NO REK :", margin, startY, 10);
  startY = addText("IDR REK No: 1400012299286", margin, startY, 10);
  startY = addText("BANK MANDIRI Cab. Surabaya Niaga.", margin, startY, 10);
  startY += 7; // Beri jarak tambahan

  // Authorized Signature
  startY = addText("Authorized Signature", margin + 100, startY, 10, 'bold');
  startY = addText("CV. MANDIRI BERSAMA", margin + 100, startY, 10);

  // Generate QR Code
  try {
    const qrCodeData = selectedInvoice.qr_code; // Ambil URL dari kolom qr_code
    const QRCode = await import('qrcode');
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, { width: 100, margin: 1 });

    // Tambahkan QR Code ke PDF (posisi di kanan bawah)
    const qrCodeX = doc.internal.pageSize.width - 50; // Posisi X untuk QR Code (kanan)
    const qrCodeY = doc.internal.pageSize.height - 50; // Posisi Y untuk QR Code (bawah)
    doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, 30, 30); // (x, y, width, height)
  } catch (error) {
    console.error("Error generating QR code:", error);
    alert("Gagal membuat QR Code.");
  }

  // Simpan PDF
  doc.save(`INVOICE_${selectedInvoice.invoice_number}.pdf`);
};

  const handleSoftDelete = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoice?invoice_id=${invoiceId}`, {
        method: 'PUT',
      });
  
      if (response.ok) {
        // Hapus invoice dari state
        setInvoices((prevInvoices) =>
          prevInvoices.filter((invoice) => invoice.invoice_id !== invoiceId)
        );
        alert('Invoice berhasil dihapus');
        handleClosePopup(); // Tutup popup setelah berhasil menghapus
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
        <Search placeholder="Search invoice..." />
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
          {invoices.map((invoice) => (
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
      <Pagination />

      {/* Popup Detail Invoice */}
      {isPopupVisible && selectedInvoice && (
  <div className={styles.popup}>
    <div className={styles.popupContent}>
      <button className={styles.closeButton} onClick={handleClosePopup}>
        &times;
      </button>
      <h2>Detail Invoice No. {selectedInvoice.invoice_number}</h2>
      <hr />
      {/* <h3>Email Access</h3>
      <ul>
        {selectedInvoice.emails.map((email, index) => (
          <li key={index}>{email}</li>
        ))}
      </ul>
      <h3>Tambah Email Baru</h3>
      <input
        type="email"
        placeholder="Masukkan email baru..."
        value={emailAccess}
        onChange={handleEmailChange}
        className={styles.input}
      />
      <button onClick={handleUpdateEmail} className={styles.updateButton}>
        Tambah Email
      </button> */}
      <br />
      <div className={styles.actions}>
        <button onClick={handleDownloadPDF} className={styles.downloadButton}>
          Unduh PDF
        </button>
        <button onClick={() => handleSoftDelete(selectedInvoice.invoice_id)} className={styles.deleteButton}>
          Hapus Dokumen Invoice
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ListInvoice;