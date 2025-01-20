// app/api/verifyOtp/route.js
import { verifyTOTP } from 'app/utils/totp'; // Pastikan path impor benar

export async function POST(request) {
    try {
        const { secret, otp } = await request.json();

        // Validasi input
        if (!secret || !otp) {
            return new Response(JSON.stringify({ error: 'Secret key and OTP are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Verifikasi OTP
        const isValid = verifyTOTP(secret, otp);

        // Berikan respons
        return new Response(JSON.stringify({ isValid }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}