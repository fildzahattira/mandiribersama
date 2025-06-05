import { createConnection } from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin_id = searchParams.get('admin_id');
    const db = await createConnection();

    //super admin
    const [totalInvoices] = await db.query('SELECT COUNT(*) AS total FROM invoice WHERE is_approve = TRUE');
    const [activeInvoices] = await db.query('SELECT COUNT(*) AS active FROM invoice WHERE is_deleted = FALSE AND is_approve = TRUE');
    const [deletedInvoices] = await db.query('SELECT COUNT(*) AS deleted FROM invoice WHERE is_deleted = TRUE AND is_approve = TRUE');
    const [totalUsers] = await db.query('SELECT COUNT(*) AS totalUsers FROM admin');
    const [activeAdmins] = await db.query('SELECT COUNT(*) AS activeAdmins FROM admin WHERE is_active = TRUE');
    const [inactiveAdmins] = await db.query('SELECT COUNT(*) AS inactiveAdmins FROM admin WHERE is_active = FALSE');
    const [needApproveInvoices] = await db.query('SELECT COUNT(*) AS needApprove FROM invoice WHERE is_deleted = FALSE AND is_approve = FALSE');
    
  
    const [monthlyInvoices] = await db.query(`
      SELECT 
        DATE_FORMAT(invoice_date, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM invoice
      GROUP BY month
      ORDER BY month ASC
    `);

    //admin
    const [totalInvoicesByRoleAdmin] = await db.query(
      'SELECT COUNT(*) AS total FROM invoice WHERE is_approve = TRUE AND admin_id = ?',
      [admin_id]
    );
    const [activeInvoicesByRoleAdmin] = await db.query(
      'SELECT COUNT(*) AS active FROM invoice WHERE is_deleted = FALSE AND is_approve = TRUE AND admin_id = ?',
      [admin_id]
    );
    const [deletedInvoicesByRoleAdmin] = await db.query(
      'SELECT COUNT(*) AS deleted FROM invoice WHERE is_deleted = TRUE AND is_approve = TRUE AND admin_id = ?',
      [admin_id]
    );
    const [needApproveInvoicesByRoleAdmin] = await db.query(
      'SELECT COUNT(*) AS needApprove FROM invoice WHERE is_deleted = FALSE AND is_approve = FALSE AND admin_id = ?',
      [admin_id]
    );

    return NextResponse.json({
      totalInvoices: totalInvoices[0].total,
      activeInvoices: activeInvoices[0].active,
      deletedInvoices: deletedInvoices[0].deleted,
      totalUsers: totalUsers[0].totalUsers,
      activeAdmins: activeAdmins[0].activeAdmins,
      inactiveAdmins: inactiveAdmins[0].inactiveAdmins,
      needApproveInvoices: needApproveInvoices[0].needApprove,
      monthlyInvoices,
      totalInvoicesByRoleAdmin: totalInvoicesByRoleAdmin[0].total,
      activeInvoicesByRoleAdmin: activeInvoicesByRoleAdmin[0].active,
      deletedInvoicesByRoleAdmin: deletedInvoicesByRoleAdmin[0].deleted,
      needApproveInvoicesByRoleAdmin: needApproveInvoicesByRoleAdmin[0].needApprove,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}