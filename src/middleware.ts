import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "./app/models/user.schema";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // /admin 경로는 ADMIN만 접근 가능
  if (url.pathname.startsWith("/admin")) {
    if (!token || token.role !== UserRole.ADMIN) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // /account 경로는 로그인된 유저만 접근 가능
  if (url.pathname.startsWith("/account")) {
    if (!token || !token.email) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
