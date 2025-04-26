import mongoose, { Schema } from "mongoose";

export interface Part {
  _id?: mongoose.Types.ObjectId;
  order: number;
  name: string;
  limitation: number;
  applicants: mongoose.Types.ObjectId[];
  participants: mongoose.Types.ObjectId[];
}

export const PartSchema = new Schema<Part>(
  {
    order: { type: Number, required: true },
    name: { type: String, required: true },
    limitation: { type: Number, required: true },
    applicants: [{ type: Schema.Types.ObjectId, ref: "User", unique: true }],
    participants: [{ type: Schema.Types.ObjectId, ref: "User", unique: true }],
  },
  { _id: true, timestamps: true, versionKey: false }
);
