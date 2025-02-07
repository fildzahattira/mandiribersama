import { createConnection } from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await createConnection();

    // Query untuk menghitung total invoice
    const [totalInvoices] = await db.query('SELECT COUNT(*) AS total FROM invoice WHERE is_approve = TRUE');

    // Query untuk menghitung invoice aktif (is_deleted = FALSE)
    const [activeInvoices] = await db.query('SELECT COUNT(*) AS active FROM invoice WHERE is_deleted = FALSE AND is_approve = TRUE');

    // Query untuk menghitung invoice yang dihapus (is_deleted = TRUE)
    const [deletedInvoices] = await db.query('SELECT COUNT(*) AS deleted FROM invoice WHERE is_deleted = TRUE AND is_approve = TRUE');

    // Query untuk menghitung total user
    const [totalUsers] = await db.query('SELECT COUNT(*) AS totalUsers FROM admin');

    // Query untuk menghitung admin yang aktif (is_active = TRUE)
    const [activeAdmins] = await db.query('SELECT COUNT(*) AS activeAdmins FROM admin WHERE is_active = TRUE');

    // Query untuk menghitung admin yang tidak aktif (is_active = FALSE)
    const [inactiveAdmins] = await db.query('SELECT COUNT(*) AS inactiveAdmins FROM admin WHERE is_active = FALSE');

    const [monthlyInvoices] = await db.query(`
      SELECT 
        DATE_FORMAT(invoice_date, '%Y-%m') AS month, 
        COUNT(*) AS count 
      FROM invoice 
      GROUP BY month 
      ORDER BY month ASC
    `);


    return NextResponse.json({
      totalInvoices: totalInvoices[0].total, // Total semua invoice
      activeInvoices: activeInvoices[0].active, // Invoice aktif
      deletedInvoices: deletedInvoices[0].deleted, // Invoice yang dihapus
      totalUsers: totalUsers[0].totalUsers, // Total admin
      activeAdmins: activeAdmins[0].activeAdmins, // Admin aktif
      inactiveAdmins: inactiveAdmins[0].inactiveAdmins, // Admin tidak aktif
      monthlyInvoices,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
