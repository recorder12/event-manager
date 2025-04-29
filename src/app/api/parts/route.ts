import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { addPartToActivity } from "@/app/services/part";
import { UserRole } from "@/app/models/user.schema";
import { authOptions } from "../auth/authOptions";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role as UserRole;

    const { order, activityId, name, limitation } = await req.json();

    const updatedActivity = await addPartToActivity({
      userId,
      role,
      order,
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

// activity Card has title, description, and parts
// parts: [ { name, limitation } ]

// if create confirm -> create activity -> get activityId -> create parts

// if edit confirm -> update activity -> check if parts are updated, update parts

// if delete confirm -> delete activity -> delete parts
