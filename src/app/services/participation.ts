import dbConnect from "@/lib/mongodb";
import { Activity } from "@/app/models/event";

export async function applyToPart({
  userId,
  activityId,
  partId,
}: {
  userId: string;
  activityId: string;
  partId: string;
}) {
  try {
    await dbConnect();

    const activity = await Activity.findById(activityId);
    if (!activity) throw new Error("Activity not found");

    const part = activity.parts.find((p) => p._id?.toString() === partId);
    if (!part) throw new Error("Part not found");

    // 이미 신청한 다른 part에서 제거
    activity.parts.forEach((p) => {
      p.applicants = p.applicants.filter((id) => id.toString() !== userId);
    });

    if (part.applicants.length >= part.limitation) {
      throw new Error("Maximum participants reached");
    }

    // 현재 파트에 추가
    if (!part.applicants.some((id) => id.toString() === userId)) {
      part.applicants.push(userId as any);
    }
    await activity.save();
    return part;
  } catch (error) {
    throw error;
  }
}

export async function cancelApplication({
  userId,
  activityId,
  partId,
}: {
  userId: string;
  activityId: string;
  partId: string;
}) {
  await dbConnect();

  const activity = await Activity.findById(activityId);
  if (!activity) throw new Error("Activity not found");

  const part = activity.parts.find((p) => p._id?.toString() === partId);
  if (!part) throw new Error("Part not found");

  part.applicants = part.applicants.filter((id) => id.toString() !== userId);

  await activity.save();
  return part;
}
