import { createConnection } from 'app/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt'; 

const SALT_ROUNDS = 10; 

// get user for list user
export async function GET() {
    try {
        const db = await createConnection();
        const sql = "SELECT admin_id, admin_name, admin_email, admin_role, is_active FROM admin";
        const [admin] = await db.query(sql);
        return NextResponse.json(admin);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message });
    }
}


// create new user
export async function POST(request) {
    try {
        const { admin_name, admin_email, admin_password, admin_role } = await request.json();
        console.log({ admin_name, admin_email, admin_password, admin_role });

        const db = await createConnection();

        const [nameCheck] = await db.query("SELECT admin_name FROM admin WHERE admin_name = ?", [admin_name]);
        if (nameCheck.length > 0) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        const [emailCheck] = await db.query("SELECT admin_email FROM admin WHERE admin_email = ?", [admin_email]);
        if (emailCheck.length > 0) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(admin_password, SALT_ROUNDS);

        const sql = "INSERT INTO admin (admin_name, admin_email, admin_password, admin_role, is_active) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.execute(sql, [admin_name, admin_email, hashedPassword, admin_role, true]);


        return NextResponse.json({ message: 'User added successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message });
    }
}

// update user active status
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