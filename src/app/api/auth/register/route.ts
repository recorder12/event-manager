import { signUp, SignUpErrors } from "@/app/services/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password, last_name, first_name, reference_code } =
      await req.json();
    await signUp({
      email,
      password,
      last_name,
      first_name,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (
      [
        SignUpErrors.EMAIL_PASSWORD_REQUIRED,
        SignUpErrors.NAME_REQUIRED,
        SignUpErrors.INVALID_EMAIL,
        SignUpErrors.PASSWORD_LENGTH,
        SignUpErrors.EMAIL_EXISTS,
        SignUpErrors.FAIL_TO_CREATE_USER,
      ].includes(error.message)
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error("Error in POST /api/signin", error);
    return NextResponse.json(
      { success: false, error: "Failed to Sign Up" },
      { status: 500 }
    );
  }
}
