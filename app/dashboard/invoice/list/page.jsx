// 'use client';
// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import styles from '@/app/ui/dashboard/invoice/invoice.module.css';
// import Search from "@/app/ui/dashboard/search/search";
// import Pagination from "@/app/ui/dashboard/pagination/pagination";

// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const ListInvoice = () => {
//   const [invoices, setInvoices] = useState([]);
//   const [selectedInvoice, setSelectedInvoice] = useState(null); // Menyimpan invoice yang dipilih
//   const [isPopupVisible, setIsPopupVisible] = useState(false); // Menyimpan status popup
//   const [emailAccess, setEmailAccess] = useState(''); // Menyimpan email yang akan diupdate

//   const formatCurrency = (value) => {
//     return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
//   };

//   // Fetch data from the API
//   useEffect(() => {
//     const fetchInvoices = async () => {
//       const response = await fetch('/api/invoice'); // Memanggil API yang telah dibuat
//       const data = await response.json();
//       console.log(data);
//       setInvoices(data); // Menyimpan data invoice ke dalam state
//     };

//     fetchInvoices(); // Memanggil function untuk fetch data
//   }, []);

//   // Fungsi untuk menampilkan popup dengan detail invoice
//   const handleDetailClick = (invoice) => {
//     setSelectedInvoice(invoice);
//     setEmailAccess(''); // Reset input email
//     setIsPopupVisible(true);
//   };

//   // Fungsi untuk menutup popup
//   const handleClosePopup = () => {
//     setIsPopupVisible(false);
//     setSelectedInvoice(null);
//   };

//   // Fungsi untuk menangani perubahan input email
//   const handleEmailChange = (e) => {
//     setEmailAccess(e.target.value);
//   };

//   // Fungsi untuk submit pembaruan email
//   const handleUpdateEmail = async () => {
//     if (!emailAccess.trim()) {
//       alert('Email tidak boleh kosong!');
//       return;
//     }

//     try {
//       const response = await fetch(`/api/invoice/access/${selectedInvoice.invoice_number}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email: emailAccess }),
//       });

//       if (response.ok) {
//         alert('Email akses berhasil diperbarui.');
//         handleClosePopup();
//       } else {
//         alert('Gagal memperbarui email akses.');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Terjadi kesalahan saat memperbarui email akses.');
//     }
//   };

//   const handleDownloadPDF = () => {
//     if (!selectedInvoice) {
//       alert("Tidak ada invoice yang dipilih!");
//       return;
//     }
  
//     const doc = new jsPDF();
  
//     // Tambahkan header
//     doc.setFontSize(18);
//     doc.text("CV. MANDIRI BERSAMA", 20, 20);
//     doc.setFontSize(12);
//     doc.text("Cargo Service", 20, 30);
//     doc.text("Jl. Sanggar No 31-33, Surabaya", 20, 40);
  
//     // Informasi invoice
//     doc.setFontSize(14);
//     doc.text("Invoice", 105, 60, { align: "center" });
  
//     doc.setFontSize(12);
//     doc.text(`Invoice No: ${selectedInvoice.invoice_number}`, 20, 80);
//     doc.text(`Date: ${selectedInvoice.invoice_date}`, 20, 90);
//     doc.text(`Client Name: ${selectedInvoice.client_name}`, 20, 100);
//     doc.text(`Address: ${selectedInvoice.client_address}`, 20, 110);
  
//     // Tabel charges
//     autoTable(doc, {
//       startY: 130,
//       head: [["Description", "Amount"]],
//       body: selectedInvoice.charges.map((charge) => [
//         charge.description,
//         `Rp ${formatCurrency(charge.amount)}`,
//       ]),
//       theme: "grid",
//       styles: { halign: "center" },
//     });
  
//     // Total Amount
//     const totalAmount = selectedInvoice.charges.reduce(
//       (sum, charge) => sum + charge.amount,
//       0
//     );
//     doc.setFontSize(12);
//     doc.text(`Total Amount: Rp ${formatCurrency(totalAmount)}`, 20, doc.lastAutoTable.finalY + 10);
  
