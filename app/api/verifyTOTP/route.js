import { verifyTOTP } from 'app/utils/totp';
import cache from 'app/lib/cache'; 

export async function POST(request) {
    try {
        const { otp, invoice_id, email } = await request.json();
        const secret = process.env.TOTP_SECRET;

        if (!secret || !otp || !invoice_id || !email) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const cacheKey = `attempts:${invoice_id}:${email}`;
        const attempts = cache.get(cacheKey) || 0;

        console.log(`OTP attempts for ${cacheKey}:`, attempts); 

        if (attempts >= 3) {
            return new Response(JSON.stringify({ error: 'Too many failed attempts. Try again later.' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Verifikasi OTP
        const isValid = verifyTOTP(secret, otp);

        if (!isValid) {
            cache.set(cacheKey, attempts + 1, { ttl: 1000 * 60 * 10 }); 
            console.log(`Failed OTP attempt ${attempts + 1} for ${cacheKey}`);
            return new Response(JSON.stringify({ isValid: false, error: 'Invalid OTP. Please try again.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        cache.delete(cacheKey);
        console.log(`OTP verified successfully for ${cacheKey}`);

        return new Response(JSON.stringify({ isValid: true }), {
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
