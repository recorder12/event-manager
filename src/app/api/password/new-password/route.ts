import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { setNewPassword, setNewPasswordErrors } from "@/app/services/user";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = session.user;
    const { password } = await req.json();

    await setNewPassword({
      userId: id,
      password,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (
      [
        setNewPasswordErrors.INVALID_ID,
        setNewPasswordErrors.USER_NOT_FOUND,
        setNewPasswordErrors.USER_INACTIVE,
        setNewPasswordErrors.PASSWORD_REQUIRED,
        setNewPasswordErrors.PASSWORD_LENGTH,
      ].includes(error.message)
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error("Error in POST /api/password/set", error);
    return NextResponse.json(
      { success: false, error: "Failed to Set Password" },
      { status: 500 }
    );
  }
}
