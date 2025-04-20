import dbConnect from "@/lib/mongodb";
import { Activity, ActivityDocument, Event } from "@/app/models/event";
import { Organization } from "@/app/models/organization.schema";

type CreateActivityInput = {
  userId: string;
  eventId: string;
  title: string;
  description?: string;
  start_time?: Date;
  end_time?: Date;
};

type UpdateActivityInput = {
  userId: string;
  activityId: string;
  title?: string;
  description?: string;
  start_time?: Date;
  end_time?: Date;
};

type DeleteActivityInput = {
  userId: string;
  activityId: string;
};

export async function createActivity({
  userId,
  eventId,
  title,
  description,
  start_time,
  end_time,
}: CreateActivityInput): Promise<ActivityDocument> {
  await dbConnect();

  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  const organization = await Organization.findById(event.organization);
  if (!organization) throw new Error("Organization not found");

  const isOwner = organization.owner.toString() === userId;
  const isAdmin = organization.members.some(
    (member) => member.user.toString() === userId && member.role === "ADMIN"
  );
  if (!isOwner && !isAdmin) {
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
}

export async function updateActivity({
  userId,
  activityId,
  title,
  description,
  start_time,
  end_time,
}: UpdateActivityInput): Promise<ActivityDocument> {
  await dbConnect();

  const activity = await Activity.findById(activityId);
  if (!activity) throw new Error("Activity not found");

  const event = await Event.findById(activity.event);
  if (!event) throw new Error("Event not found");

  const organization = await Organization.findById(event.organization);
  if (!organization) throw new Error("Organization not found");

  const isOwner = organization.owner.toString() === userId;
  const isAdmin = organization.members.some(
    (member) => member.user.toString() === userId && member.role === "ADMIN"
  );
  if (!isOwner && !isAdmin) {
    throw new Error("User is not authorized to update activity");
  }

  if (title !== undefined) activity.title = title;
  if (description !== undefined) activity.description = description;
  if (start_time !== undefined) activity.start_time = start_time;
  if (end_time !== undefined) activity.end_time = end_time;

  await activity.save();
  return activity;
}

export async function deleteActivity({
  userId,
  activityId,
}: DeleteActivityInput): Promise<void> {
  await dbConnect();

  const activity = await Activity.findById(activityId);
  if (!activity) throw new Error("Activity not found");

  const event = await Event.findById(activity.event);
  if (!event) throw new Error("Event not found");

  const organization = await Organization.findById(event.organization);
  if (!organization) throw new Error("Organization not found");

  const isOwner = organization.owner.toString() === userId;
  const isAdmin = organization.members.some(
    (member) => member.user.toString() === userId && member.role === "ADMIN"
  );
  if (!isOwner && !isAdmin) {
    throw new Error("User is not authorized to delete activity");
  }

  await activity.deleteOne();

  // Event.activities에서도 제거
  event.activities = event.activities?.filter(
    (id) => id.toString() !== activity.id.toString()
  );
  await event.save();
}
