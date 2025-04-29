import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cancelApplication } from "@/app/services/participation";
import { authOptions } from "@/app/api/auth/authOptions";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { activityId } = await req.json();

    const result = await cancelApplication({
      userId: session.user.id,
      activityId,
      partId: params.id,
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("Error in POST:", error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
