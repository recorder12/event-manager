import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createActivity } from "@/app/services/activity";
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

    const { eventId, title, description } = await req.json();

    const activity = await createActivity({
      userId,
      role,
      eventId,
      title,
      description,
    });

    return NextResponse.json(
      { success: true, data: activity },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating activity:", error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

// add activity
// edit activity
// delete activity

// add part
// edit part
// delete part
