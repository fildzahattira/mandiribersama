import { createConnection } from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await createConnection();

    // Query untuk menghitung total invoice
    const [invoiceCount] = await db.query('SELECT COUNT(*) AS totalInvoices FROM invoice WHERE is_deleted = FALSE');

    // Query untuk menghitung total user
    const [userCount] = await db.query('SELECT COUNT(*) AS totalUsers FROM admin');

    return NextResponse.json({
      totalInvoices: invoiceCount[0].totalInvoices,
      totalUsers: userCount[0].totalUsers,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}