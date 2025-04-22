import { resetPassword, ResetPasswordErrors } from "@/app/services/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, user_type } = await req.json();
    await resetPassword({
      email,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if ([ResetPasswordErrors.INVALID_EMAIL].includes(error.message)) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error("Error in POST /api/password/reset", error);
    return NextResponse.json(
      { success: false, error: "Failed to Reset Password" },
      { status: 500 }
    );
  }
}
