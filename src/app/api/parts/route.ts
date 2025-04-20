import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { addPartToActivity } from "@/app/services/part";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { activityId, name, limitation } = await req.json();

    const updatedActivity = await addPartToActivity({
      userId: session.user.id,
      activityId,
      name,
      limitation,
    });

    return NextResponse.json(
      { success: true, data: updatedActivity },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding part:", error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
