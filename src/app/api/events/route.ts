import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { Event } from "@/app/models/event/event.schema";
import { Organization } from "@/app/models/organization.schema";
import mongoose from "mongoose";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const body = await req.json();
    const {
      organizationId,
      location,
      event_date,
      activities = [],
      status,
      type,
      visibility,
    } = body;

    // 🔐 조직 권한 체크
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    const isAuthorized = organization.members.some(
      (m) =>
        m.user.toString() === userId.toString() &&
        (m.role === "OWNER" || m.role === "ADMIN")
    );

    if (!isAuthorized) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const newEvent = await Event.create({
      organization: organization._id,
      createdBy: userId,
      location,
      event_date,
      activities,
      status,
      type,
      visibility,
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
