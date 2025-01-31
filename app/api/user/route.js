import { createConnection } from 'app/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt'; 

const SALT_ROUNDS = 10; 

export async function GET() {
    try {
        const db = await createConnection();
        const sql = "SELECT admin_id, admin_name, admin_email, is_active FROM admin";
        const [admin] = await db.query(sql);
        return NextResponse.json(admin);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message });
    }
}

export async function POST(request) {
    try {
        const { admin_name, admin_email, admin_password, admin_role } = await request.json();

        // Hash password sebelum disimpan
        const hashedPassword = await bcrypt.hash(admin_password, SALT_ROUNDS);

        const db = await createConnection();
        const sql = "INSERT INTO admin (admin_name, admin_email, admin_password, admin_role, is_active) VALUES (?, ?, ?, ?)";
        const [result] = await db.execute(sql, [admin_name, admin_email, hashedPassword, admin_role, true]); 

        return NextResponse.json({ message: 'User added successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message });
    }
}

export async function PUT(request) {
    try {
      const { admin_id, is_active } = await request.json();
  
      const db = await createConnection();
      const sql = "UPDATE admin SET is_active = ? WHERE admin_id = ?";
      await db.execute(sql, [is_active, admin_id]);
  
      return NextResponse.json({ message: "User status updated successfully" });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }