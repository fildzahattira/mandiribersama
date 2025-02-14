import crypto from 'crypto';

// Fungsi HMAC-SHA1
function hmacSha1(key, message) {
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(message);
    return hmac.digest('hex'); // Hasil dalam format hex
}

// Fungsi Dynamic Truncation
function dynamicTruncation(hmacHash) {
    const offset = parseInt(hmacHash.slice(-1), 16); // Ambil byte terakhir sebagai offset
    const binary = parseInt(hmacHash.substr(offset * 2, 8), 16); // Ambil 4 byte mulai dari offset
    return binary & 0x7fffffff; // Ambil 31 bit terakhir
}

// Fungsi Generate TOTP (step diubah menjadi 60 detik)
export function generateTOTP(secret, step = 60, digits = 6) {
    const timestamp = Math.floor(Date.now() / 1000); // Waktu saat ini dalam detik
    let counter = Math.floor(timestamp / step); // Hitung counter (gunakan `let` agar bisa diubah)
    const message = Buffer.alloc(8); // Buffer untuk counter
    for (let i = 7; i >= 0; i--) {
        message[i] = counter & 0xff; // Isi buffer dengan counter
        counter >>= 8; // Operasi shift right (bisa dilakukan karena `counter` menggunakan `let`)
    }

    const hmacHash = hmacSha1(secret, message); // Hasilkan HMAC-SHA1
    const truncated = dynamicTruncation(hmacHash); // Dynamic truncation
    const otp = truncated % Math.pow(10, digits); // Ambil 6 digit terakhir

    return otp.toString().padStart(digits, '0'); // Format OTP menjadi 6 digit
}

// Fungsi Verifikasi TOTP (step diubah menjadi 60 detik)
export function verifyTOTP(secret, userOtp, step = 60, digits = 6) {
    const generatedOtp = generateTOTP(secret, step, digits);
    return generatedOtp === userOtp; // Bandingkan OTP yang dihasilkan dengan OTP pengguna
}