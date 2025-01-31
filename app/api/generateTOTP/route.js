import { generateTOTP } from 'app/utils/totp';

export async function POST(request) {
    const { secret } = await request.json();

    if (!secret) {
        return new Response(JSON.stringify({ error: 'Secret key is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Generate OTP
    const otp = generateTOTP(secret);

    return new Response(JSON.stringify({ otp }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}