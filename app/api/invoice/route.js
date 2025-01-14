import { createConnection } from 'app/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
      const db = await createConnection(); 
      const sql = `
        SELECT 
            invoice.invoice_number, 
            invoice.client_name, 
            SUM(detail_invoice.amount) AS total_amount
        FROM 
            invoice
        LEFT JOIN 
            detail_invoice ON invoice.invoice_id = detail_invoice.invoice_id
        GROUP BY 
            invoice.invoice_id, invoice.invoice_number, invoice.client_name;
      `;
      const [invoices] = await db.query(sql); 
  
      return NextResponse.json(invoices); 
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }); 
    }
  }

export async function POST(request) {
    try {
        const {
            invoice_date, client_name, client_address, forwarding_vessel,
            port_of_discharge, port_of_loading, bill_lading, shipper,
            consignee, measurement, cargo_description, etd, eta, admin_id,
            charges, emails
        } = await request.json();

        const db = await createConnection();
        await db.beginTransaction(); // Start transaction

        // Insert invoice
        const sqlInvoice = "INSERT INTO invoice (invoice_date, client_name, client_address, forwarding_vessel, port_of_discharge, port_of_loading, bill_lading, shipper, consignee, measurement, cargo_description, etd, eta, admin_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        const [result] = await db.execute(sqlInvoice, [invoice_date, client_name, client_address, forwarding_vessel, port_of_discharge, port_of_loading, bill_lading, shipper, consignee, measurement, cargo_description, etd, eta, admin_id]);

        const invoiceId = result.insertId; // Get the inserted invoice ID

        // Insert charges
        if (charges && charges.length > 0) {
            const sqlCharges = "INSERT INTO detail_invoice (invoice_id, description, amount) VALUES ?";
            const chargeValues = charges.map(charge => [invoiceId, charge.description, charge.amount]);
            await db.query(sqlCharges, [chargeValues]);
        }

        // Insert emails
        if (emails && emails.length > 0) {
            const sqlEmails = "INSERT INTO access_invoice (invoice_id, email) VALUES ?";
            const emailValues = emails.map(email => [invoiceId, email]);
            await db.query(sqlEmails, [emailValues]);
        }

        await db.commit(); // Commit transaction

        return NextResponse.json({ message: 'Invoice added successfully', id: invoiceId });
    }
    catch (error) {
        console.log(error);
        if (db && db.rollback) await db.rollback(); // Rollback transaction in case of error
        return NextResponse.json({ error: error.message });
    }
}

