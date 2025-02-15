import { createConnection } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { generateTOTP } from '@/app/utils/totp';
import { sendEmail } from '@/app/utils/email';

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
            const text = `Dear Client,\nThank you for using CV. Mandiri Bersama's secure invoice validation system.\n\nYour OTP Code: ${otp}\n\nPlease note that this code is valid for only 1 minute.\n\nIf you did not request this OTP or encounter any issues, please contact our support team immediately.\n\nFor your security, do not share this code with anyone.\n\nThank you,\nCV. Mandiri Bersama\nCustomer Support +6231-73690229
            `;

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