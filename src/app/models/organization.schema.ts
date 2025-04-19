import mongoose, { Model, Schema, Document } from "mongoose";

// Enum 정의 방식 변경
export enum OrganizationRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum OrganizationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum OrganizationType {
  PERSONAL = "PERSONAL",
  BUSINESS = "BUSINESS",
}

export enum OrganizationVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

interface OrganizationMember {
  user: mongoose.Types.ObjectId;
  role: OrganizationRole;
}

export interface OrganizationDocument extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  members: OrganizationMember[];
  status: OrganizationStatus;
  type: OrganizationType;
  visibility: OrganizationVisibility;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationMemberSchema = new Schema<OrganizationMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: Object.values(OrganizationRole),
      required: true,
    },
  },
  { _id: false }
);

const OrganizationSchema: Schema<OrganizationDocument> = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    members: [OrganizationMemberSchema],
    status: {
      type: String,
      enum: Object.values(OrganizationStatus),
      default: OrganizationStatus.ACTIVE,
    },
    type: {
      type: String,
      enum: Object.values(OrganizationType),
      default: OrganizationType.PERSONAL,
    },
    visibility: {
      type: String,
      enum: Object.values(OrganizationVisibility),
      default: OrganizationVisibility.PUBLIC,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Organization: Model<OrganizationDocument> =
  mongoose.models.Organization ||
  mongoose.model<OrganizationDocument>("Organization", OrganizationSchema);
