import dbConnect from "@/lib/mongodb";
import {
  Activity,
  Event,
  EventDocument,
  EventType,
  EventVisibility,
} from "../models/event";
import { Organization } from "../models/organization.schema";

type GetEventInput = {
  id: string;
};

type CreateEventInput = {
  userId: string;
  organizationId: string;
  description: string;
  location: string;
  event_date: Date;
  type?: string;
  visibility?: string;
};

type FindEventsInput = {
  organizationId: string;
};

export async function createEvent({
  userId,
  organizationId,
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

    const isOwner = organization.owner.toString() === userId;
    const isAdmin = organization.members.some(
      (member) => member.user.toString() === userId && member.role === "ADMIN"
    );

    if (!isOwner && !isAdmin) {
      throw new Error("User is not authorized to create an event");
    }

    const newEvent = await Event.create({
      organization: organizationId,
      description,
      createdBy: userId,
      location,
      event_date,
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

export async function findEventWithActivities({
  id,
}: GetEventInput): Promise<any> {
  await dbConnect();
  const event = await Event.findById(id).lean();
  if (!event) throw new Error("Event not found");

  const activities = await Activity.find({ event: id }).lean();

  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const is_closed = new Date(event.event_date) <= twoHoursLater;

  return {
    ...event,
    is_closed,
    activities,
  };
}

export async function findEventById({
  id,
}: GetEventInput): Promise<EventDocument> {
  try {
    await dbConnect();
    const event = await Event.findById(id)
      .populate({
        path: "activities",
      })
      .lean();

    if (!event) throw new Error("Event not found");

    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const is_closed = new Date(event.event_date) <= twoHoursLater;

    event.is_closed = is_closed;
    await event.save();

    return event;
  } catch (error) {
    throw error;
  }
}
