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
    
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log("Decoded token payload:", payload); 

    // Extract role from payload
    const adminRole = payload.role; 

    // Cek apakah user mengakses dashboard/user/
    if (req.nextUrl.pathname.startsWith("/dashboard/user/create") || req.nextUrl.pathname.startsWith("/dashboard/user/list") || req.nextUrl.pathname.startsWith("/dashboard/invoice/approve") || req.nextUrl.pathname.startsWith("/dashboard/invoice/archive")) {
      if (adminRole !== "Super Admin") {
        console.error("Unauthorized access. Redirecting to dashboard.");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

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
