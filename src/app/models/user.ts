import mongoose, { Model, Schema } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface UserDocument extends Document {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  country_code?: string;
  phone_number?: string;
  role: UserRole;
  status: UserStatus;
  email_verified?: boolean;
  phone_verified?: boolean;
  profile_picture?: string;
  profile: string;
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
    country_code: { type: String }, // without +
    phone_number: { type: String }, // without dashes
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
  },
  { timestamps: true, versionKey: false }
);

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
