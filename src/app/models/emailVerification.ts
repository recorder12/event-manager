import mongoose, { Model, Schema, Document } from "mongoose";

export interface EmailVerificationDocument extends Document {
  email: string;
  code: string;
}

const EmailVerificationSchema = new Schema<EmailVerificationDocument>(
  {
    email: { type: String, required: true },
    code: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const EmailVerification: Model<EmailVerificationDocument> =
  (mongoose.models.Verification as Model<EmailVerificationDocument>) ||
  mongoose.model<EmailVerificationDocument>(
    "Verification",
    EmailVerificationSchema
  );
