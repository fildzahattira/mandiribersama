'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/app/ui/dashboard/invoice/invoice.module.css';
import Search from "@/app/ui/dashboard/search/search";
import { generatePdf } from 'app/utils/generatePdf';
import Pagination from "@/app/ui/dashboard/pagination/pagination"

const ListInvoice = () => {
  const [invoices, setInvoices] = useState([]); 
  const [selectedInvoice, setSelectedInvoice] = useState(null); 
  const [isPopupVisible, setIsPopupVisible] = useState(false); 
  const [emailAccess, setEmailAccess] = useState(''); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [adminRole, setAdminRole] = useState(''); 
  const [isPreviewPopupVisible, setIsPreviewPopupVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState(1); 
  const [itemsPerPage] = useState(10); 
  
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch("/api/auth", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setAdminRole(data.admin_role); 
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchAdminData();
  }, []);

  // Fungsi untuk memformat mata uang
  const formatCurrency = (value) => {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Fetch data invoice dari API
useEffect(() => {
    const fetchInvoices = async () => {
      try {
        if (!adminRole) return;

        // Choose endpoint based on role
        const endpoint = adminRole === 'Super Admin' 
          ? '/api/invoice?action=is_list'
          : '/api/invoice?action=is_list_admin';

        const response = await fetch(endpoint);
        const data = await response.json();
    
        const sortedInvoices = data.sort((a, b) => {
          return a.invoice_number.localeCompare(b.invoice_number);
        });
    
        setInvoices(sortedInvoices);
        console.log('Fetched and Sorted Invoices:', sortedInvoices);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchInvoices();
  }, [adminRole]);



  // Fungsi untuk memfilter invoice berdasarkan kata kunci
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Hitung total halaman
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Ambil data untuk halaman saat ini
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  // Fungsi untuk menangani klik tombol "Detail"
  const handleDetailClick = async (invoice) => {
    try {
      // Panggil API untuk mendapatkan detail invoice berdasarkan invoice_id
      const response = await fetch(`/api/invoice?invoice_id=${invoice.invoice_id}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedInvoice(data); 
        setEmailAccess(''); 
        setIsPopupVisible(true); 
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
    setIsPreviewPopupVisible(false);
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
        alert('Invoice archived successfully');
        handleClosePopup(); // Tutup popup setelah berhasil menghapus
      } else {
        alert('Gagal menghapus invoice');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menghapus invoice.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  const calculateTotalAmount = (charges) => {
    return charges.reduce((total, charge) => total + Number(charge.amount), 0);
  };

  
  const handlePreviewClick = async (invoice) => {
    try {
      const response = await fetch(`/api/invoice?invoice_id=${invoice.invoice_id}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedInvoice(data);
        setIsPreviewPopupVisible(true);
      } else {
        alert('Failed to get invoice details.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while fetching invoice details.');
    }
  };

  const getInvoiceStatus = (invoice) => {
    if (invoice.is_deleted === 1 && invoice.is_approve === 1) {
      return { status: "Archived", className: styles.orangeText };
    } else if (invoice.is_deleted === 1 && invoice.is_reject === 1) {
      return { status: "Rejected", className: styles.redText };
    } else if (invoice.is_deleted === 0 && invoice.is_approve === 0 && invoice.is_reject === 0) {
      return { status: "Pending", className: styles.yellowText };
    } else {
      return { status: "Approved", className: styles.blueText }; 
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
            {/* <td>No</td> */}
            <td>Invoice Number</td>
            <td>Client Name</td>
            <td>Total Amount</td>
            <td>Status</td>
            <td>Preview</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
  {currentInvoices.map((invoice, index) => {
    const { status, className } = getInvoiceStatus(invoice); 
    const isDisabled = status === "Archived" || status === "Pending" || status === "Rejected"; 

    // const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

    return (
      <tr key={invoice.invoice_number}>
        {/* <td>{rowNumber}</td> */}
        <td>{invoice.invoice_number}</td>
        <td>{invoice.client_name}</td>
        <td>Rp {formatCurrency(invoice.total_amount)}</td>
        <td className={className}>{status}</td> {/* Tampilkan status dengan class CSS */}
        <td>
          <button
            className={`${styles.button} ${styles.preview}`}
            onClick={() => handlePreviewClick(invoice)}
          >
            See Preview
          </button>
        </td>
        <td>
          <div className={styles.buttons}>
            <button
              className={`${styles.button} ${styles.detail}`}
              onClick={() => handleDetailClick(invoice)}
              disabled={isDisabled} // Nonaktifkan tombol jika status tertentu
            >
              Detail
            </button>
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
      </table>

          <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
        
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
            <div className={styles.emailInputContainer}>
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
            </div>

            <br />
            <div className={styles.actions}>
              <button onClick={handleDownloadPDF} className={styles.downloadButton}>
                Download Invoice
              </button>
              <button onClick={() => handleSoftDelete(selectedInvoice.invoice_id)} className={styles.deleteButton} disabled={adminRole === 'Admin'}  title={adminRole === "Admin" ? "Super Admin Only" : ""}>
                Archive Invoice
              </button>
            </div>
          </div>
        </div>
        
        
      )}
      {isPreviewPopupVisible && selectedInvoice && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <button className={styles.closeButton} onClick={handleClosePopup}>
              &times;
            </button>
            <h2>Detail Invoice No. {selectedInvoice.invoice_number}</h2>
            <hr />

            <div className={styles.invoiceDetails}>
            <table className={styles.detailTable}>
                <tbody>
                  <tr>
                    <td><strong>Invoice Date</strong></td>
                    <td>{formatDate(selectedInvoice.invoice_date)}</td>
                  </tr>
                  <tr>
                    <td><strong>Client Name</strong></td>
                    <td>{selectedInvoice.client_name}</td>
                  </tr>
                  <tr>
                    <td><strong>Client Address</strong></td>
                    <td>{selectedInvoice.client_address}</td>
                  </tr>
                  <tr>
                    <td><strong>Forwarding Vessel</strong></td>
                    <td>{selectedInvoice.forwarding_vessel}</td>
                  </tr>
                  <tr>
                    <td><strong>Port of Discharge</strong></td>
                    <td>{selectedInvoice.port_of_discharge}</td>
                  </tr>
                  <tr>
                    <td><strong>Port of Loading</strong></td>
                    <td>{selectedInvoice.port_of_loading}</td>
                  </tr>
                  <tr>
                    <td><strong>Bill Lading</strong></td>
                    <td>{selectedInvoice.bill_lading}</td>
                  </tr>
                  <tr>
                    <td><strong>Shipper</strong></td>
                    <td>{selectedInvoice.shipper}</td>
                  </tr>
                  <tr>
                    <td><strong>Consignee</strong></td>
                    <td>{selectedInvoice.consignee}</td>
                  </tr>
                  <tr>
                    <td><strong>Measurement</strong></td>
                    <td>{selectedInvoice.measurement}</td>
                  </tr>
                  <tr>
                    <td><strong>Cargo Description</strong></td>
                    <td>{selectedInvoice.cargo_description}</td>
                  </tr>
                  <tr>
                    <td><strong>ETD</strong></td>
                    <td>{formatDate(selectedInvoice.etd)}</td>
                  </tr>
                  <tr>
                    <td><strong>ETA</strong></td>
                    <td>{formatDate(selectedInvoice.eta)}</td>
                  </tr>

                </tbody>
              </table>

              <hr className="my-4"/>

              <h4>Charges</h4>
              <table className={styles.detailTable}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.charges.map((charge, index) => (
                    <tr key={index}>
                      <td>{charge.description}</td>
                      <td>{formatCurrency(charge.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <br/>
              <div className="text-right mt-2">
                <strong>Total Amount:</strong> Rp {formatCurrency(calculateTotalAmount(selectedInvoice.charges))}
              </div>

              <hr className="my-4"/>

              <h4>Email Access</h4>
              <ul>
                {selectedInvoice.access_email && selectedInvoice.access_email.map((email, index) => (
                  <li key={index}>{email.email}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListInvoice;