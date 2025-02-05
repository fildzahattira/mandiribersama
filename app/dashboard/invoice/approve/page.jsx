'use client';
import { useEffect, useState } from 'react';
import styles from '@/app/ui/dashboard/invoice/invoice.module.css';
import Search from "@/app/ui/dashboard/search/search";

const ApproveInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPreviewPopupVisible, setIsPreviewPopupVisible] = useState(false);

  useEffect(() => {
    const fetchNeedApproveInvoices = async () => {
      try {
        const response = await fetch(`/api/invoice?action=is_approve`);
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching need approve invoices:', error);
      }
    };

    fetchNeedApproveInvoices();
  }, []);

  const formatCurrency = (value) => {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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

  const handleApproveInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoice?invoice_id=${invoiceId}&action=approve`, {
        method: 'PUT',
      });

      if (response.ok) {
        setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.invoice_id !== invoiceId));
        alert('Invoice approved successfully');
      } else {
        alert('Failed to approve invoice');
      }
    } catch (error) {
      console.error('Error approving invoice:', error);
      alert('Error occurred while approving invoice.');
    }
  };

  const handleClosePopup = () => {
    setIsPreviewPopupVisible(false);
    setSelectedInvoice(null);
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateTotalAmount = (charges) => {
    return charges.reduce((total, charge) => total + Number(charge.amount), 0);
  };
  

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search approve invoice..." onSearch={setSearchQuery} />
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Invoice Number</td>
            <td>Client Name</td>
            <td>Total Amount</td>
            <td>Admin</td>
            <td>Preview</td>
            <td>Approve</td>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((invoice) => (
            <tr key={invoice.invoice_number}>
              <td>{invoice.invoice_number}</td>
              <td>{invoice.client_name}</td>
              <td>Rp {formatCurrency(invoice.total_amount)}</td>
              <td>{invoice.admin_name}</td>
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
                  onClick={() => handleApproveInvoice(invoice.invoice_id)}
                >
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Preview Popup */}
      {isPreviewPopupVisible && selectedInvoice && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <button className={styles.closeButton} onClick={handleClosePopup}>
              &times;
            </button>
            <h2>Preview Invoice No. {selectedInvoice.invoice_number}</h2>
            <hr />

            <div className={styles.invoiceDetails}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Invoice Date:</strong> {formatDate(selectedInvoice.invoice_date)}
                  <br />
                  <strong>Client Name:</strong> {selectedInvoice.client_name}
                  <br/>
                  <strong>Client Address:</strong> {selectedInvoice.client_address}
                  <br/>
                  <strong>Vessel:</strong> {selectedInvoice.forwarding_vessel}
                  <br/>
                  
                </div>
                <div>
                  <strong>Port of Loading:</strong> {selectedInvoice.port_of_loading}
                  <br/>
                  <strong>Port of Discharge:</strong> {selectedInvoice.port_of_discharge}
                  <br/>
                  <strong>Bill of Lading:</strong> {selectedInvoice.bill_lading}
                  <br/>
                  <strong>ETD:</strong> {formatDate(selectedInvoice.etd)}
                  <br/>
                  <strong>ETA:</strong> {formatDate(selectedInvoice.eta)}
                </div>
              </div>

              {/* <hr className="my-4"/> */}

              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Shipper:</strong> {selectedInvoice.shipper}
                    <br/>
                    <strong>Consignee:</strong> {selectedInvoice.consignee}
                  </div>
                </div>
              </div>

              {/* <hr className="my-4"/> */}

              <div>
                <div>
                  <strong>Description:</strong> {selectedInvoice.cargo_description}
                  <br/>
                  <strong>Measurement:</strong> {selectedInvoice.measurement}
                </div>
              </div>

              <hr className="my-4"/>

              <div>
                <h4>Charges</h4>
                <table className="w-full">
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
                        <td>Rp {formatCurrency(charge.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right mt-2">
                  <strong>Total Amount:</strong> Rp {formatCurrency(calculateTotalAmount(selectedInvoice.charges))}
                </div>
              </div>

              <hr className="my-4"/>

              <div>
                <h4>Email Access</h4>
                <ul>
                  {selectedInvoice.access_email && selectedInvoice.access_email.map((email, index) => (
                    <li key={index}>{email.email}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveInvoice;