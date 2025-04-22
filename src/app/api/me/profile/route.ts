// /api/me/profile/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getProfile, ProfileErrors } from "@/app/services/user";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = session.user;

    const result = await getProfile({
      userId: id,
    });

    return NextResponse.json(
      {
        email: result.email,
        first_name: result.first_name,
        last_name: result.last_name,
        profile: result.profile,
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
