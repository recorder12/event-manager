import { DateTime } from "luxon";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import {
  Activity,
  Event,
  EventDocument,
  EventType,
  EventVisibility,
} from "../models/event";
import { Organization } from "../models/organization.schema";
import { User, UserRole } from "../models/user.schema";

type GetEventInput = {
  id: string;
};

type CreateEventInput = {
  userId: string;
  role: UserRole;
  organizationId: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  type?: string;
  visibility?: string;
};

type FindEventsInput = {
  organizationId: string;
};

type UpdateEventInput = {
  eventId: string;
  userId: string;
  role: UserRole;
  title?: string;
  description?: string;
  location?: string;
  event_date?: string;
  type?: string;
  visibility?: string;
};

type EventDeleteInput = {
  eventId: string;
  userId: string;
  role: UserRole;
};

export async function createEvent({
  userId,
  role,
  organizationId,
  title,
  description,
  location,
  event_date,
  type = EventType.PUBLIC,
  visibility = EventVisibility.PUBLIC,
}: CreateEventInput): Promise<EventDocument> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    if (!organizationId) {
      throw new Error("Organization ID is required");
    }
    if (!description) {
      throw new Error("Description is required");
    }
    if (!location) {
      throw new Error("Location is required");
    }
    if (!event_date) {
      throw new Error("Event date is required");
    }

    await dbConnect();

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      throw new Error("Organization not found");
    }

    const isSiteAdmin = role === UserRole.ADMIN;
    const isOwner = organization.owner.toString() === userId;
    const isAdmin = organization.members.some(
      (member) => member.user.toString() === userId && member.role === "ADMIN"
    );

    if (!isSiteAdmin && !isOwner && !isAdmin) {
      throw new Error("User is not authorized to create an event");
    }

    const newEvent = await Event.create({
      organization: organizationId,
      title,
      description,
      createdBy: userId,
      location,
      event_date: DateTime.fromISO(event_date as string, {
        zone: "America/New_York",
      })
        .toUTC()
        .toJSDate(),
      type,
      visibility,
    });

    return newEvent;
  } catch (error) {
    throw error;
  }
}

export async function findEventsByOrganization({
  organizationId,
}: FindEventsInput): Promise<EventDocument[]> {
  await dbConnect();
  return Event.find({ organization: organizationId, isDeleted: false })
    .sort({ event_date: 1 })
    .lean();
}

export async function findEventById({
  id,
}: GetEventInput): Promise<EventDocument> {
  try {
    await dbConnect();
    const event = await Event.findById(id)
      .populate({
        path: "activities",
        populate: {
          path: "parts",
          populate: {
            path: "applicants",
            select: "first_name last_name",
          },
        },
      })
      .populate({
        path: "confirmed_participants",
        select: "first_name last_name",
      })
      .populate({
        path: "absent_applicants",
        select: "first_name last_name",
      });

    if (!event) throw new Error("Event not found");

    // 현재 시각을 New York 타임존 기준으로 가져옴
    const now = DateTime.now().setZone("America/New_York");

    // 이벤트 시간을 New York 기준으로 해석
    const eventTime = DateTime.fromJSDate(event.event_date).setZone(
      "America/New_York"
    );

    // 현재 시각 기준으로 2시간 이후보다 event가 이르면 closed
    const is_closed = eventTime <= now.plus({ hours: 2 });

    event.is_closed = is_closed;
    await event.save();

    return event;
  } catch (error) {
    throw error;
  }
}

export async function updateEvent({
  eventId,
  role,
  userId,
  title,
  description,
  location,
  event_date,
  type,
  visibility,
}: UpdateEventInput): Promise<EventDocument> {
  try {
    await dbConnect();

    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    const organization = await Organization.findById(event.organization);
    if (!organization) throw new Error("Organization not found");

    const isSiteAdmin = role === UserRole.ADMIN;
    const isOwner = organization.owner.toString() === userId;
    const isAdmin = organization.members.some(
      (member) => member.user.toString() === userId && member.role === "ADMIN"
    );

    if (!isSiteAdmin && !isOwner && !isAdmin) {
      throw new Error("User is not authorized to edit this event");
    }

    if (title) {
      event.title = title;
    }
    if (description) event.description = description;
    if (location) event.location = location;
    if (event_date) {
      event.event_date = DateTime.fromISO(event_date as string, {
        zone: "America/New_York",
      })
        .toUTC()
        .toJSDate();
    }
    if (type) event.type = type as any;
    if (visibility) event.visibility = visibility as any;

    await event.save();

    return event;
  } catch (error) {
    throw error;
  }
}

