import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/forgot-password", "/api/auth"];
const studentRoutes = ["/dashboard", "/wallet", "/favorites", "/lessons"];
const teacherRoutes = ["/teacher"];
const adminRoutes = ["/admin"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow API routes for auth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow course browsing (public)
  if (pathname.startsWith("/courses") && !pathname.includes("/edit")) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!session?.user) {
    const loginUrl = new URL("/auth/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (session.user as { role?: string }).role;

  // Check teacher routes
  if (teacherRoutes.some((route) => pathname.startsWith(route))) {
    if (role !== "TEACHER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
  }

  // Redirect teachers away from student dashboard
  if (pathname === "/dashboard" && role === "TEACHER") {
    return NextResponse.redirect(new URL("/teacher/dashboard", req.nextUrl.origin));
  }
  
  if (pathname === "/dashboard" && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl.origin));
  }

  // Check admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
