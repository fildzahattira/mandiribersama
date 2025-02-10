'use client';
import { useState, useEffect } from 'react';
import styles from '@/app/ui/dashboard/invoice/createInvoice.module.css';
const CreateInvoice = () => {

    const [charges, setCharges] = useState([{ description: '', amount: '' }]);
    

    const addRow = () => {
        setCharges([...charges, { description: '', amount: '' }]);
    };

    const removeRow = (index) => {
        setCharges(charges.filter((_, i) => i !== index));
    };

    const handleInputChange = (index, field, value) => {
        const updatedCharges = charges.map((charge, i) =>
            i === index ? { ...charge, [field]: value } : charge
        );
        setCharges(updatedCharges);
    };

    const [emails, setEmails] = useState(['']);

    const addEmailRow = () => {
        setEmails([...emails, '']);
    };

    const removeEmailRow = (index) => {
        setEmails(emails.filter((_, i) => i !== index));
    };

    const handleEmailChange = (index, value) => {
        const updatedEmails = emails.map((email, i) =>
            i === index ? value : email
        );
        setEmails(updatedEmails);
    };

    const [adminId, setAdminId] = useState(null);
     // Fungsi untuk mengambil admin_id dari token
    const fetchAdminId = async () => {
        try {
        const response = await fetch('/api/auth', {
            method: 'GET',
            credentials: 'include', // Sertakan cookies
        });
        const data = await response.json();
        if (response.ok) {
            setAdminId(data.admin_id); // Set admin_id dari response
        } else {
            console.error('Failed to fetch admin ID:', data.error);
        }
        } catch (error) {
        console.error('Error fetching admin ID:', error);
        }
    };

    // Ambil admin_id saat komponen dimuat
    useEffect(() => {
        fetchAdminId();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Mencegah refresh halaman
        const invoiceData = {
            invoice_date: document.getElementById('invoice_date').value,
            client_name: document.getElementById('client_name').value,
            client_address: document.getElementById('client_address').value,
            forwarding_vessel: document.getElementById('forwarding_vessel').value,
            port_of_discharge: document.getElementById('port_of_discharge').value,
            port_of_loading: document.getElementById('port_of_loading').value,
            bill_lading: document.getElementById('bill_lading').value,
            shipper: document.getElementById('shipper').value,
            consignee: document.getElementById('consignee').value,
            measurement: document.getElementById('measurement').value,
            cargo_description: document.getElementById('cargo_description').value,
            etd: document.getElementById('etd').value,
            eta: document.getElementById('eta').value,
            admin_id: adminId,
            is_approve: false,
            is_reject: false,
            charges,
            emails,
        };
    
        try {
            const response = await fetch('/api/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData),
            });
            const result = await response.json();
            if (response.ok) {
                alert('Invoice with number ' + result.invoice_number + ' created successfully. \n' + 'Contact super admin to approve');
                window.location.href = '/dashboard/invoice/list'; // Redirect ke halaman daftar invoice
            } else {
                alert('Failed to create invoice: ' + result.error);
            }
        } catch (error) {
            console.error('Error submitting invoice:', error);
            alert('An error occurred while creating the invoice.');
        }
    };
    
    

    return (
        <div className={styles.container}>
            <br/>
            <h3>Invoice Detail</h3>
            <br/>
            <div className={styles.gridContainer}>
                <div className={styles.gridItem}>
                    <label>Invoice Date</label>
                    <input className={styles.input} type="date" id="invoice_date" />

                    <label>Client Name</label>
                    <input className={styles.input} type="text" id="client_name" />

                    <label>Client Address</label>
                    <input className={styles.input} type="text" id="client_address" />

                    <label>Forwarding Vessel</label>
                    <input className={styles.input} type="text" id="forwarding_vessel" />

                    <label>Port of Discharge</label>
                    <input className={styles.input} type="text" id="port_of_discharge" />

                    <label>Port of Loading</label>
                    <input className={styles.input} type="text" id="port_of_loading" />

                    <label>Bill Lading</label>
                    <input className={styles.input} type="text" id="bill_lading" />
                </div>
                <div className={styles.gridItem}>
                    
                    <label>Shipper</label>
                    <input className={styles.input} type="text" id="shipper" />

                    <label>Consignee</label>
                    <input className={styles.input} type="text" id="consignee" />

                    <label>Measurement</label>
                    <input className={styles.input} type="text" id="measurement" />

                    <label>Cargo Description</label>
                    <input className={styles.input} type="text" id="cargo_description" />

                    <label>Estimate Time Departure</label>
                    <input className={styles.input} type="date" id="etd" />

                    <label>Estimate Time Arrival</label>
                    <input className={styles.input} type="date" id="eta" />
                </div>
            </div>
            <br/>
            <hr/>
            <br/>
            <h3>Charge Description</h3>
            <br/>
            <table className={styles.chargeTable}>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount (IDR)</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {charges.map((charge, index) => (
                        <tr key={index}>
                            <td>
                                <input
                                    className={styles.input}
                                    type="text"
                                    name={`description_${index}`}
                                    value={charge.description}
                                    onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                                    placeholder="Enter description"
                                    required
                                />
                            </td>
                            <td>
                                <input
                                    className={styles.input}
                                    type="number"
                                    name={`amount_${index}`}
                                    value={charge.amount}
                                    onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                                    placeholder="Enter amount"
                                    required
                                />
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className={styles.removeBtn}
                                    onClick={() => removeRow(index)}
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button type="button" className={styles.addBtn} onClick={addRow}>
                Add Row
            </button>
            <br/>
            <br/>
            <hr/>
            <br/>
            <h3>Access Email</h3>
            <br/>
            <table className={styles.emailTable}>
    <thead>
        <tr>
            <th>Email</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>
        {emails.map((email, index) => (
            <tr key={index}>
                <td>
                    <input
                        className={styles.input}
                        type="email"
                        name={`email_${index}`}
                        value={email}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        placeholder="Enter email"
                        required
                    />
                </td>
                <td>
                    <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeEmailRow(index)}
                    >
                        Remove
                    </button>
                </td>
            </tr>
        ))}
    </tbody>
</table>
<button type="button" className={styles.addBtn} onClick={addEmailRow}>
    Add Row
</button>
<br/><br/>
<button type="submit" className={styles.submitBtn} onClick={handleSubmit}>
    Submit Invoice
</button>


        </div>
    )
}

export default CreateInvoice