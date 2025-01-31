import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const cookie = req.cookies.get("token");
  const token = cookie?.value; // Extract the token value

  console.log("Retrieved token from cookies:", token);

  if (!token || typeof token !== "string") {
    console.error("Invalid or missing token. Redirecting to login.");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verify the JWT using jose
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log("Decoded token payload:", payload); // Debugging the payload

    // If the token is valid, proceed to the next middleware or route
    return NextResponse.next();
  } catch (error) {
    console.error("Invalid token. Redirecting to login:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"], // Protect only the dashboard routes
};
