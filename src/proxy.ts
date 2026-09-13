import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/vocabulary") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/languages") ||
    pathname.startsWith("/settings");

  if (isProtected) {
    // Check for any valid auth session cookie
    const hasSession =
      request.cookies.has("lingo_fox_session") ||
      request.cookies.has("grwly_session") ||
      request.cookies.has("lingo_fox_dev_session") ||
      request.cookies.has("grwly_dev_session") ||
      request.cookies.has("__Secure-neon-auth.session_token") ||
      request.cookies.has("neon-auth.session_token") ||
      request.cookies.has("__Secure-better-auth.session_token") ||
      request.cookies.has("better-auth.session_token");

    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vocabulary/:path*",
    "/review/:path*",
    "/languages/:path*",
    "/settings/:path*",
  ],
};