export async function confirmParticipants({
  userId,
  role,
  eventId,
  parts,
}: {
  userId: string;
  role: UserRole;
  eventId: string;
  parts: { partId: string; participants: string[] }[];
}) {
  try {
    await dbConnect();

    const event = await Event.findById(eventId).populate({
      path: "activities",
      populate: {
        path: "parts",
        populate: {
          path: "applicants",
          select: "_id",
        },
      },
    });

    if (!event) throw new Error("Event not found");

    const organization = await Organization.findById(event.organization);
    if (!organization) throw new Error("Organization not found");

    const isSiteAdmin = role === UserRole.ADMIN;
    const isOwner = organization.owner.toString() === userId;
    const isAdmin = organization.members.some(
      (m) => m.user.toString() === userId && m.role === "ADMIN"
    );

    if (!isSiteAdmin && !isOwner && !isAdmin) {
      throw new Error("Unauthorized");
    }

    if (!event.activities) throw new Error("No activities found");

    const allConfirmedIds = new Set<string>();
    const allAppliedIds = new Set<string>();
    const allApplicants = new Map<string, string>(); // userId -> partId

    for (const activity of event.activities as any[]) {
      for (const part of activity.parts) {
        const matching = parts.find((p) => p.partId === part._id.toString());
        if (matching) {
          part.participants = matching.participants.map(
            (id) => new mongoose.Types.ObjectId(id)
          );
        }

        // applicants 기록
        part.applicants.forEach((applicant: any) => {
          allAppliedIds.add(applicant._id.toString());
          allApplicants.set(applicant._id.toString(), part._id.toString());
        });

        if (matching) {
          matching.participants.forEach((pid) => {
            allConfirmedIds.add(pid);
          });
        }
      }
    }

    await event.save();

    // 이제 사용자 업데이트
    // const memberIds = organization.members.map((m) => m.user.toString()); // now just for every users
    const users = await User.find();

    const memberIds = users.map((m) => m._id.toString());
    const notAppliedUsers = memberIds.filter((id) => !allAppliedIds.has(id));
    const absentApplicants = Array.from(allAppliedIds).filter(
      (id) => !allConfirmedIds.has(id)
    );

    console.log("memberIds:", memberIds);
    console.log("notAppliedUsers:", notAppliedUsers);
    console.log("absentApplicants", absentApplicants);

    for (const uid of notAppliedUsers) {
      await User.findByIdAndUpdate(uid, {
        $push: { not_applied: { event: event._id, date: event.event_date } },
        $inc: { not_applied_count: 1 },
      });
    }

    for (const uid of absentApplicants) {
      await User.findByIdAndUpdate(uid, {
        $push: {
          not_participated: { event: event._id, date: event.event_date },
        },
        $inc: { not_participated_count: 1 },
      });
    }

    event.confirmed_participants = Array.from(allConfirmedIds).map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    event.absent_applicants = absentApplicants.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    event.is_participants_confirmed = true;
    await event.save();

    console.log(event);

    return {
      confirmed: event.confirmed_participants.length,
      absent: event.absent_applicants.length,
      not_applied: notAppliedUsers.length,
    };
  } catch (error) {
    throw error;
  }
}

export async function deleteEvent({
  eventId,
  userId,
  role,
}: EventDeleteInput): Promise<EventDocument> {
  try {
    await dbConnect();

    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");
    const organization = await Organization.findById(event.organization);
    if (!organization) throw new Error("Organization not found");
    const isSiteAdmin = role === UserRole.ADMIN;
    const isOwner = organization.owner.toString() === userId;
    const isAdmin = organization.members.some(
      (member) => member.user.toString() === userId && member.role === "ADMIN"
    );
    if (!isSiteAdmin && !isOwner && !isAdmin) {
      throw new Error("User is not authorized to delete this event");
    }
    event.isDeleted = true;
    await event.save();
    return event;
  } catch (error) {
    throw error;
  }
}
