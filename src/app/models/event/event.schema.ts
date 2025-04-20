import mongoose, { Model, Schema, Document } from "mongoose";
import { EventStatus, EventType, EventVisibility } from "./event.enums";

export interface EventDocument extends Document {
  organization: mongoose.Types.ObjectId;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  location: string;
  event_date: Date;
  is_closed: boolean;
  is_participants_confirmed: boolean;
  confirmed_participants: mongoose.Types.ObjectId[];
  absent_applicants: mongoose.Types.ObjectId[];
  status: EventStatus;
  type: EventType;
  visibility: EventVisibility;
  isDeleted: boolean;
  activities?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema<EventDocument> = new Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    description: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: { type: String, required: true },
    event_date: { type: Date, required: true },
    is_closed: { type: Boolean, default: false },
    is_participants_confirmed: { type: Boolean, default: false },

    confirmed_participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    absent_applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.ACTIVE,
    },
    type: {
      type: String,
      enum: Object.values(EventType),
      default: EventType.PUBLIC,
    },
    visibility: {
      type: String,
      enum: Object.values(EventVisibility),
      default: EventVisibility.PUBLIC,
    },
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const Event: Model<EventDocument> =
  mongoose.models.Event || mongoose.model<EventDocument>("Event", EventSchema);
