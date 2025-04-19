import mongoose, { Schema } from "mongoose";

export interface Part {
  _id?: mongoose.Types.ObjectId;
  name: string;
  limitation: number;
  applicants: mongoose.Types.ObjectId[];
  participants: mongoose.Types.ObjectId[];
}

export const PartSchema = new Schema<Part>(
  {
    name: { type: String, required: true },
    limitation: { type: Number, required: true },
    applicants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: true, timestamps: false }
);
