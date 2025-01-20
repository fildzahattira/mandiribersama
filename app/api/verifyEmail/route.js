// app/api/verifyEmail/route.js
import { createConnection } from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { invoice_id, email } = await request.json();

    try {
        const db = await createConnection();

        // Cek apakah email terdaftar untuk invoice_id tersebut
        const sql = `
            SELECT email 
            FROM access_invoice 
            WHERE invoice_id = ? AND email = ?;
        `;
        const [results] = await db.query(sql, [invoice_id, email]);

        if (results.length > 0) {
            // Jika email valid, kembalikan success dan invoice_id
            return NextResponse.json({ success: true, invoice_id });
        } else {
            // Jika email tidak valid, kembalikan error
            return NextResponse.json({ success: false, error: 'Email tidak terdaftar untuk invoice ini' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Terjadi kesalahan saat memverifikasi email' }, { status: 500 });
    }
}