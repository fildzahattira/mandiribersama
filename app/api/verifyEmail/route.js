import { createConnection } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { generateTOTP } from '@/app/utils/totp';
import { sendEmail } from '@/app/lib/email';

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
            const secret = process.env.TOTP_SECRET; 
            const otp = generateTOTP(secret);

            // Kirim OTP ke email pengguna
            const subject = 'Kode OTP Anda';
            const text = `Kode OTP Anda adalah: ${otp}. Kode ini berlaku selama 1 menit.`;
            await sendEmail(email, subject, text);

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Email tidak terdaftar untuk invoice ini' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Terjadi kesalahan saat memverifikasi email' }, { status: 500 });
    }
}