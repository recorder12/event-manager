// /app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { createEvent } from "@/app/services/event";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { organization_id, description, location, event_date } =
      await req.json();

    const newEvent = await createEvent({
      userId,
      organizationId: organization_id,
      description,
      location,
      event_date,
    });

    return NextResponse.json(
      { success: true, data: newEvent },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
