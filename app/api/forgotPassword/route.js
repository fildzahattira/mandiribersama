import { createConnection } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/app/utils/email';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

export async function POST(request) {
  try {
    const { admin_email, token, new_password } = await request.json();
    const db = await createConnection();

    if (admin_email && !token && !new_password) {
      const [admin] = await db.query("SELECT admin_id FROM admin WHERE admin_email = ?", [admin_email]);

      if (admin.length === 0) {
        return NextResponse.json({ error: 'Admin with this email does not exist' }, { status: 404 });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000); 

      await db.execute("UPDATE admin SET reset_token = ?, token_expiry = ? WHERE admin_email = ?", 
        [resetToken, expiryTime, admin_email]);

      const resetLink = `http://localhost:3000/forgotPassword?token=${resetToken}`;
      const emailSubject = "Reset Your Password - CV. Mandiri Bersama Admin Login";
      const emailBody = `Click the link below to reset your password (valid for 10 minutes): \n${resetLink} \n \n If you did not request this, please ignore this email. Your account remains secure.`;

      await sendEmail(admin_email, emailSubject, emailBody);

      return NextResponse.json({ message: 'Reset password link has been sent to your email' });

    } else if (token && new_password) {
      const [admin] = await db.query("SELECT admin_email, token_expiry FROM admin WHERE reset_token = ?", [token]);

      if (admin.length === 0) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
      }

      const { admin_email, token_expiry } = admin[0];

      if (new Date(token_expiry) < new Date()) {
        return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);

      await db.execute("UPDATE admin SET admin_password = ?, reset_token = NULL, token_expiry = NULL WHERE admin_email = ?", 
        [hashedPassword, admin_email]);

      return NextResponse.json({ message: 'Password has been reset successfully' });

    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred. Please try again later.' }, { status: 500 });
  }
}
