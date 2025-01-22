import { verifyTOTP } from 'app/utils/totp';

export async function POST(request) {
    try {
        const { otp } = await request.json(); // Hanya menerima `otp` dari frontend
        const secret = process.env.TOTP_SECRET; // Ambil `secret` dari environment variable

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