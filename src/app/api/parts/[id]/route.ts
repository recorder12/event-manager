import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import {
  updatePartInActivity,
  deletePartFromActivity,
} from "@/app/services/part";
import { UserRole } from "@/app/models/user.schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role as UserRole;

    const body = await req.json();
    const { activityId, name, limitation } = body;

    console.log(name, limitation, params.id);

    const updatedPart = await updatePartInActivity({
      userId,
      role,
      activityId,
      partId: params.id,
      name,
      limitation,
    });

    return NextResponse.json(
      { success: true, data: updatedPart },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error patching part:", error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role as UserRole;

    const { searchParams } = new URL(req.url); // ★ 수정
    const activityId = searchParams.get("activityId");

    if (!activityId) {
      return NextResponse.json(
        { message: "Missing activityId" },
        { status: 400 }
      );
    }

    console.log("Deleting part with ID:", params.id);
    console.log("Activity ID:", activityId);

    await deletePartFromActivity({
      role,
      userId,
      activityId,
      partId: params.id,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting part:", error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
