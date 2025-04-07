import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// For demo purposes, set this to true to simulate being logged in
const DEMO_AUTHENTICATED = true;

export function middleware(request: NextRequest) {
  // In a real app, you would check for a session token or authentication cookie
  // For now, let's just redirect certain paths for demo purposes

  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/forgot-password"];

  // All protected pages that should have the dashboard layout
  const protectedPaths = [
    "/dashboard",
    "/datasets",
    "/training",
    "/detection",
    "/inference",
    "/logs",
    "/settings",
    "/profile",
    "/notifications",
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.includes(pathname);
  
  // Check if it's a protected dashboard path
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // For demo purposes, we'll check our demo value
  // In a real app, you would check for a valid auth token/cookie
  const isAuthenticated = DEMO_AUTHENTICATED;

  // Special case for root path
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? "/dashboard" : "/login", request.url),
    );
  }

  // Special case for logout
  if (pathname === "/logout") {
    // In a real app, you would invalidate the session/token here
    // For demo purposes, we'll just redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect unauthenticated users to login
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from login pages to dashboard
  if (isPublicPath && isAuthenticated && pathname !== "/forgot-password") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
