import { createConnection } from 'app/lib/db';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET;


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get('invoice_id'); // Mengambil invoice_id dari query parameter
  const action = searchParams.get('action'); // Parameter untuk membedakan aksi (view_active, view_archived)
  const token = request.cookies.get('token')?.value; // Ambil token dari cookies
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const db = await createConnection();

    // Verifikasi token untuk mendapatkan role dan admin_id
    const decoded = verify(token, JWT_SECRET);
    const adminId = decoded.id;
    const adminRole = decoded.role;

    if (invoiceId) {
      // Jika ada invoice_id, fetch detail invoice seperti sebelumnya
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

      // Fetch charges and emails as usual
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

      const emailSql = `
        SELECT 
          email
        FROM 
          access_invoice
        WHERE 
          invoice_id = ?;
      `;
      const [emailData] = await db.query(emailSql, [invoiceId]);

      // Format and return invoice data
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
        access_email: emailData.map(row => ({ email: row.email })),
        charges: chargesData.map(row => ({
          description: row.description,
          amount: row.amount,
        })),
      };

      return NextResponse.json(formattedInvoice);
    } else {
      // Jika tidak ada invoice_id, fetch invoices berdasarkan role admin
      let sql = `
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
          invoice.is_deleted = ? AND invoice.is_approve = ?
      `;

      let isDeleted = false; 
      let isApprove = true;

      if (action === 'is_deleted') {
        isDeleted = true && isApprove; 
      } else if (action === 'is_list') {
        isDeleted = false && isApprove; 
      } else if (action === 'is_approve') {
        isApprove = false;
      } else {
        // Default case: action not provided or invalid
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      // Tambahkan kondisi berdasarkan role admin
      if (adminRole === 'Admin') {
        sql += ` AND invoice.admin_id = ?`;
      }

      sql += ` GROUP BY invoice.invoice_id, invoice.invoice_number, invoice.client_name;`;

      // Eksekusi query dengan parameter yang sesuai
      const [invoices] = await db.query(sql, [isDeleted, isApprove, adminId]);

      return NextResponse.json(invoices);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(request) {
  let db;
  try {
      const {
          invoice_date, client_name, client_address, forwarding_vessel,
          port_of_discharge, port_of_loading, bill_lading, shipper,
          consignee, measurement, cargo_description, etd, eta, admin_id, is_approve,
          charges, emails
      } = await request.json();

      db = await createConnection();
      await db.beginTransaction(); // Start transaction

      // Generate UUID untuk invoice_id
      const invoiceId = uuidv4();

      // Generate invoice_number (opsional, bisa disesuaikan)
      const sqlCountInvoices = "SELECT COUNT(*) AS count FROM invoice";
      const [countResult] = await db.query(sqlCountInvoices);
      const count = countResult[0].count + 1; // Nomor urut invoice dimulai dari 1
      const paddedCount = String(count).padStart(3, '0');
      const clientInitials = client_name
          .split(' ')
          .map(word => word[0].toUpperCase())
          .join('');
      const formattedDate = invoice_date.replace(/-/g, '');
      const invoiceNumber = `${paddedCount}/${clientInitials}/${formattedDate}`;

      // Insert invoice dengan UUID
      const sqlInvoice = `
          INSERT INTO invoice 
          (invoice_id, invoice_number, invoice_date, client_name, client_address, forwarding_vessel, 
          port_of_discharge, port_of_loading, bill_lading, shipper, consignee, 
          measurement, cargo_description, etd, eta, admin_id, is_approve) 
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      const [result] = await db.execute(sqlInvoice, [
          invoiceId, invoiceNumber, invoice_date, client_name, client_address, forwarding_vessel,
          port_of_discharge, port_of_loading, bill_lading, shipper, consignee,
          measurement, cargo_description, etd, eta, admin_id, is_approve
      ]);

      // Insert charges dengan UUID
      if (charges && charges.length > 0) {
          const sqlCharges = "INSERT INTO detail_invoice (invoice_id, description, amount) VALUES ?";
          const chargeValues = charges.map(charge => [invoiceId, charge.description, charge.amount]);
          await db.query(sqlCharges, [chargeValues]);
      }

      // Insert emails dengan UUID
      if (emails && emails.length > 0) {
          const sqlEmails = "INSERT INTO access_invoice (invoice_id, email) VALUES ?";
          const emailValues = emails.map(email => [invoiceId, email]);
          await db.query(sqlEmails, [emailValues]);
      }

      // Generate QR code URL
      const qrUrl = `http://localhost:3000/client/verifyEmail?invoice_id=${invoiceId}`;

      // Save QR code URL to database
      const sqlUpdateQR = "UPDATE invoice SET qr_code = ? WHERE invoice_id = ?";
      await db.query(sqlUpdateQR, [qrUrl, invoiceId]);

      await db.commit(); // Commit transaction

      return NextResponse.json({ 
          message: 'Invoice added successfully', 
          id: invoiceId, 
          invoice_number: invoiceNumber, 
          qr_code: qrUrl 
      });
  } catch (error) {
      console.log(error);
      if (db && db.rollback) await db.rollback(); // Rollback transaction in case of error
      return NextResponse.json({ error: error.message });
  }
}
export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get('invoice_id'); // Mengambil invoice_id dari parameter URL
  const action = searchParams.get('action'); // Parameter untuk membedakan aksi (soft delete, add_email, atau delete_email)

  try {
    const db = await createConnection();

    if (action === 'soft_delete') {
      // Logika untuk soft delete
      const sql = 'UPDATE invoice SET is_deleted = TRUE WHERE invoice_id = ?';
      const [result] = await db.query(sql, [invoiceId]);

      if (result.affectedRows > 0) {
        return NextResponse.json({ message: 'Invoice soft deleted successfully' });
      } else {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
    } else if (action === 'restore') {
      // Logika untuk restore invoice
      const sql = 'UPDATE invoice SET is_deleted = FALSE WHERE invoice_id = ?';
      const [result] = await db.query(sql, [invoiceId]);

      if (result.affectedRows > 0) {
        return NextResponse.json({ message: 'Invoice restored successfully' });
      } else {
        return NextResponse.json({ error: 'Invoice not found or already active' }, { status: 404 });
      }
    } else if (action === 'approve') {
      // Logika untuk restore invoice
      const sql = 'UPDATE invoice SET is_approve = TRUE WHERE invoice_id = ?';
      const [result] = await db.query(sql, [invoiceId]);

      if (result.affectedRows > 0) {
        return NextResponse.json({ message: 'Invoice approved successfully' });
      } else {
        return NextResponse.json({ error: 'Invoice not found or already approve' }, { status: 404 });
      }
    } else if (action === 'add_email') {
      // Logika untuk menambahkan email baru
      const { email } = await request.json(); // Ambil email baru dari body request

      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      // Cek apakah invoice dengan invoice_id tersebut ada
      const sqlCheckInvoice = 'SELECT invoice_id FROM invoice WHERE invoice_id = ?';
      const [invoiceResult] = await db.query(sqlCheckInvoice, [invoiceId]);

      if (invoiceResult.length === 0) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      // Cek apakah email baru sudah ada untuk invoice_id tersebut
      const sqlCheckEmail = 'SELECT email FROM access_invoice WHERE invoice_id = ? AND email = ?';
      const [emailResult] = await db.query(sqlCheckEmail, [invoiceId, email]);

      if (emailResult.length > 0) {
        return NextResponse.json({ error: 'Email already exists for this invoice' }, { status: 400 });
      }

      // Insert email baru ke tabel access_invoice
      const sqlInsertEmail = 'INSERT INTO access_invoice (invoice_id, email) VALUES (?, ?)';
      await db.query(sqlInsertEmail, [invoiceId, email]);

      return NextResponse.json({ message: 'Email added successfully' });
    } else if (action === 'delete_email') {
      // Logika untuk menghapus email
      const { email } = await request.json(); // Ambil email yang akan dihapus dari body request

      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      // Cek apakah invoice dengan invoice_id tersebut ada
      const sqlCheckInvoice = 'SELECT invoice_id FROM invoice WHERE invoice_id = ?';
      const [invoiceResult] = await db.query(sqlCheckInvoice, [invoiceId]);

      if (invoiceResult.length === 0) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      // Hapus email dari tabel access_invoice
      const sqlDeleteEmail = 'DELETE FROM access_invoice WHERE invoice_id = ? AND email = ?';
      const [deleteResult] = await db.query(sqlDeleteEmail, [invoiceId, email]);

      if (deleteResult.affectedRows > 0) {
        return NextResponse.json({ message: 'Email deleted successfully' });
      } else {
        return NextResponse.json({ error: 'Email not found' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}