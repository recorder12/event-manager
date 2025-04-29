import { VerificationErrors, verifyEmail } from "@/app/services/verification";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || "";

    if (!code) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    await verifyEmail({ code });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (
      [
        VerificationErrors.CODE_NOT_FOUND,
        VerificationErrors.USER_NOT_FOUND,
      ].includes(error.message)
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error("Error in POST /api/signin", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
