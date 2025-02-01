import { createConnection } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { generateTOTP } from '@/app/utils/totp';
import { sendEmail } from '@/app/lib/email';

export async function POST(request) {
    const { invoice_id, email } = await request.json();

    try {
        const db = await createConnection();

        // Query to fetch email and invoice_number
        const sql = `
            SELECT ai.email, i.invoice_number
            FROM access_invoice ai
            JOIN invoice i ON ai.invoice_id = i.invoice_id
            WHERE ai.invoice_id = ? AND ai.email = ?;
        `;
        const [results] = await db.query(sql, [invoice_id, email]);

        if (results.length > 0) {
            const { email, invoice_number } = results[0]; // Destructure email and invoice_number
            const secret = process.env.TOTP_SECRET; 
            const otp = generateTOTP(secret);

            // Send OTP to the user's email
            const subject = `OTP for Invoice Validation - Invoice Number ${invoice_number}`;
            const text = `Your OTP is: ${otp}. This code is valid for 1 minute.\n\nBest regards,\nCV. Mandiri Bersama`;
            await sendEmail(email, subject, text);

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Email is not registered for this invoice' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'An error occurred while verifying the email' }, { status: 500 });
    }
}