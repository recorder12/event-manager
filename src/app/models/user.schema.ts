import mongoose, { Model, Schema } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

interface MissedEvent {
  event: mongoose.Types.ObjectId;
  date: Date;
}

export interface UserDocument extends Document {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  email_verified?: boolean;
  phone_verified?: boolean;
  profile_picture?: string;
  profile: string;
  not_applied: MissedEvent[];
  not_applied_count: number;
  not_participated: MissedEvent[]; // ❗️이름 추천: `not_participated`
  not_participated_count: number;
}

const UserSchema: Schema<UserDocument> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 1024,
    },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email_verified: { type: Boolean, default: false },
    phone_verified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      required: true,
      default: UserStatus.ACTIVE,
    },
    profile_picture: { type: String },
    profile: { type: String },
    not_applied: [
      {
        event: { type: Schema.Types.ObjectId, ref: "Event" },
        date: { type: Date, required: true },
      },
    ],
    not_applied_count: { type: Number, default: 0 },
    not_participated: [
      {
        event: { type: Schema.Types.ObjectId, ref: "Event" },
        date: { type: Date, required: true },
      },
    ],
    not_participated_count: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
