import nodemailer from 'nodemailer';

// Konfigurasi transporter (gunakan SMTP atau layanan email lainnya)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Contoh: Gmail
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

// Fungsi untuk mengirim email
export async function sendEmail(to, subject, text) {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Email pengirim
        to, // Email penerima
        subject, // Subjek email
        text, // Isi email (plain text)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}