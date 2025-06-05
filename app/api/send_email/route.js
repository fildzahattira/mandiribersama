import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export async function POST(request) {
  try {
    const { to, subject, text, attachments } = await request.json();

    // Konfigurasi email
    const mailOptions = {
      from: process.env.EMAIL_USER, // Email pengirim
      to, // Email penerima
      subject, // Subjek email
      text, // Isi email (plain text)
      attachments, // Lampiran (jika ada)
    };

    await transporter.sendMail(mailOptions);

    // Response sukses
    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to send email' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}