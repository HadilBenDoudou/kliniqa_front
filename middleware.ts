import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || "1vx3GbPyEbYgWUByUjUfnWzHzRbia2fSxnLjsmFEFzrXUoVkF7RNHkDwucMYez9ywHjjoLuuFD8kX7u8GrIpSQ==";
const protectedRoutes = ["/admin", "/profile", "/users/edit"];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  console.log("Middleware - Requested path:", request.nextUrl.pathname);
  console.log("Middleware - Token from cookies:", token);

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  console.log("Middleware - Is protected route:", isProtectedRoute);

  if (isProtectedRoute) {
    if (!token) {
      console.log("Middleware - No token found, redirecting to /login");
      return NextResponse.redirect(new URL("/login", request.url), 302);
    }

    try {
      const secret = new TextEncoder().encode(SUPABASE_JWT_SECRET);
      const { payload } = await jwtVerify(token, secret, {
        issuer: "https://tpkcublwqohtfitpyria.supabase.co/auth/v1",
        audience: "authenticated",
      });
      console.log("Middleware - JWT Payload:", payload);

      const userRole = payload.role;
      if (!userRole || userRole !== "authenticated") {
        console.log("Middleware - Insufficient permissions");
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }

      console.log("Middleware - Token valid, proceeding to requested route");
      const response = NextResponse.next();
      response.headers.set("x-user-id", payload.sub as string);
      response.headers.set("x-user-email", payload.email as string);
      return response;
    } catch (error) {
      console.error("Middleware - JWT verification failed:", error);
      return NextResponse.redirect(new URL("/login", request.url), 302);
    }
  }

  console.log("Middleware - Not a protected route, proceeding");
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/users/edit/:path*"],
};