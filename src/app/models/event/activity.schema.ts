import mongoose, { Model, Schema, Document } from "mongoose";
import { Part, PartSchema } from "./part.schema";

export interface ActivityDocument extends Document {
  event: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  start_time?: Date;
  end_time?: Date;
  parts: Part[];
}

const ActivitySchema = new Schema<ActivityDocument>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    title: { type: String, required: true },
    description: { type: String },
    start_time: { type: Date },
    end_time: { type: Date },
    parts: [PartSchema],
  },
  { timestamps: true, versionKey: false }
);

export const Activity: Model<ActivityDocument> =
  mongoose.models.Activity ||
  mongoose.model<ActivityDocument>("Activity", ActivitySchema);
