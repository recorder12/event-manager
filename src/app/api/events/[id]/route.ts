import {
  findEventById,
  findEventWithActivities,
  updateEvent,
} from "@/app/services/event";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await findEventById({ id: params.id });
    return NextResponse.json({ success: true, data: event }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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
    const eventId = params.id;
    const body = await req.json();

    const updatedEvent = await updateEvent({
      eventId,
      userId,
      ...body,
    });

    return NextResponse.json(
      { success: true, data: updatedEvent },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
