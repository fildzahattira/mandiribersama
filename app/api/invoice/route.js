import { createConnection } from 'app/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams, pathname } = new URL(request.url);
    let invoiceId = searchParams.get('invoice_id'); // Mengambil invoice_id dari query parameter

    if (!invoiceId) {
        // Jika tidak ada query parameter, ambil invoice_id dari path URL
        const pathSegments = pathname.split('/').filter(Boolean); // Memisahkan segmen path
        const idFromPath = pathSegments[pathSegments.length - 1]; // Segmen terakhir sebagai invoice_id
        invoiceId = /^\d+$/.test(idFromPath) ? idFromPath : null; // Validasi apakah idFromPath adalah angka
    }

    try {
        const db = await createConnection();

        if (invoiceId) {
            // Jika ada invoice_id, ambil detail invoice berdasarkan invoice_id
                    // 1. Ambil data invoice
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

            // 2. Ambil data charges dari tabel detail_invoice
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

            // 3. Ambil data email dari tabel access_invoice
            const emailSql = `
            SELECT 
                email
            FROM 
                access_invoice
            WHERE 
                invoice_id = ?;
            `;
            const [emailData] = await db.query(emailSql, [invoiceId]);

            // 4. Format data invoice, charges, dan emails
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
            // Jika tidak ada invoice_id, ambil semua invoice
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


// export async function GET(request) {
//     const { searchParams } = new URL(request.url);
//     const invoiceId = searchParams.get('invoice_id'); // Mengambil invoice_id dari parameter URL

//     try {
//         const db = await createConnection();

//         if (invoiceId) {
//             // Jika ada invoice_id, ambil detail invoice berdasarkan invoice_id
//             const sql = `
//             SELECT 
//                 i.invoice_id,
//                 i.invoice_number,
//                 i.invoice_date,
//                 i.client_name,
//                 i.client_address,
//                 i.forwarding_vessel,
//                 i.port_of_discharge,
//                 i.port_of_loading,
//                 i.bill_lading,
//                 i.shipper,
//                 i.consignee,
//                 i.measurement,
//                 i.cargo_description,
//                 i.etd,
//                 i.eta,
//                 i.admin_id,
//                 d.description AS charge_description,
//                 d.amount
//             FROM 
//                 invoice i
//             LEFT JOIN 
//                 detail_invoice d ON i.invoice_id = d.invoice_id
//             WHERE 
//                 i.invoice_id = ?;
//             `;
//             const [invoiceData] = await db.query(sql, [invoiceId]);

//             if (invoiceData.length === 0) {
//             return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
//             }

//             // Format data invoice dan charges
//             const formattedInvoice = {
//             invoice_id: invoiceData[0].invoice_id,
//             invoice_number: invoiceData[0].invoice_number,
//             invoice_date: invoiceData[0].invoice_date,
//             client_name: invoiceData[0].client_name,
//             client_address: invoiceData[0].client_address,
//             forwarding_vessel: invoiceData[0].forwarding_vessel,
//             port_of_discharge: invoiceData[0].port_of_discharge,
//             port_of_loading: invoiceData[0].port_of_loading,
//             bill_lading: invoiceData[0].bill_lading,
//             shipper: invoiceData[0].shipper,
//             consignee: invoiceData[0].consignee,
//             measurement: invoiceData[0].measurement,
//             cargo_description: invoiceData[0].cargo_description,
//             etd: invoiceData[0].etd,
//             eta: invoiceData[0].eta,
//             admin_id: invoiceData[0].admin_id,
//             charges: invoiceData.map((row) => ({
//                 description: row.charge_description,
//                 amount: row.amount,
//             })),
//             };

//             return NextResponse.json(formattedInvoice);
//         } else {
//             // Jika tidak ada invoice_id, ambil semua invoice
//             const sql = `
//                 SELECT
//                     invoice.invoice_id, 
//                     invoice.invoice_number, 
//                     invoice.client_name, 
//                     SUM(detail_invoice.amount) AS total_amount
//                 FROM 
//                     invoice
//                 LEFT JOIN 
//                     detail_invoice ON invoice.invoice_id = detail_invoice.invoice_id
//                 WHERE
//                     invoice.is_deleted = FALSE
//                 GROUP BY 
//                     invoice.invoice_id, invoice.invoice_number, invoice.client_name;
//             `;
//             const [invoices] = await db.query(sql);

//             return NextResponse.json(invoices);
//         }
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

// export async function POST(request) {
//     let db;
//     try {
//         const {
//             invoice_date, client_name, client_address, forwarding_vessel,
//             port_of_discharge, port_of_loading, bill_lading, shipper,
//             consignee, measurement, cargo_description, etd, eta, admin_id,
//             charges, emails
//         } = await request.json();

//         db = await createConnection();
//         await db.beginTransaction(); // Start transaction

//         // Generate invoice_number
//         const sqlCountInvoices = "SELECT COUNT(*) AS count FROM invoice";
//         const [countResult] = await db.query(sqlCountInvoices);
//         const count = countResult[0].count + 1; // Nomor urut invoice dimulai dari 1

//         // Tambahkan padding nol untuk memastikan format 3 digit
//         const paddedCount = String(count).padStart(3, '0');

//         const clientInitials = client_name
//             .split(' ')
//             .map(word => word[0].toUpperCase())
//             .join(''); // Singkatan dari nama client
//         const formattedDate = invoice_date.replace(/-/g, ''); // Format tanggal jadi YYYYMMDD
//         const invoiceNumber = `${paddedCount}/${clientInitials}/${formattedDate}`;

//         // Insert invoice
//         const sqlInvoice = `
//             INSERT INTO invoice 
//             (invoice_number, invoice_date, client_name, client_address, forwarding_vessel, 
//             port_of_discharge, port_of_loading, bill_lading, shipper, consignee, 
//             measurement, cargo_description, etd, eta, admin_id) 
//             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//         const [result] = await db.execute(sqlInvoice, [
//             invoiceNumber, invoice_date, client_name, client_address, forwarding_vessel,
//             port_of_discharge, port_of_loading, bill_lading, shipper, consignee,
//             measurement, cargo_description, etd, eta, admin_id
//         ]);

//         const invoiceId = result.insertId; // Get the inserted invoice ID

//         // Insert charges
//         if (charges && charges.length > 0) {
//             const sqlCharges = "INSERT INTO detail_invoice (invoice_id, description, amount) VALUES ?";
//             const chargeValues = charges.map(charge => [invoiceId, charge.description, charge.amount]);
//             await db.query(sqlCharges, [chargeValues]);
//         }

//         // Insert emails
//         if (emails && emails.length > 0) {
//             const sqlEmails = "INSERT INTO access_invoice (invoice_id, email) VALUES ?";
//             const emailValues = emails.map(email => [invoiceId, email]);
//             await db.query(sqlEmails, [emailValues]);
//         }

//         await db.commit(); // Commit transaction

//         return NextResponse.json({ message: 'Invoice added successfully', id: invoiceId, invoice_number: invoiceNumber });
//     } catch (error) {
//         console.log(error);
//         if (db && db.rollback) await db.rollback(); // Rollback transaction in case of error
//         return NextResponse.json({ error: error.message });
//     }
// }

export async function POST(request) {
    let db;
    try {
        const {
            invoice_date, client_name, client_address, forwarding_vessel,
            port_of_discharge, port_of_loading, bill_lading, shipper,
            consignee, measurement, cargo_description, etd, eta, admin_id,
            charges, emails
        } = await request.json();

        db = await createConnection();
        await db.beginTransaction(); // Start transaction

        // Generate invoice_number
        const sqlCountInvoices = "SELECT COUNT(*) AS count FROM invoice";
        const [countResult] = await db.query(sqlCountInvoices);
        const count = countResult[0].count + 1; // Nomor urut invoice dimulai dari 1

        // Tambahkan padding nol untuk memastikan format 3 digit
        const paddedCount = String(count).padStart(3, '0');

        const clientInitials = client_name
            .split(' ')
            .map(word => word[0].toUpperCase())
            .join(''); // Singkatan dari nama client
        const formattedDate = invoice_date.replace(/-/g, ''); // Format tanggal jadi YYYYMMDD
        const invoiceNumber = `${paddedCount}/${clientInitials}/${formattedDate}`;

        // Insert invoice
        const sqlInvoice = `
            INSERT INTO invoice 
            (invoice_number, invoice_date, client_name, client_address, forwarding_vessel, 
            port_of_discharge, port_of_loading, bill_lading, shipper, consignee, 
            measurement, cargo_description, etd, eta, admin_id) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        const [result] = await db.execute(sqlInvoice, [
            invoiceNumber, invoice_date, client_name, client_address, forwarding_vessel,
            port_of_discharge, port_of_loading, bill_lading, shipper, consignee,
            measurement, cargo_description, etd, eta, admin_id
        ]);

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

        // // Generate QR code URL
        // const qrUrl = `http://localhost:3000/api/invoice?invoice_id=${invoiceId}`; // URL detail invoice

        // // Save QR code URL to database
        // const sqlUpdateQR = "UPDATE invoice SET qr_code = ? WHERE invoice_id = ?";
        // await db.query(sqlUpdateQR, [qrUrl, invoiceId]);

            // Generate QR code URL
            const qrUrl = `http://localhost:3000/client/verifyEmail?invoice_id=${invoiceId}`; // Arahkan ke halaman verifikasi email

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

    try {
        const db = await createConnection();

        const sql = 'UPDATE invoice SET is_deleted = TRUE WHERE invoice_id = ?';
        const [result] = await db.query(sql, [invoiceId]);

        if (result.affectedRows > 0) {
            return NextResponse.json({ message: 'Invoice soft deleted successfully' });
        } else {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

