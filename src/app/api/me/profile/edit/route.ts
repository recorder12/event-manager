// /api/me/profile/route.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { editProfile, ProfileErrors } from "@/app/services/user";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = session.user;
    const { first_name, last_name, profile } = await req.json();

    await editProfile({
      userId: id,
      first_name,
      last_name,
      profile,
    });

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (
      [
        ProfileErrors.INVALID_ID,
        ProfileErrors.USER_NOT_FOUND,
        ProfileErrors.USER_INACTIVE,
      ].includes(error.message)
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
