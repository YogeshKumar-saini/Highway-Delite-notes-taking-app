// models/noteModel.ts

import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  user: mongoose.Schema.Types.ObjectId;
  title: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema: Schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Note = mongoose.model<INote>("Note", noteSchema);
