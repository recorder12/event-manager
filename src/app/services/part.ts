import dbConnect from "@/lib/mongodb";
import { Activity, Event } from "@/app/models/event";
import { Organization } from "@/app/models/organization.schema";

type AddPartInput = {
  userId: string;
  activityId: string;
  name: string;
  limitation: number;
};

type UpdatePartInput = {
  userId: string;
  activityId: string;
  partId: string;
  name?: string;
  limitation?: number;
};

type DeletePartInput = {
  userId: string;
  activityId: string;
  partId: string;
};

export async function addPartToActivity({
  userId,
  activityId,
  name,
  limitation,
}: AddPartInput) {
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
    throw new Error("User is not authorized to add part");
  }

  activity.parts.push({
    name,
    limitation,
    applicants: [],
    participants: [],
  });

  await activity.save();
  return activity;
}

export async function updatePartInActivity({
  userId,
  activityId,
  partId,
  name,
  limitation,
}: UpdatePartInput) {
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
    throw new Error("User is not authorized to update part");
  }

  const part = activity.parts.find(
    (p) => p._id?.toString() === partId.toString()
  );
  if (!part) throw new Error("Part not found");

  if (name !== undefined) part.name = name;
  if (limitation !== undefined) part.limitation = limitation;

  await activity.save();
  return part;
}

export async function deletePartFromActivity({
  userId,
  activityId,
  partId,
}: DeletePartInput): Promise<void> {
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
    throw new Error("User is not authorized to delete part");
  }

  const partExists = activity.parts.some(
    (p) => p._id?.toString() === partId.toString()
  );
  if (!partExists) throw new Error("Part not found");

  activity.parts = activity.parts.filter(
    (p) => p._id?.toString() !== partId.toString()
  );

  await activity.save();
}
