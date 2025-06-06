import { createConnection } from "app/lib/db";
import { sign, verify } from "jsonwebtoken";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET; 
const SALT_ROUNDS = 10;

//login
export async function POST(req) {
 const { username, password } = await req.json();
  
 try {
  const connection = await createConnection();
  const [rows] = await connection.query("SELECT * FROM admin WHERE admin_name = ?",[username]);
  
  if (rows.length === 0) {
    return new NextResponse(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
  }
  
  const admin = rows[0];

  if (admin.is_active === 0) {
    return new NextResponse(
      JSON.stringify({ error: "Account is inactive. Please contact the super admin." }),
      { status: 403 }
    );
  }

  
      const passwordMatch = await bcrypt.compare(password, admin.admin_password);
  
  if (!passwordMatch) {
   return new NextResponse(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
   }
  
  const token = sign({ id: admin.admin_id, name: admin.admin_name, role: admin.admin_role }, JWT_SECRET, { expiresIn: "2h" });
  
  return new NextResponse(JSON.stringify({ message: "Login successful!" }), {
  status: 200,
  headers: {"Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=7200; SameSite=Lax; Secure`, },
  });
  } catch (error) {
  console.error("Error during login:", error);
  return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
  }

//get detail user
export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value; 

    if (!token) {
      console.error("No token provided");
      return new NextResponse(JSON.stringify({ error: "No token provided" }), { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET);
    const userId = decoded.id;

    const connection = await createConnection(); 
    const [user] = await connection.query(
      "SELECT admin_id, admin_name, admin_role FROM admin WHERE admin_id = ?",
      [userId]
    );

    if (user.length === 0) {
      console.error("User not found");
      return new NextResponse(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("Error in /api/auth:", error);
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 }); 
  }
}

//update password
export async function PUT(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { current_password, new_password, confirm_password } = await req.json();

    if (!current_password || !new_password || !confirm_password) {
      return new NextResponse(JSON.stringify({ error: "All fields are required" }), { status: 400 });
    }

    if (new_password !== confirm_password) {
      return new NextResponse(JSON.stringify({ error: "New password and confirm password do not match" }), { status: 400 });
    }


    const connection = await createConnection();

    const [user] = await connection.query("SELECT admin_password FROM admin WHERE admin_id = ?", [userId]);

    if (user.length === 0) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(current_password, user[0].admin_password);

    if (!passwordMatch) {
      return new NextResponse(JSON.stringify({ error: "Incorrect current password" }), { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);

    await connection.query("UPDATE admin SET admin_password = ? WHERE admin_id = ?", [hashedPassword, userId]);


    return new NextResponse(JSON.stringify({ message: "Password updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error changing password:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to change password" }), { status: 500 });
  }
}