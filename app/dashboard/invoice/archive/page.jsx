'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/app/ui/dashboard/invoice/invoice.module.css';
import Search from "@/app/ui/dashboard/search/search";
// import { generatePdf } from 'app/utils/generatePdf';
import Pagination from "@/app/ui/dashboard/pagination/pagination"


const ArchiveInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPreviewPopupVisible, setIsPreviewPopupVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState(1); // State untuk halaman saat ini
  const [itemsPerPage] = useState(15); // Jumlah item per halaman
  


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

  const handleClosePopup = () => {
    setIsPreviewPopupVisible(false);
  };
  
  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hitung total halaman
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Ambil data untuk halaman saat ini
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const calculateTotalAmount = (charges) => {
    return charges.reduce((total, charge) => total + Number(charge.amount), 0);
  };

  const handlePreviewClick = async (invoice) => {
    try {
      const response = await fetch(`/api/invoice?invoice_id=${invoice.invoice_id}&action=is_deleted`);
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
            <td>Preview</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {currentInvoices.map((invoice) => (
            <tr key={invoice.invoice_number}>
              <td>{invoice.invoice_number}</td>
              <td>{invoice.client_name}</td>
              <td>Rp {formatCurrency(invoice.total_amount)}</td>
              <td>
                <button
                  className={`${styles.button} ${styles.preview}`}
                  onClick={() => handlePreviewClick(invoice)}
                >
                  See Preview
                </button>
              </td>
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

      <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
      {/* Preview Popup */}
      {isPreviewPopupVisible && selectedInvoice && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <button className={styles.closeButton} onClick={handleClosePopup}>
              &times;
            </button>
            <h1 style={{ color: 'red' }}>ARCHIVED</h1>
            <h2>Preview Invoice No. {selectedInvoice.invoice_number}</h2>
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

export default ArchiveInvoice;
