import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { createActivity } from "@/app/services/activity";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { eventId, title, description, start_time, end_time } =
      await req.json();

    const activity = await createActivity({
      userId,
      eventId,
      title,
      description,
      start_time,
      end_time,
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
