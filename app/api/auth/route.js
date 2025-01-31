// // pages/api/auth.js
// import { createConnection } from "app/lib/db"; // Import dari db.js

// export default async function handler(req, res) {
//   if (req.method === "POST") {
//     const { username, password } = req.body;

//     try {
//       const connection = await createConnection();
//       const [rows] = await connection.query(
//         "SELECT * FROM admin WHERE admin_name = ?",
//         [username]
//       );

//       if (rows.length === 0 || rows[0].admin_password !== password) {
//         return res.status(401).json({ error: "Invalid credentials" });
//       }

//       const admin = rows[0];
//       return res.status(200).json({ id: admin.id, name: admin.admin_name });
//     } catch (error) {
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//   } else {
//     res.status(405).json({ error: "Method Not Allowed" });
//   }
// }
import { createConnection } from "app/lib/db";
import { sign } from "jsonwebtoken"; // Import jwt for signing the token
import { NextResponse } from "next/server";

// Secret should be securely stored in .env
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  const { username, password } = await req.json();

  try {
    const connection = await createConnection();
    const [rows] = await connection.query(
      "SELECT * FROM admin WHERE admin_name = ?",
      [username]
    );
    console.log("Rows:", rows);
    if (rows.length === 0 || rows[0].admin_password !== password) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401 }
      );
    }

    const admin = rows[0];

    // Generate a JWT token after successful login
    const token = sign(
      { id: admin.admin_id, name: admin.admin_name },
      JWT_SECRET,
      { expiresIn: "2h" } 
    );

    // Send the token in the response
    return new NextResponse(
      JSON.stringify({ message: "Login successful!" }),
      {
        status: 200,
        headers: {
          "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict`,
        },
      }
    );
  } catch (error) {
    console.error("Error during login:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

