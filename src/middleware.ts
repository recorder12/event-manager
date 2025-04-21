import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "./app/models/user.schema";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = await getToken({ req });

  // 관리자 전용 경로 필터링
  // it is for CMNY management only
  // later it will be changed for event control website
  if (url.pathname.startsWith("/admin")) {
    if (!token || token.role !== UserRole.ADMIN) {
      url.pathname = "/"; // 권한 없으면 홈으로 리디렉트
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
