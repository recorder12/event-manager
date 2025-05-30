// /app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createEvent, findEventsByOrganization } from "@/app/services/event";
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

    const { organization_id, title, description, location, event_date } =
      await req.json();

    const newEvent = await createEvent({
      userId,
      role,
      organizationId: "680700e57d0f9760fd3645ec",
      title,
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // const organizationId = searchParams.get("organizationId");
    const organizationId = "680700e57d0f9760fd3645ec";

    if (!organizationId) {
      return NextResponse.json(
        { message: "organizationId required" },
        { status: 400 }
      );
    }

    const events = await findEventsByOrganization({ organizationId });
    return NextResponse.json({ success: true, data: events }, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