//     // Footer
//     doc.setFontSize(10);
//     doc.text("Payment should be received in full amount", 20, doc.lastAutoTable.finalY + 30);
//     doc.text("Authorized Signature:", 20, doc.lastAutoTable.finalY + 50);
  
//     // Simpan PDF
//     doc.save(`Invoice_${selectedInvoice.invoice_number}.pdf`);
//   };

//   return (
//     <div className={styles.container}>
//       <div className={styles.top}>
//         <Search placeholder="Search invoice..." />
//         <Link href="/dashboard/invoice/create">
//           <button className={styles.addButton}>Create Invoice</button>
//         </Link>
//       </div>
//       <table className={styles.table}>
//         <thead>
//           <tr>
//             <td>Invoice Number</td>
//             <td>Client Name</td>
//             <td>Total Amount</td>
//             <td>Action</td>
//           </tr>
//         </thead>
//         <tbody>
//           {invoices.map((invoice) => (
//             <tr key={invoice.invoice_number}>
//               <td>{invoice.invoice_number}</td>
//               <td>{invoice.client_name}</td>
//               <td>Rp {formatCurrency(invoice.total_amount)}</td>
//               <td>
//                 <div className={styles.buttons}>
//                   <button
//                     className={`${styles.button} ${styles.detail}`}
//                     onClick={() => handleDetailClick(invoice)}
//                   >
//                     Detail
//                   </button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <Pagination />

//       {/* Popup Detail Invoice */}
//       {isPopupVisible && selectedInvoice && (
//         <div className={styles.popup}>
//           <div className={styles.popupContent}>
//             <button className={styles.closeButton} onClick={handleClosePopup}>
//               &times;
//             </button>
//             <h2>Detail Invoice No. {selectedInvoice.invoice_number}</h2>
//             {/* <p><strong>Client Name:</strong> {selectedInvoice.client_name}</p>
//             <p><strong>Total Amount:</strong> Rp {formatCurrency(selectedInvoice.total_amount)}</p> */}
//             <hr />
//             <h3>Update Email Access</h3>
//             <input
//               type="email"
//               placeholder="Masukkan email baru..."
//               value={emailAccess}
//               onChange={handleEmailChange}
//               className={styles.input}
//             />
//             <button onClick={handleUpdateEmail} className={styles.updateButton}>
//               Update Email
//             </button>
//             <br />
//             <div className={styles.actions}>
//             <button onClick={handleDownloadPDF} className={styles.downloadButton}>
//               Unduh PDF
//             </button>
//               <button className={styles.deleteButton}>Hapus Dokumen Invoice</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ListInvoice;

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/app/ui/dashboard/invoice/invoice.module.css';
import Search from "@/app/ui/dashboard/search/search";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  // Fungsi untuk menampilkan popup dengan detail invoice
  const handleDetailClick = async (invoice) => {
    try {
      // Panggil API untuk mengambil detail invoice berdasarkan invoice_id
      const response = await fetch(`/api/invoice?invoice_id=${invoice.invoice_id}`);
      const data = await response.json();
  
      if (response.ok) {
        console.log('Detail Invoice:', data); // Periksa data dari API
        setSelectedInvoice(data); // Simpan data invoice yang dipilih
        setEmailAccess(''); // Reset input email
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
        alert('Email akses berhasil diperbarui.');
        handleClosePopup();
      } else {
        alert('Gagal memperbarui email akses.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat memperbarui email akses.');
    }
  };

  // Fungsi untuk mengunduh PDF
  const handleDownloadPDF = () => {
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
  
    // Simpan PDF
    doc.save(`INVOICE_${selectedInvoice.invoice_number}.pdf`);
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
            <h3>Update Email Access</h3>
            <input
              type="email"
              placeholder="Masukkan email baru..."
              value={emailAccess}
              onChange={handleEmailChange}
              className={styles.input}
            />
            <button onClick={handleUpdateEmail} className={styles.updateButton}>
              Update Email
            </button>
            <br />
            <div className={styles.actions}>
              <button onClick={handleDownloadPDF} className={styles.downloadButton}>
                Unduh PDF
              </button>
              <button className={styles.deleteButton}>Hapus Dokumen Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListInvoice;