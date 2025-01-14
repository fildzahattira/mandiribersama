// 'use client';
// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import styles from '@/app/ui/dashboard/invoice/invoice.module.css';
// import Search from "@/app/ui/dashboard/search/search";
// import Pagination from "@/app/ui/dashboard/pagination/pagination";

// const ListInvoice = () => {
//   const [invoices, setInvoices] = useState([]);

//   const formatCurrency = (value) => {
//     return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
//   };

//   // Fetch data from the API
//   useEffect(() => {
//     const fetchInvoices = async () => {
//       const response = await fetch('/api/invoice'); // Memanggil API yang telah dibuat
//       const data = await response.json();
//        console.log(data);  
//       setInvoices(data); // Menyimpan data invoice ke dalam state
//     };

//     fetchInvoices(); // Memanggil function untuk fetch data
//   }, []);

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
//                   <Link href={`/dashboard/invoice/detail/${invoice.invoice_number}`}>
//                     <button className={`${styles.button} ${styles.detail}`}>Detail</button>
//                   </Link>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <Pagination />
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

const ListInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null); // Menyimpan invoice yang dipilih
  const [isPopupVisible, setIsPopupVisible] = useState(false); // Menyimpan status popup
  const [emailAccess, setEmailAccess] = useState(''); // Menyimpan email yang akan diupdate

  const formatCurrency = (value) => {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Fetch data from the API
  useEffect(() => {
    const fetchInvoices = async () => {
      const response = await fetch('/api/invoice'); // Memanggil API yang telah dibuat
      const data = await response.json();
      console.log(data);
      setInvoices(data); // Menyimpan data invoice ke dalam state
    };

    fetchInvoices(); // Memanggil function untuk fetch data
  }, []);

  // Fungsi untuk menampilkan popup dengan detail invoice
  const handleDetailClick = (invoice) => {
    setSelectedInvoice(invoice);
    setEmailAccess(''); // Reset input email
    setIsPopupVisible(true);
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
            {/* <p><strong>Client Name:</strong> {selectedInvoice.client_name}</p>
            <p><strong>Total Amount:</strong> Rp {formatCurrency(selectedInvoice.total_amount)}</p> */}
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
              <button className={styles.downloadButton}>Unduh PDF</button>
              <button className={styles.deleteButton}>Hapus Dokumen Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListInvoice;
