import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // We can't decode JWT easily in edge runtime without external libs or specific setup, 
  // but we can rely on the client redirect logic for the root /dashboard. 
  // For /admin specifically, we can just ensure they have a token. The backend enforces security.
  // Actually, we can decode the payload part of the JWT since it's just base64.
  
  const token = request.cookies.get("refreshToken")?.value || ""; 
  // Wait, the Next.js middleware won't see localStorage accessToken.
  // It only sees cookies. We set refreshToken as httpOnly in backend.
  
  // Basic protection: if trying to access /admin and no token cookie, redirect to login
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/admin/:path*"],
};
