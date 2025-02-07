import crypto from 'crypto';

// Fungsi HMAC-SHA1
function hmacSha1(key, message) {
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(message);
    return hmac.digest('hex'); 
}

// Fungsi Dynamic Truncation
function dynamicTruncation(hmacHash) {
    const offset = parseInt(hmacHash.slice(-1), 16); 
    const binary = parseInt(hmacHash.substr(offset * 2, 8), 16);
    return binary & 0x7fffffff; 
}

// Fungsi Generate TOTP 
export function generateTOTP(secret, step = 60, digits = 6, offset = 0) {
    const timestamp = Math.floor(Date.now() / 1000); // Waktu saat ini dalam detik
    let counter = Math.floor(timestamp / step) + offset; // Hitung counter
    const message = Buffer.alloc(8); 
    for (let i = 7; i >= 0; i--) {
        message[i] = counter & 0xff; 
        counter >>= 8; 
    }

    const hmacHash = hmacSha1(secret, message); // HMAC-SHA1
    const truncated = dynamicTruncation(hmacHash); // Dynamic truncation
    const otp = truncated % Math.pow(10, digits); // Ambil 6 digit terakhir

    return otp.toString().padStart(digits, '0'); // Format OTP menjadi 6 digit
}

// Fungsi Verifikasi TOTP 
// export function verifyTOTP(secret, userOtp, step = 60, digits = 6) {
//     const generatedOtp = generateTOTP(secret, step, digits);
//     return generatedOtp === userOtp; 
// }

export function verifyTOTP(secret, userOtp, step = 60, digits = 6) {
    const currentOtp = generateTOTP(secret, step, digits, 0);
    const previousOtp = generateTOTP(secret, step, digits, -1); // Grace period

    return userOtp === currentOtp || userOtp === previousOtp;
}
