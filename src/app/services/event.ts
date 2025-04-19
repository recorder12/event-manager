import dbConnect from "@/lib/mongodb";
import {
  Event,
  EventDocument,
  EventType,
  EventVisibility,
} from "../models/event";

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

export async function findEventById({
  id,
}: GetEventInput): Promise<EventDocument> {
  try {
    await dbConnect();

    const result = await Event.findById(id);

    if (!result) {
      throw new Error("Event not found");
    }
    return result;
  } catch (error) {
    throw error;
  }
}
