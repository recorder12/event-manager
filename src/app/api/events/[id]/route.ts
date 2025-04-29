import { deleteEvent, findEventById, updateEvent } from "@/app/services/event";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/app/models/user.schema";
import { authOptions } from "../../auth/authOptions";

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
    const role = session.user.role as UserRole;
    const eventId = params.id;
    const body = await req.json();

    const updatedEvent = await updateEvent({
      eventId,
      userId,
      role,
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
    const eventId = params.id;

    // Implement the delete logic here
    await deleteEvent({
      eventId,
      userId,
      role,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
