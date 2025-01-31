// File: app/api/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  return new NextResponse(
    JSON.stringify({ message: "Logout successful" }),
    {
      status: 200,
      headers: {
        "Set-Cookie": `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`,
      },
    }
  );
}
