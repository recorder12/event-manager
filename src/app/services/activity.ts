import dbConnect from "@/lib/mongodb";
import { Activity, ActivityDocument, Event } from "@/app/models/event";
import { Organization } from "@/app/models/organization.schema";
import { UserRole } from "../models/user.schema";

type CreateActivityInput = {
  userId: string;
  role: UserRole;
  eventId: string;
  title: string;
  description?: string;
  start_time?: Date;
  end_time?: Date;
};

type UpdateActivityInput = {
  userId: string;
  role: UserRole;
  activityId: string;
  title?: string;
  description?: string;
  start_time?: Date;
  end_time?: Date;
};

type DeleteActivityInput = {
  userId: string;
  role: UserRole;
  activityId: string;
};

export async function createActivity({
  userId,
  role,
  eventId,
  title,
  description,
  start_time,
  end_time,
}: CreateActivityInput): Promise<ActivityDocument> {
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
    if (!isSiteAdmin! && isOwner && !isAdmin) {
      throw new Error("User is not authorized to add activity");
    }

    const newActivity = (await Activity.create({
      event: eventId,
      title,
      description,
      start_time,
      end_time,
      parts: [],
    })) as ActivityDocument;

    event.activities = event.activities || []; // safety check
    event.activities.push(newActivity.id);
    await event.save();

    return newActivity;
  } catch (error) {
    throw error;
  }
}

export async function updateActivity({
  userId,
  role,
  activityId,
  title,
  description,
  start_time,
  end_time,
}: UpdateActivityInput): Promise<ActivityDocument> {
  try {
    await dbConnect();

    const activity = await Activity.findById(activityId);
    if (!activity) throw new Error("Activity not found");

    const event = await Event.findById(activity.event);
    if (!event) throw new Error("Event not found");

    const organization = await Organization.findById(event.organization);
    if (!organization) throw new Error("Organization not found");

    const isSiteAdmin = role === UserRole.ADMIN;
    const isOwner = organization.owner.toString() === userId;
    const isAdmin = organization.members.some(
      (member) => member.user.toString() === userId && member.role === "ADMIN"
    );
    if (!isSiteAdmin && !isOwner && !isAdmin) {
      throw new Error("User is not authorized to update activity");
    }

    if (title !== undefined) activity.title = title;
    if (description !== undefined) activity.description = description;
    if (start_time !== undefined) activity.start_time = start_time;
    if (end_time !== undefined) activity.end_time = end_time;

    await activity.save();
    return activity;
  } catch (error) {
    throw error;
  }
}

export async function deleteActivity({
  userId,
  role,
  activityId,
}: DeleteActivityInput): Promise<void> {
  try {
    await dbConnect();

    const activity = await Activity.findById(activityId);
    if (!activity) throw new Error("Activity not found");

    const event = await Event.findById(activity.event);
    if (!event) throw new Error("Event not found");

    const organization = await Organization.findById(event.organization);
    if (!organization) throw new Error("Organization not found");

    const isSiteAdmin = role === UserRole.ADMIN;
    const isOwner = organization.owner.toString() === userId;
    const isAdmin = organization.members.some(
      (member) => member.user.toString() === userId && member.role === "ADMIN"
    );
    if (!isSiteAdmin && !isOwner && !isAdmin) {
      throw new Error("User is not authorized to delete activity");
    }

    await activity.deleteOne();

    // Event.activities에서도 제거
    event.activities = event.activities?.filter(
      (id) => id.toString() !== activity.id.toString()
    );
    await event.save();
  } catch (error) {
    throw error;
  }
}
