import { createConnection } from 'app/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get('invoice_id'); 
  try {
    const db = await createConnection();

    if (invoiceId) {
      // Jika ada invoice_id, ambil detail invoice berdasarkan invoice_id
      const invoiceSql = `
        SELECT 
          i.invoice_id,
          i.invoice_number,
          i.invoice_date,
          i.client_name,
          i.client_address,
          i.forwarding_vessel,
          i.port_of_discharge,
          i.port_of_loading,
          i.bill_lading,
          i.shipper,
          i.consignee,
          i.measurement,
          i.cargo_description,
          i.etd,
          i.eta,
          i.admin_id,
          i.qr_code
        FROM 
          invoice i
        WHERE 
          i.invoice_id = ?;
      `;
      const [invoiceData] = await db.query(invoiceSql, [invoiceId]);

      if (invoiceData.length === 0) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      // Ambil data charges dari tabel detail_invoice
      const chargesSql = `
        SELECT 
          description,
          amount
        FROM 
          detail_invoice
        WHERE 
          invoice_id = ?;
      `;
      const [chargesData] = await db.query(chargesSql, [invoiceId]);

      // Ambil data email dari tabel access_invoice
      const emailSql = `
        SELECT 
          email
        FROM 
          access_invoice
        WHERE 
          invoice_id = ?;
      `;
      const [emailData] = await db.query(emailSql, [invoiceId]);

      // Format data invoice, charges, dan emails
      const formattedInvoice = {
        invoice_id: invoiceData[0].invoice_id,
        invoice_number: invoiceData[0].invoice_number,
        invoice_date: invoiceData[0].invoice_date,
        client_name: invoiceData[0].client_name,
        client_address: invoiceData[0].client_address,
        forwarding_vessel: invoiceData[0].forwarding_vessel,
        port_of_discharge: invoiceData[0].port_of_discharge,
        port_of_loading: invoiceData[0].port_of_loading,
        bill_lading: invoiceData[0].bill_lading,
        shipper: invoiceData[0].shipper,
        consignee: invoiceData[0].consignee,
        measurement: invoiceData[0].measurement,
        cargo_description: invoiceData[0].cargo_description,
        etd: invoiceData[0].etd,
        eta: invoiceData[0].eta,
        qr_code: invoiceData[0].qr_code,
        admin_id: invoiceData[0].admin_id,
        access_email: emailData.map(row => ({ email: row.email })),  // Ambil semua email
        charges: chargesData.map(row => ({  // Ambil semua charges
          description: row.description,
          amount: row.amount,
        })),
      };

      return NextResponse.json(formattedInvoice);
    } else {
      const sql = `
        SELECT
          invoice.invoice_id, 
          invoice.invoice_number, 
          invoice.client_name, 
          SUM(detail_invoice.amount) AS total_amount
        FROM 
          invoice
        LEFT JOIN 
          detail_invoice ON invoice.invoice_id = detail_invoice.invoice_id
        WHERE
          invoice.is_deleted = FALSE
        GROUP BY 
          invoice.invoice_id, invoice.invoice_number, invoice.client_name;
      `;
      const [invoices] = await db.query(sql);

      return NextResponse.json(invoices);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}