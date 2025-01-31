'use client';
import { useState } from 'react';
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
            admin_id: 1,
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
                alert('Invoice with number ' + result.invoice_number + ' created successfully');
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
            <table>
                <tbody>
                    <tr>
                        <td>
                            <label>Invoice Date</label>
                        </td>
                        <td>
                            <input type="date" id="invoice_date" name="invoice_date" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Client Name</label>
                        </td>
                        <td>
                            <input type="text" id="client_name" name="client_name" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Client Address</label>
                        </td>
                        <td>
                            <input type="text" id="client_address" name="client_address" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Forwarding Vessel</label>
                        </td>
                        <td>
                            <input type="text" id="forwarding_vessel" name="forwarding_vessel" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Port of Discharge</label>
                        </td>
                        <td>
                            <input type="text" id="port_of_discharge" name="port_of_discharge" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Port of Loading</label>
                        </td>
                        <td>
                            <input type="text" id="port_of_loading" name="port_of_loading" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Bill Lading</label>
                        </td>
                        <td>
                            <input type="text" id="bill_lading" name="bill_lading" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Shipper</label>
                        </td>
                        <td>
                            <input type="text" id="shipper" name="shipper" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Consignee</label>
                        </td>
                        <td>
                            <input type="text" id="consignee" name="consignee" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Measurement</label>
                        </td>
                        <td>
                            <input type="text" id="measurement" name="measurement" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Cargo Description</label>
                        </td>
                        <td>
                            <input type="text" id="cargo_description" name="cargo_description" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Estimate Time Departure</label>
                        </td>
                        <td>
                            <input type="date" id="etd" name="etd" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Estimate Time Arrival</label>
                        </td>
                        <td>
                            <input type="date" id="eta" name="eta" />
                        </td>
                    </tr>
                    {/* <tr>
                        <td>
                            <label>Admin id</label>
                        </td>
                        <td>
                            <input type="text" id="admin_id" name="admin_id" />
                        </td>
                    </tr> */}
                </tbody>
            </table>
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
    Add Email
</button>
<br/><br/>
<button type="submit" className={styles.submitBtn} onClick={handleSubmit}>
    Submit Invoice
</button>


        </div>
    )
}

export default CreateInvoice