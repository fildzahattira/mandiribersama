import { createConnection } from 'app/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const db = await createConnection()
        const sql = "SELECT admin_name,admin_email FROM admin"
        const [admin] = await db.query(sql)
        return NextResponse.json(admin)
    } catch(error) {
        console.log(error)
        return NextResponse.json({error: error.message})
    }
}

export async function POST(request) {
    try {
        const { admin_name, admin_email, admin_password } = await request.json();
        const db = await createConnection();
        const sql = "INSERT INTO admin (admin_name, admin_email, admin_password) VALUES (?, ?, ?)";
        const [result] = await db.execute(sql, [admin_name, admin_email, admin_password]);
        return NextResponse.json({ message: 'User added successfully', id: result.insertId });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error.message });
    }
}